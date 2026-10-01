import { WorkReport } from "@/models/work-report";
import { ReportItem } from "@/models/report-item";
import { ExtraWorkItem } from "@/models/extra-work-item";
import { ApprovalEvent } from "@/models/approval-event";
import { Attachment } from "@/models/attachment";
import { User } from "@/models/user";
import { WorkGroup } from "@/models/work-group";
import { visibleGroupIds } from "@/lib/permissions";
import { ApiError } from "@/lib/api-handler";

/** فیلتر گزارش‌های قابل‌دیدن کاربر (ایزولاسیون گروه‌ها + نقش‌ها) */
export async function reportsVisibleTo(user: InstanceType<typeof User>, extra: Record<string, unknown> = {}) {
  const base: Record<string, unknown> = { reportType: "work_report", ...extra };
  if (user.role === "DEPUTY") return WorkReport.find(base);
  if (user.role === "CONTRACTOR_CEO" || user.role === "RESIDENT_REP") {
    return WorkReport.find({ ...base, companyId: user.companyId });
  }
  const vis = await visibleGroupIds(user);
  if (vis === "ALL") return WorkReport.find(base);
  return WorkReport.find({ ...base, $or: [{ groupId: { $in: vis } }, { userId: user._id }] });
}

export async function assertReportReadable(user: InstanceType<typeof User>, reportId: string) {
  const report = await WorkReport.findById(reportId);
  if (!report) throw new ApiError("گزارش پیدا نشد.", "NOT_FOUND", 404);
  const { canSeeReport } = await import("@/lib/permissions");
  const allowed = await canSeeReport(user, report);
  if (!allowed) throw new ApiError("دسترسی به این گزارش مجاز نیست.", "FORBIDDEN", 403);
  return report;
}

/** جزییات کامل گزارش برای صفحه‌ی بررسی */
export async function reportFullDetails(reportId: string) {
  const [report, items, extras, events, attachments] = await Promise.all([
    WorkReport.findById(reportId).lean(),
    ReportItem.find({ reportId }).lean(),
    ExtraWorkItem.find({ reportId }).lean(),
    ApprovalEvent.find({ reportId }).sort({ createdAt: 1 }).lean(),
    Attachment.find({ reportId }).lean(),
  ]);
  if (!report) throw new ApiError("گزارش پیدا نشد.", "NOT_FOUND", 404);
  const userIds = [report.userId, ...events.map((e) => e.actorUserId)];
  const users = await User.find({ _id: { $in: userIds } }).select("fullName role").lean();
  const nameOf = (id: unknown) => users.find((u) => String(u._id) === String(id))?.fullName || "—";
  const group = report.groupId ? await WorkGroup.findById(report.groupId).select("name").lean() : null;
  const totalAmount = items.reduce((s, i) => s + (i.totalAmount || 0), 0) + extras.reduce((s, e) => s + (e.mappedAmount || 0), 0);
  return {
    ...report,
    userName: nameOf(report.userId),
    groupName: group?.name || "—",
    totalAmount,
    items, extras, attachments,
    events: events.map((e) => ({ ...e, actorName: nameOf(e.actorUserId) })),
  };
}
