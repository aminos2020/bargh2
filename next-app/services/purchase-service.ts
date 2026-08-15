import { PurchaseRequest } from "@/models/purchase-request";
import { ApiError } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";
import { notifyCompanyRoles } from "@/lib/notification";
import { User } from "@/models/user";

export interface CreatePurchasePayload {
  contractId?: string | null;
  title: string;
  itemDescription: string;
  quantity: number;
  estimatedPrice: number;
  reason?: string;
  priority: "low" | "medium" | "high" | "urgent";
}

export async function createPurchaseRequest(actor: InstanceType<typeof User>, input: CreatePurchasePayload, submitImmediately = true) {
  if (!actor.companyId) throw new ApiError("کاربر شما به شرکتی متصل نیست.", "BAD_STATE");
  const doc = await PurchaseRequest.create({
    requesterUserId: actor._id,
    companyId: actor.companyId,
    contractId: input.contractId || null,
    title: input.title.trim(),
    itemDescription: input.itemDescription.trim(),
    quantity: input.quantity,
    estimatedPrice: input.estimatedPrice,
    reason: input.reason?.trim() || undefined,
    priority: input.priority,
    status: submitImmediately ? "submitted" : "draft",
  });
  await logAudit({ actorUserId: actor._id, actorRole: actor.role, action: "ثبت درخواست خرید", entity: "purchase", entityId: String(doc._id), detail: doc.title });
  if (submitImmediately) {
    await notifyCompanyRoles(actor.companyId, ["RESIDENT_REP", "CONTRACTOR_CEO"], "درخواست خرید جدید", `${actor.fullName} درخواست «${doc.title}» را ثبت کرد.`, "purchase", String(doc._id));
  }
  return { id: String(doc._id) };
}

export async function decidePurchaseRequest(actor: InstanceType<typeof User>, id: string, action: "approved" | "rejected", note?: string) {
  const doc = await PurchaseRequest.findById(id);
  if (!doc) throw new ApiError("درخواست پیدا نشد.", "NOT_FOUND", 404);
  if (doc.status !== "submitted") throw new ApiError("این درخواست در وضعیت تصمیم‌گیری نیست.", "BAD_STATE");
  doc.status = action;
  doc.decidedByUserId = actor._id;
  doc.decisionNote = note?.trim() || undefined;
  await doc.save();
  await logAudit({ actorUserId: actor._id, actorRole: actor.role, action: action === "approved" ? "تایید درخواست خرید" : "رد درخواست خرید", entity: "purchase", entityId: id, detail: doc.title });
  await notifyCompanyRoles(doc.companyId, ["TECHNICIAN", "GROUP_SUPERVISOR"], action === "approved" ? "درخواست خرید شما تایید شد" : "درخواست خرید شما رد شد", doc.title, "purchase", id);
  return { id, status: doc.status };
}

export async function markPurchased(actor: InstanceType<typeof User>, id: string, note?: string) {
  const doc = await PurchaseRequest.findById(id);
  if (!doc) throw new ApiError("درخواست پیدا نشد.", "NOT_FOUND", 404);
  if (doc.status !== "approved") throw new ApiError("فقط درخواست تاییدشده قابل ثبت خرید است.", "BAD_STATE");
  doc.status = "purchased";
  doc.purchasedAt = new Date();
  doc.decisionNote = note?.trim() || doc.decisionNote;
  await doc.save();
  await logAudit({ actorUserId: actor._id, actorRole: actor.role, action: "ثبت نتیجه خرید", entity: "purchase", entityId: id, detail: doc.title });
  return { id, status: doc.status };
}
