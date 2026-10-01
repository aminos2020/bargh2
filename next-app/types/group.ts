export type MembershipType = "member" | "supervisor" | "employer_expert" | "employer_ceo";

export const MEMBERSHIP_LABEL: Record<MembershipType, string> = {
  member: "عضو",
  supervisor: "سرپرست",
  employer_expert: "کارشناس کارفرما",
  employer_ceo: "رییس کارفرما",
};

export interface WorkGroup {
  _id: string;
  name: string;
  description?: string;
  companyId: string;
  contractId: string;
  workUnitId?: string | null;
  supervisorUserId?: string | null;
  isActive: boolean;
  createdAt: string;
  memberCount?: number;
  supervisorName?: string;
  companyName?: string;
}

export interface GroupMembership {
  _id: string;
  userId: string;
  groupId: string;
  membershipType: MembershipType;
  isActive: boolean;
}
