export type Role =
  | "DEPUTY"
  | "EMPLOYER_CEO"
  | "EMPLOYER_EXPERT"
  | "CONTRACTOR_CEO"
  | "RESIDENT_REP"
  | "GROUP_SUPERVISOR"
  | "TECHNICIAN";

export interface Organization {
  id: string;
  name: string;
  type: "deputy" | "employer" | "contractor";
  description?: string;
  isActive: boolean;
}

export interface Company {
  id: string;
  name: string;
  code: string;
  contractorCeoUserId?: string | null;
  phone?: string;
  address?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export type ContractType = "volume" | "unit_price" | "other";
export type ContractStatus = "active" | "completed" | "terminated";

export interface Contract {
  id: string;
  title: string;
  contractType: ContractType;
  contractorCompanyId: string;
  startDateJ: string;
  endDateJ: string;
  status: ContractStatus;
  publicNotes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  fullName: string;
  mobile: string;
  role: Role;
  orgId: string;
  companyId?: string | null;
  unitId?: string | null;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface WorkUnit {
  id: string;
  name: string;
  orgId: string;
  description?: string;
  isActive: boolean;
}

export interface WorkGroup {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  contractId: string;
  workUnitId?: string | null;
  supervisorUserId?: string | null;
  isActive: boolean;
  createdAt: string;
}

export type MembershipType = "member" | "supervisor" | "employer_expert" | "employer_ceo";

export interface GroupMembership {
  id: string;
  userId: string;
  groupId: string;
  membershipType: MembershipType;
  isActive: boolean;
}

export interface PriceItem {
  id: string;
  code: string;
  title: string;
  unit: string;
  unitPrice: number;
  contractId: string;
  groupIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "open" | "in_progress" | "done" | "cancelled";

export interface Task {
  id: string;
  title: string;
  description?: string;
  createdByUserId: string;
  assignedUserIds: string[];
  assignedGroupIds: string[];
  contractId?: string | null;
  priority: TaskPriority;
  dueDateJ?: string | null;
  status: TaskStatus;
  sourceRole: Role;
  createdAt: string;
}

export type ReportStatus =
  | "draft"
  | "submitted"
  | "supervisor_review"
  | "expert_review"
  | "employer_ceo_review"
  | "approved"
  | "rejected"
  | "redo_requested"
  | "disputed"
  | "settled";

export type ReportType = "work_report" | "daily_report";

export interface WorkReport {
  id: string;
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
  idempotencyKey: string;
  submittedAt?: string;
  currentReviewerRole?: Role | null;
  createdAt: string;
  updatedAt?: string;
}

export type ItemStatus = "pending" | "approved" | "rejected" | "edited" | "redo";

export interface ReportItem {
  id: string;
  reportId: string;
  priceItemId: string;
  titleSnapshot: string;
  unitSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  totalAmount: number;
  status: ItemStatus;
}

export type ExtraStatus = "pending" | "mapped" | "rejected";

export interface ExtraWorkItem {
  id: string;
  reportId: string;
  description: string;
  status: ExtraStatus;
  mappedPriceItemId?: string | null;
  mappedQuantity?: number | null;
  mappedAmount?: number | null;
  mappedByUserId?: string | null;
  mappingNote?: string | null;
  createdAt: string;
}

export interface Attachment {
  id: string;
  reportId?: string | null;
  taskId?: string | null;
  purchaseRequestId?: string | null;
  kind: "image" | "file";
  fileName: string;
  dataUrl?: string;
  size: number;
  createdAt: string;
}

export type ApprovalAction = "submit" | "resubmit" | "approve" | "reject" | "redo" | "dispute";

export interface ApprovalEvent {
  id: string;
  reportId: string;
  actorUserId: string;
  actorRole: Role;
  action: ApprovalAction;
  fromStatus: ReportStatus;
  toStatus: ReportStatus;
  reason?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorRole: Role;
  action: string;
  entity: string;
  entityId: string;
  detail?: string;
  createdAt: string;
}

export interface ScoreEvent {
  id: string;
  userId: string;
  reportId: string;
  score: number;
  reason: string;
  createdByRole: Role;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  entity?: "report" | "task" | "statement" | "purchase" | "extra" | null;
  entityId?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export type PurchaseStatus = "draft" | "submitted" | "approved" | "rejected" | "purchased";

export interface PurchaseRequest {
  id: string;
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
}

export type StatementStatus = "draft" | "submitted" | "approved" | "rejected" | "paid";

export interface Statement {
  id: string;
  contractorCompanyId: string;
  contractId: string;
  periodStartJ: string;
  periodEndJ: string;
  reportIds: string[];
  totalAmount: number;
  status: StatementStatus;
  createdByUserId: string;
  decidedByUserId?: string | null;
  decisionNote?: string | null;
  createdAt: string;
}

export interface OtpState {
  mobile: string;
  code: string;
  expiresAt: number;
  attempts: number;
  limitedUntil?: number;
}

export interface DB {
  version: number;
  seq: number;
  organizations: Organization[];
  companies: Company[];
  contracts: Contract[];
  users: User[];
  workUnits: WorkUnit[];
  groups: WorkGroup[];
  memberships: GroupMembership[];
  priceItems: PriceItem[];
  tasks: Task[];
  reports: WorkReport[];
  reportItems: ReportItem[];
  extraItems: ExtraWorkItem[];
  attachments: Attachment[];
  approvalEvents: ApprovalEvent[];
  auditLogs: AuditLog[];
  scoreEvents: ScoreEvent[];
  notifications: AppNotification[];
  purchaseRequests: PurchaseRequest[];
  statements: Statement[];
  otp: OtpState | null;
}

export interface Session {
  userId: string;
  role: Role;
  orgId: string;
  companyId?: string | null;
  loginAt: string;
}

export interface SyncItem {
  id: string;
  endpoint: string;
  payload: unknown;
  idempotencyKey: string;
  status: "pending" | "sending" | "synced" | "failed";
  attempts: number;
  lastError?: string;
  createdAt: string;
}

/* ------------------------------ labels & meta ------------------------------ */

export const ROLE_LABEL: Record<Role, string> = {
  DEPUTY: "معاونت بهره‌برداری",
  EMPLOYER_CEO: "رییس کارفرما",
  EMPLOYER_EXPERT: "کارشناس کارفرما",
  CONTRACTOR_CEO: "رییس شرکت پیمانکار",
  RESIDENT_REP: "نماینده مقیم",
  GROUP_SUPERVISOR: "سرپرست گروه",
  TECHNICIAN: "کارشناس شرکت پیمانکار",
};

export const ROLE_PANEL: Record<Role, string> = {
  DEPUTY: "deputy",
  EMPLOYER_CEO: "employer-ceo",
  EMPLOYER_EXPERT: "employer-expert",
  CONTRACTOR_CEO: "contractor-ceo",
  RESIDENT_REP: "resident",
  GROUP_SUPERVISOR: "supervisor",
  TECHNICIAN: "technician",
};

export interface StatusMeta {
  label: string;
  badge: string;
  dot: string;
}

export const REPORT_STATUS_META: Record<ReportStatus, StatusMeta> = {
  draft: { label: "پیش‌نویس", badge: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
  submitted: { label: "ارسال‌شده", badge: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  supervisor_review: { label: "در انتظار سرپرست", badge: "bg-amber-50 text-warn-700 border-amber-200", dot: "bg-amber-500" },
  expert_review: { label: "در انتظار کارشناس کارفرما", badge: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  employer_ceo_review: { label: "در انتظار تایید نهایی", badge: "bg-cyan-50 text-cyan-700 border-cyan-200", dot: "bg-cyan-500" },
  approved: { label: "تایید نهایی", badge: "bg-ok-50 text-ok-700 border-green-200", dot: "bg-ok-600" },
  rejected: { label: "رد شده", badge: "bg-bad-50 text-bad-700 border-red-200", dot: "bg-bad-600" },
  redo_requested: { label: "انجام مجدد", badge: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-400" },
  disputed: { label: "اختلاف", badge: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  settled: { label: "تسویه‌شده", badge: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500" },
};

export const TASK_STATUS_META: Record<TaskStatus, StatusMeta> = {
  open: { label: "باز", badge: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  in_progress: { label: "در حال انجام", badge: "bg-amber-50 text-warn-700 border-amber-200", dot: "bg-amber-500" },
  done: { label: "انجام شده", badge: "bg-ok-50 text-ok-700 border-green-200", dot: "bg-ok-600" },
  cancelled: { label: "لغو شده", badge: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400" },
};

export const PRIORITY_META: Record<TaskPriority, StatusMeta> = {
  low: { label: "کم", badge: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
  medium: { label: "متوسط", badge: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  high: { label: "زیاد", badge: "bg-amber-50 text-warn-700 border-amber-200", dot: "bg-amber-500" },
  urgent: { label: "فوری", badge: "bg-bad-50 text-bad-700 border-red-200", dot: "bg-bad-600" },
};

export const PURCHASE_STATUS_META: Record<PurchaseStatus, StatusMeta> = {
  draft: { label: "پیش‌نویس", badge: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
  submitted: { label: "ثبت‌شده", badge: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  approved: { label: "تایید شده", badge: "bg-ok-50 text-ok-700 border-green-200", dot: "bg-ok-600" },
  rejected: { label: "رد شده", badge: "bg-bad-50 text-bad-700 border-red-200", dot: "bg-bad-600" },
  purchased: { label: "خریداری‌شده", badge: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500" },
};

export const STATEMENT_STATUS_META: Record<StatementStatus, StatusMeta> = {
  draft: { label: "پیش‌نویس", badge: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
  submitted: { label: "ارسال‌شده", badge: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  approved: { label: "تایید شده", badge: "bg-ok-50 text-ok-700 border-green-200", dot: "bg-ok-600" },
  rejected: { label: "رد شده", badge: "bg-bad-50 text-bad-700 border-red-200", dot: "bg-bad-600" },
  paid: { label: "پرداخت‌شده", badge: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500" },
};

export const EXTRA_STATUS_META: Record<ExtraStatus, StatusMeta> = {
  pending: { label: "در انتظار معادل‌سازی", badge: "bg-amber-50 text-warn-700 border-amber-200", dot: "bg-amber-500" },
  mapped: { label: "معادل‌سازی‌شده", badge: "bg-ok-50 text-ok-700 border-green-200", dot: "bg-ok-600" },
  rejected: { label: "رد شده", badge: "bg-bad-50 text-bad-700 border-red-200", dot: "bg-bad-600" },
};

export const MEMBERSHIP_LABEL: Record<MembershipType, string> = {
  member: "عضو",
  supervisor: "سرپرست",
  employer_expert: "کارشناس کارفرما",
  employer_ceo: "رییس کارفرما",
};

export const CONTRACT_TYPE_LABEL: Record<ContractType, string> = {
  volume: "حجمی",
  unit_price: "فهرست بهایی",
  other: "سایر",
};
