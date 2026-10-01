import type { Role } from "./user";

export interface SessionUser {
  userId: string;
  role: Role;
  organizationId: string;
  companyId?: string | null;
}

export type CheckPhoneResult =
  | { state: "not_found" }
  | { state: "inactive" }
  | { state: "ok"; maskedMobile: string; fullName: string };

export interface SyncOp {
  idempotencyKey: string;
  endpoint: "create_report" | "create_purchase_request";
  payload: unknown;
}

export interface SyncResultItem {
  idempotencyKey: string;
  ok: boolean;
  message: string;
  entityId?: string;
}
