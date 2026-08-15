import { WorkReport } from "@/models/work-report";
import { ReportItem } from "@/models/report-item";
import { ExtraWorkItem } from "@/models/extra-work-item";
import { Attachment } from "@/models/attachment";
import { ApprovalEvent } from "@/models/approval-event";
import { PriceItem } from "@/models/price-item";
import { WorkGroup } from "@/models/work-group";
import { GroupMembership } from "@/models/group-membership";
import { User } from "@/models/user";
import { ApiError } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";
import { notify, notifyGroupRole } from "@/lib/notification";
import { saveImageFromDataUrl } from "@/lib/storage";
import { jalaliKey } from "@/lib/date";
import type { ReportStatus } from "@/types";

export interface CreateReportPayload {
  onBehalfUserId?: string | null;
  groupId: string;
  contractId: string;
  reportDateJ?: string;
  description?: string;
  taskReferenceId?: string | null;
  offlineClientId?: string | null;
  items: { priceItemId: string; quantity: number }[];
  extras: { description: string }[];
  photos: { fileName: string; mimeType: string; dataUrl: string }[];
  idempotencyKey: string;
}

/**
 * ثبت گزارش کار (تکنسین یا سرپرست).
 * - idempotencyKey جلوی ثبت تکراری (آفلاین/آنلاین) را می‌گیرد.
 * - سرپرست می‌تواند به نام یکی از اعضای گروه ثبت کند؛ گزارشِ خودش مستقیم به کارشناس کارفرما می‌رود.
 */
export async function createReport(actor: InstanceType<typeof User>, input: CreateReportPayload) {
  if (!input.items.length && !input.extras.length) throw new ApiError("حداقل یک آیتم بها یا کار اضافی اضافه کنید.", "EMPTY_REPORT");

  // Idempotency
  const existing = await WorkReport.findOne({ userId: actor._id, idempotencyKey: input.idempotencyKey });
  if (existing) return { reportId: String(existing._id), duplicated: true };

  const group = await WorkGroup.findById(input.groupId);
  if (!group || !group.isActive) throw new ApiError("گروه انتخابی معتبر نیست.", "BAD_GROUP");

  const isMember = await GroupMembership.findOne({ userId: actor._id, groupId: group._id, isActive: true });
  if (!isMember) throw new ApiError("شما عضو این گروه نیستید.", "FORBIDDEN", 403);

  // ثبت به نام نیروی گروه (فقط سرپرست)
  let owner: InstanceType<typeof User> = actor;
  if (input.onBehalfUserId) {
    if (actor.role !== "GROUP_SUPERVISOR") throw new ApiError("فقط سرپرست گروه می‌تواند به نام نیرو گزارش ثبت کند.", "FORBIDDEN", 403);
    const member = await GroupMembership.findOne({ userId: input.onBehalfUserId, groupId: group._id, isActive: true });
    if (!member) throw new ApiError("نیروی انتخابی عضو این گروه نیست.", "BAD_MEMBER");
    const target = await User.findById(input.onBehalfUserId);
    if (!target || !target.isActive) throw new ApiError("نیروی انتخابی معتبر نیست.", "BAD_MEMBER");
    owner = target;
  }

  const supervisorOwn = owner.role === "GROUP_SUPERVISOR";
  const status: ReportStatus = supervisorOwn ? "expert_review" : "supervisor_review";

  const report = await WorkReport.create({
    reportType: "work_report",
    userId: owner._id,
    companyId: owner.companyId || actor.companyId || group.companyId,
    groupId: group._id,
    contractId: input.contractId || group.contractId,
    unitId: group.workUnitId || null,
    reportDateJ: input.reportDateJ || jalaliKey(),
    status,
    description: input.description?.trim() || undefined,
    taskReferenceId: input.taskReferenceId || null,
    offlineClientId: input.offlineClientId || null,
    idempotencyKey: input.idempotencyKey,
    submittedAt: new Date(),
    currentReviewerRole: supervisorOwn ? "EMPLOYER_EXPERT" : "GROUP_SUPERVISOR",
  });

  // آیتم‌ها با snapshot قیمت و عنوان
  for (const it of input.items) {
    const pi = await PriceItem.findById(it.priceItemId);
    if (!pi || !pi.isActive) continue;
    await ReportItem.create({
      reportId: report._id, priceItemId: pi._id,
      titleSnapshot: pi.title, unitSnapshot: pi.unit, unitPriceSnapshot: pi.unitPrice,
      quantity: it.quantity, totalAmount: pi.unitPrice * it.quantity, status: "pending",
    });
  }

  for (const ex of input.extras) {
    await ExtraWorkItem.create({ reportId: report._id, description: ex.description.trim(), status: "pending" });
  }

  for (const ph of input.photos) {
    try {
      const { storagePath, size } = await saveImageFromDataUrl(ph.dataUrl, ph.mimeType);
      await Attachment.create({ reportId: report._id, kind: "image", fileName: ph.fileName, mimeType: "image/jpeg", size, storagePath, uploadStatus: "uploaded" });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[attachment-failed]", e);
    }
  }

  await ApprovalEvent.create({ reportId: report._id, actorUserId: actor._id, actorRole: actor.role, action: "submit", fromStatus: "draft", toStatus: status });
  await logAudit({
    actorUserId: actor._id, actorRole: actor.role, action: "ارسال گزارش کار", entity: "report", entityId: String(report._id),
    detail: `گروه: ${group.name}${owner._id.toString() !== actor._id.toString() ? ` — به نام: ${owner.fullName}` : ""}${supervisorOwn ? " — مستقیم به کارشناس کارفرما" : ""}`,
  });

  if (!supervisorOwn) {
    if (group.supervisorUserId && String(group.supervisorUserId) !== String(actor._id)) {
      await notify(group.supervisorUserId, "گزارش جدید در انتظار بررسی", `${owner.fullName} گزارش کاری ثبت کرد و منتظر بررسی شماست.`, "report", String(report._id));
    }
  } else {
    await notifyGroupRole(group._id, "employer_expert", "گزارش سرپرست گروه در انتظار بررسی", `${owner.fullName} (سرپرست ${group.name}) گزارش کاری ثبت کرد.`, "report", String(report._id));
  }
  if (owner._id.toString() !== actor._id.toString()) {
    await notify(owner._id, "گزارشی برای شما ثبت شد", `${actor.fullName} یک گزارش کاری به نام شما ارسال کرد.`, "report", String(report._id));
  }

  return { reportId: String(report._id), duplicated: false, status };
}
