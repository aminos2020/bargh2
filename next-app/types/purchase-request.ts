import type { TaskPriority } from "./task";

export type PurchaseStatus = "draft" | "submitted" | "approved" | "rejected" | "purchased";

export interface PurchaseRequest {
  _id: string;
  requesterUserId: string;
  companyId: string;
  contractId?: string | null;
  title: string;
  itemDescription: string;
  quantity: number;
  estimatedPrice: number;
  reason?: string;
  priority: TaskPriority;
  status: PurchaseStatus;
  decidedByUserId?: string | null;
  decisionNote?: string | null;
  purchasedAt?: string | null;
  createdAt: string;
  requesterName?: string;
  deciderName?: string;
}

export const PURCHASE_STATUS_LABEL: Record<PurchaseStatus, string> = {
  draft: "پیش‌نویس",
  submitted: "ثبت‌شده",
  approved: "تایید شده",
  rejected: "رد شده",
  purchased: "خریداری‌شده",
};
