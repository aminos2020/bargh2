export interface Organization {
  _id: string;
  name: string;
  type: "deputy" | "employer" | "contractor";
  description?: string;
  isActive: boolean;
}

export interface Company {
  _id: string;
  name: string;
  code: string;
  contractorCeoUserId?: string | null;
  phone?: string;
  address?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  /** فیلد محاسباتی در API */
  contractCount?: number;
  ceoName?: string;
}

export interface AuditLog {
  _id: string;
  actorUserId: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  detail?: string;
  createdAt: string;
  actorName?: string;
}
