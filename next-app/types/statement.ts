export type StatementStatus = "draft" | "submitted" | "approved" | "rejected" | "paid";

export interface Statement {
  _id: string;
  contractorCompanyId: string;
  contractId: string;
  periodStart: string; // کلید شمسی
  periodEnd: string;
  reportIds: string[];
  totalAmount: number;
  status: StatementStatus;
  createdByUserId: string;
  decidedByUserId?: string | null;
  decisionNote?: string | null;
  createdAt: string;
  contractorName?: string;
  contractTitle?: string;
}

export const STATEMENT_STATUS_LABEL: Record<StatementStatus, string> = {
  draft: "پیش‌نویس",
  submitted: "ارسال‌شده",
  approved: "تایید شده",
  rejected: "رد شده",
  paid: "پرداخت‌شده",
};
