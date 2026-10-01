import type { Role } from "@/types";
import { GroupMembership } from "@/models/group-membership";
import { WorkGroup } from "@/models/work-group";
import { ApiError } from "./api-handler";

export const ROLE_LABEL: Record<Role, string> = {
  DEPUTY: "معاونت بهره‌برداری",
  EMPLOYER_CEO: "رییس کارفرما",
  EMPLOYER_EXPERT: "کارشناس کارفرما",
  CONTRACTOR_CEO: "رییس شرکت پیمانکار",
  RESIDENT_REP: "نماینده مقیم",
  GROUP_SUPERVISOR: "سرپرست گروه",
  TECHNICIAN: "کارشناس شرکت پیمانکار",
};

export const ROLE_HOME: Record<Role, string> = {
  DEPUTY: "/deputy",
  EMPLOYER_CEO: "/employer-ceo",
  EMPLOYER_EXPERT: "/employer-expert",
  CONTRACTOR_CEO: "/contractor-ceo",
  RESIDENT_REP: "/resident",
  GROUP_SUPERVISOR: "/supervisor",
  TECHNICIAN: "/technician",
};

/** شناسه‌ی گروه‌های قابل‌دیدن کاربر بر اساس عضویت‌ها (ایزولاسیون گروه‌ها). */
export async function visibleGroupIds(user: { _id: unknown; role: string; companyId?: unknown; organizationId: unknown }): Promise<string[] | "ALL"> {
  if (user.role === "DEPUTY") return "ALL";
  const typeByRole: Record<string, string[]> = {
    GROUP_SUPERVISOR: ["supervisor", "member"],
    TECHNICIAN: ["member", "supervisor"],
    EMPLOYER_EXPERT: ["employer_expert"],
    EMPLOYER_CEO: ["employer_ceo"],
  };
  const types = typeByRole[user.role];
  if (types) {
    const ms = await GroupMembership.find({ userId: user._id, isActive: true, membershipType: { $in: types } }).lean();
    return ms.map((m) => String(m.groupId));
  }
  if (user.role === "CONTRACTOR_CEO" || user.role === "RESIDENT_REP") {
    const gs = await WorkGroup.find({ companyId: user.companyId }).lean();
    return gs.map((g) => String(g._id));
  }
  return [];
}

export async function assertGroupVisible(user: Parameters<typeof visibleGroupIds>[0], groupId: string) {
  const vis = await visibleGroupIds(user);
  if (vis === "ALL") return;
  if (!vis.includes(groupId)) throw new ApiError("دسترسی به این گروه مجاز نیست.", "FORBIDDEN", 403);
}

/** آیا کاربر می‌تواند گزارش را ببیند؟ */
export async function canSeeReport(user: Parameters<typeof visibleGroupIds>[0], report: { userId: unknown; groupId?: unknown; companyId?: unknown }): Promise<boolean> {
  if (user.role === "DEPUTY") return true;
  if (String(report.userId) === String(user._id)) return true;
  if ((user.role === "CONTRACTOR_CEO" || user.role === "RESIDENT_REP") && String(report.companyId) === String(user.companyId)) return true;
  const vis = await visibleGroupIds(user);
  if (vis === "ALL") return true;
  return !!report.groupId && vis.includes(String(report.groupId));
}

/** مرحله‌ای که کاربر مجاز به انجام اکشن روی گزارش است. */
export function canActOnReport(user: { role: string; _id: unknown }, report: { status: string; userId: unknown }): boolean {
  if (String(report.userId) === String(user._id)) return false; // هیچ‌کس گزارش خودش را تایید نمی‌کند
  switch (user.role) {
    case "GROUP_SUPERVISOR": return report.status === "supervisor_review";
    case "EMPLOYER_EXPERT": return report.status === "expert_review";
    case "EMPLOYER_CEO": return report.status === "employer_ceo_review";
    default: return false;
  }
}
