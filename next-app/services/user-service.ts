import { User } from "@/models/user";
import { GroupMembership } from "@/models/group-membership";
import { ApiError } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";
import { normalizeMobile, hashMobile, encryptMobile } from "@/lib/mobile";
import type { Role } from "@/types";

const DEPUTY_CREATES: Role[] = ["EMPLOYER_CEO", "EMPLOYER_EXPERT", "CONTRACTOR_CEO"];
const CEO_CREATES: Role[] = ["TECHNICIAN", "GROUP_SUPERVISOR", "RESIDENT_REP"];

export async function createUser(actor: InstanceType<typeof User>, input: {
  fullName: string; mobile: string; role: Role;
  companyId?: string | null; unitId?: string | null; groupIds?: string[];
}) {
  const allowed = actor.role === "DEPUTY" ? DEPUTY_CREATES : actor.role === "CONTRACTOR_CEO" ? CEO_CREATES : [];
  if (!allowed.includes(input.role)) throw new ApiError("نقش انتخابی برای شما مجاز نیست.", "FORBIDDEN", 403);

  const normalized = normalizeMobile(input.mobile);
  if (!normalized) throw new ApiError("شماره موبایل نامعتبر است.", "INVALID_MOBILE");
  const dup = await User.findOne({ mobileHash: hashMobile(normalized) });
  if (dup) throw new ApiError("این شماره موبایل قبلا در سامانه ثبت شده است.", "DUPLICATE_MOBILE");

  const user = await User.create({
    fullName: input.fullName.trim(),
    mobileNormalized: normalized,
    mobileHash: hashMobile(normalized),
    mobileEnc: encryptMobile(normalized),
    role: input.role,
    organizationId: actor.organizationId,
    companyId: actor.role === "CONTRACTOR_CEO" ? actor.companyId : input.companyId || null,
    unitId: input.unitId || null,
    isActive: true,
  });

  if (input.groupIds?.length) {
    const type = input.role === "GROUP_SUPERVISOR" ? "supervisor" : "member";
    await GroupMembership.insertMany(input.groupIds.map((g) => ({ userId: user._id, groupId: g, membershipType: type, isActive: true })));
  }

  await logAudit({ actorUserId: actor._id, actorRole: actor.role, action: "ایجاد کاربر", entity: "user", entityId: String(user._id), detail: `${user.fullName} — ${input.role}` });
  return { id: String(user._id) };
}

export async function setUserActive(actor: InstanceType<typeof User>, userId: string, isActive: boolean) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError("کاربر پیدا نشد.", "NOT_FOUND", 404);
  user.isActive = isActive;
  await user.save();
  await logAudit({ actorUserId: actor._id, actorRole: actor.role, action: isActive ? "فعال‌سازی کاربر" : "غیرفعال‌سازی کاربر", entity: "user", entityId: userId, detail: user.fullName });
  return { id: userId, isActive };
}
