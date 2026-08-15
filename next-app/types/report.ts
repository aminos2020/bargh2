export type ReportStatus =
  | "draft" | "submitted" | "supervisor_review" | "expert_review" | "employer_ceo_review"
  | "approved" | "rejected" | "redo_requested" | "disputed" | "settled";

export type ReportType = "work_report" | "daily_report";
export type ItemStatus = "pending" | "approved" | "rejected" | "edited" | "redo";
export type ExtraStatus = "pending" | "mapped" | "rejected";

export interface WorkReport {
  _id: string;
  reportType: ReportType;
  userId: string;
  companyId: string;
  groupId?: string | null;
  contractId: string;
  unitId?: string | null;
  reportDateJ: string;
  status: ReportStatus;
  description?: string;
  taskReferenceId?: string | null;
  offlineClientId?: string | null;
  idempotencyKey: string;
  submittedAt?: string;
  currentReviewerRole?: string | null;
  createdAt: string;
  updatedAt?: string;
  userName?: string;
  groupName?: string;
  totalAmount?: number;
  itemCount?: number;
}

export interface ReportItem {
  _id: string;
  reportId: string;
  priceItemId: string;
  titleSnapshot: string;
  unitSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  totalAmount: number;
  status: ItemStatus;
}

export interface ExtraWorkItem {
  _id: string;
  reportId: string;
  description: string;
  status: ExtraStatus;
  mappedPriceItemId?: string | null;
  mappedQuantity?: number | null;
  mappedAmount?: number | null;
  mappedByUserId?: string | null;
  mappingNote?: string | null;
  createdAt: string;
  groupName?: string;
  companyName?: string;
  reportDateJ?: string;
  technicianName?: string;
}

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  draft: "پیش‌نویس",
  submitted: "ارسال‌شده",
  supervisor_review: "در انتظار سرپرست",
  expert_review: "در انتظار کارشناس کارفرما",
  employer_ceo_review: "در انتظار تایید نهایی",
  approved: "تایید نهایی",
  rejected: "رد شده",
  redo_requested: "انجام مجدد",
  disputed: "اختلاف",
  settled: "تسویه‌شده",
};
