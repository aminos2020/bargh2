import type { ReportStatus } from "./report";
import type { Role } from "./user";

export type ApprovalAction = "submit" | "resubmit" | "approve" | "reject" | "redo" | "dispute";

export interface ApprovalEvent {
  _id: string;
  reportId: string;
  actorUserId: string;
  actorRole: Role;
  action: ApprovalAction;
  fromStatus: ReportStatus;
  toStatus: ReportStatus;
  reason?: string;
  createdAt: string;
  actorName?: string;
}
