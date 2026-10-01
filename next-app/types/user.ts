export type Role =
  | "DEPUTY"
  | "EMPLOYER_CEO"
  | "EMPLOYER_EXPERT"
  | "CONTRACTOR_CEO"
  | "RESIDENT_REP"
  | "GROUP_SUPERVISOR"
  | "TECHNICIAN";

export const ROLES: Role[] = ["DEPUTY", "EMPLOYER_CEO", "EMPLOYER_EXPERT", "CONTRACTOR_CEO", "RESIDENT_REP", "GROUP_SUPERVISOR", "TECHNICIAN"];

export const ROLE_LABEL: Record<Role, string> = {
  DEPUTY: "معاونت بهره‌برداری",
  EMPLOYER_CEO: "رییس کارفرما",
  EMPLOYER_EXPERT: "کارشناس کارفرما",
  CONTRACTOR_CEO: "رییس شرکت پیمانکار",
  RESIDENT_REP: "نماینده مقیم",
  GROUP_SUPERVISOR: "سرپرست گروه",
  TECHNICIAN: "کارشناس شرکت پیمانکار",
};

export interface WorkUnit {
  _id: string;
  name: string;
  organizationId: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PublicUser {
  _id: string;
  fullName: string;
  mobileMasked: string;
  role: Role;
  organizationId: string;
  companyId?: string | null;
  unitId?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface ScoreEvent {
  _id: string;
  userId: string;
  reportId: string;
  score: number;
  reason: string;
  createdByRole: Role;
  createdAt: string;
}
