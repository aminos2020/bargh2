import { WorkReport } from "@/models/work-report";
import { ReportItem } from "@/models/report-item";
import { ApprovalEvent } from "@/models/approval-event";
import { ScoreEvent } from "@/models/score-event";
import { User } from "@/models/user";
import { canActOnReport } from "@/lib/permissions";
import { ApiError } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";
import { notify, notifyGroupRole, notifyCompanyRoles } from "@/lib/notification";
import { SCORE_PER_APPROVED_REPORT } from "@/lib/constants";
import type { ApprovalAction, ReportStatus } from "@/types";

const ACTION_LABEL: Record<ApprovalAction, string> = {
  submit: "ارسال", resubmit: "ارسال مجدد", approve: "تایید", reject: "رد", redo: "درخواست انجام مجدد", dispute: "ثبت اختلاف",
};

/**
 * گردش گزارش کار:
 * تکنسین -> سرپرست -> کارشناس کارفرما -> رییس کارفرما -> (تایید نهایی) -> معاونت + رییس شرکت
 */
export async function applyApproval(
  actor: InstanceType<typeof User>,
  reportId: string,
  action: Extract<ApprovalAction, "approve" | "reject" | "redo" | "dispute">,
  reason?: string
) {
  const report = await WorkReport.findById(reportId);
  if (!report) throw new ApiError("گزارش پیدا نشد.", "NOT_FOUND", 404);
  if (!canActOnReport(actor, report)) throw new ApiError("در این مرحله اجازه‌ی انجام این عملیات را ندارید.", "FORBIDDEN", 403);
  if ((action === "reject" || action === "redo" || action === "dispute") && !reason?.trim()) {
    throw new ApiError("ثبت دلیل برای این عملیات الزامی است.", "REASON_REQUIRED");
  }

  const fromStatus = report.status as ReportStatus;
  let toStatus: ReportStatus;
  let itemStatus: "approved" | "rejected" | "redo" = "approved";

  if (action === "approve") {
    toStatus = actor.role === "GROUP_SUPERVISOR" ? "expert_review" : actor.role === "EMPLOYER_EXPERT" ? "employer_ceo_review" : "approved";
  } else if (action === "reject") {
    toStatus = "rejected";
    itemStatus = "rejected";
  } else if (action === "redo") {
    toStatus = "redo_requested";
    itemStatus = "redo";
  } else {
    toStatus = "disputed";
    itemStatus = "rejected";
  }

  report.status = toStatus;
  report.currentReviewerRole = toStatus === "expert_review" ? "EMPLOYER_EXPERT" : toStatus === "employer_ceo_review" ? "EMPLOYER_CEO" : null;
  await report.save();
  await ReportItem.updateMany({ reportId: report._id, status: "pending" }, { status: itemStatus });

  await ApprovalEvent.create({
    reportId: report._id, actorUserId: actor._id, actorRole: actor.role,
    action, fromStatus, toStatus, reason: reason?.trim() || undefined,
  });
  await logAudit({
    actorUserId: actor._id, actorRole: actor.role,
    action: `${ACTION_LABEL[action]} گزارش کار`, entity: "report", entityId: String(report._id),
    detail: reason ? `دلیل: ${reason.trim()}` : undefined,
  });

  const owner = await User.findById(report.userId);

  if (toStatus === "expert_review") {
    await notifyGroupRole(report.groupId, "employer_expert", "گزارش در انتظار بررسی", `${owner?.fullName} گزارشی ثبت کرد که توسط سرپرست تایید شده است.`, "report", String(report._id));
  } else if (toStatus === "employer_ceo_review") {
    await notifyGroupRole(report.groupId, "employer_ceo", "در انتظار تایید نهایی", `گزارش ${owner?.fullName} توسط کارشناس کارفرما تایید شد.`, "report", String(report._id));
  } else if (toStatus === "approved") {
    // امتیاز مثبت در رزومه‌ی کاری
    await ScoreEvent.create({
      userId: report.userId, reportId: report._id, score: SCORE_PER_APPROVED_REPORT,
      reason: "تایید نهایی گزارش کار", createdByRole: actor.role,
    });
    if (owner) await notify(owner._id, "گزارش شما تایید نهایی شد", "گزارش کار شما تایید نهایی شد و امتیاز آن در رزومه‌ی شما ثبت شد.", "report", String(report._id));
    await notifyCompanyRoles(report.companyId, ["CONTRACTOR_CEO"], "تایید نهایی گزارش", `گزارش ${owner?.fullName} تایید نهایی شد؛ قابل استفاده در صورت‌وضعیت است.`, "report", String(report._id));
  } else if (toStatus === "rejected" || toStatus === "redo_requested") {
    if (owner) {
      await notify(
        owner._id,
        toStatus === "rejected" ? "گزارش شما رد شد" : "درخواست انجام مجدد",
        reason || (toStatus === "rejected" ? "گزارش شما رد شده است." : "لطفا گزارش را اصلاح و مجددا ارسال کنید."),
        "report",
        String(report._id)
      );
    }
  } else if (toStatus === "disputed") {
    await notifyCompanyRoles(report.companyId, ["CONTRACTOR_CEO"], "گزارش دارای اختلاف شد", `گزارش ${owner?.fullName} توسط رییس کارفرما دارای اختلاف ثبت شد.`, "report", String(report._id));
  }

  return { reportId: String(report._id), status: toStatus };
}

/** ارسال مجدد توسط صاحب گزارش بعد از redo_requested */
export async function resubmitReport(actor: InstanceType<typeof User>, reportId: string) {
  const report = await WorkReport.findById(reportId);
  if (!report) throw new ApiError("گزارش پیدا نشد.", "NOT_FOUND", 404);
  if (String(report.userId) !== String(actor._id)) throw new ApiError("فقط صاحب گزارش می‌تواند آن را مجددا ارسال کند.", "FORBIDDEN", 403);
  if (report.status !== "redo_requested") throw new ApiError("این گزارش در وضعیت ارسال مجدد نیست.", "BAD_STATE");

  const supervisorOwn = actor.role === "GROUP_SUPERVISOR";
  const toStatus: ReportStatus = supervisorOwn ? "expert_review" : "supervisor_review";
  const fromStatus = report.status as ReportStatus;
  report.status = toStatus;
  report.currentReviewerRole = supervisorOwn ? "EMPLOYER_EXPERT" : "GROUP_SUPERVISOR";
  await report.save();
  await ReportItem.updateMany({ reportId: report._id, status: "redo" }, { status: "pending" });
  await ApprovalEvent.create({ reportId: report._id, actorUserId: actor._id, actorRole: actor.role, action: "resubmit", fromStatus, toStatus });
  await logAudit({ actorUserId: actor._id, actorRole: actor.role, action: "ارسال مجدد گزارش", entity: "report", entityId: String(report._id) });

  if (supervisorOwn) {
    await notifyGroupRole(report.groupId, "employer_expert", "گزارش مجدد سرپرست ارسال شد", `${actor.fullName} گزارش را اصلاح و دوباره ارسال کرد.`, "report", String(report._id));
  } else {
    const { WorkGroup } = await import("@/models/work-group");
    const group = await WorkGroup.findById(report.groupId);
    if (group?.supervisorUserId && String(group.supervisorUserId) !== String(actor._id)) {
      await notify(group.supervisorUserId, "گزارش مجدد ارسال شد", `${actor.fullName} گزارش را اصلاح و دوباره ارسال کرد.`, "report", String(report._id));
    }
  }
  return { reportId: String(report._id), status: toStatus };
}
