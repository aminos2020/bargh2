import { handler, ok, ApiError } from "@/lib/api-handler";
import { WorkGroup } from "@/models/work-group";
import { GroupMembership } from "@/models/group-membership";
import { User } from "@/models/user";
import { maskMobile, decryptMobile } from "@/lib/mobile";
import { assertGroupVisible } from "@/lib/permissions";

export const GET = handler({
  run: async ({ actor, params }) => {
    const g = await WorkGroup.findById(params.id).lean();
    if (!g) throw new ApiError("گروه پیدا نشد.", "NOT_FOUND", 404);
    await assertGroupVisible(actor, String(g._id));
    const ms = await GroupMembership.find({ groupId: g._id, isActive: true }).lean();
    const users = await User.find({ _id: { $in: ms.map((m) => m.userId) } }).lean();
    const members = ms.map((m) => {
      const u = users.find((x) => String(x._id) === String(m.userId));
      return u ? {
        _id: String(u._id), fullName: u.fullName, role: u.role, isActive: u.isActive,
        mobileMasked: maskMobile(decryptMobile(u.mobileEnc)),
        membershipType: m.membershipType, organizationId: String(u.organizationId),
        companyId: u.companyId ? String(u.companyId) : null, unitId: null, lastLoginAt: null, createdAt: "",
      } : null;
    }).filter(Boolean);

    // کاربران قابل‌افزودن: هم‌شرکتی‌ها + کارفرمایی‌های هم‌سازمان
    const assignable = await User.find({
      isActive: true,
      $or: [{ companyId: g.companyId }, { organizationId: actor.organizationId, role: { $in: ["EMPLOYER_EXPERT", "EMPLOYER_CEO"] } }],
      _id: { $nin: ms.map((m) => m.userId) },
    }).select("fullName").lean();

    return ok({
      _id: String(g._id), name: g.name, description: g.description,
      companyId: String(g.companyId), contractId: String(g.contractId),
      workUnitId: g.workUnitId ? String(g.workUnitId) : null,
      supervisorUserId: g.supervisorUserId ? String(g.supervisorUserId) : null,
      isActive: g.isActive, createdAt: new Date(g.createdAt).toISOString(),
      supervisorName: users.find((u) => String(u._id) === String(g.supervisorUserId))?.fullName || null,
      memberCount: members.length,
      members,
      assignableUsers: assignable.map((u) => ({
        _id: String(u._id), fullName: u.fullName, role: u.role, isActive: true, mobileMasked: "",
        organizationId: String(actor.organizationId), companyId: null, unitId: null, lastLoginAt: null, createdAt: "",
      })),
    });
  },
});

export const dynamic = "force-dynamic";
