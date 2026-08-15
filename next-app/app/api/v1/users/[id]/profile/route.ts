import { handler, ok, ApiError } from "@/lib/api-handler";
import { User } from "@/models/user";
import { WorkGroup } from "@/models/work-group";
import { GroupMembership } from "@/models/group-membership";
import { ScoreEvent } from "@/models/score-event";
import { WorkReport } from "@/models/work-report";
import { maskMobile, decryptMobile } from "@/lib/mobile";
import { reportsVisibleTo } from "@/services/report-service-queries";

export const GET = handler({
  roles: ["CONTRACTOR_CEO", "DEPUTY", "GROUP_SUPERVISOR"],
  run: async ({ actor, params }) => {
    const u = await User.findById(params.id).lean();
    if (!u) throw new ApiError("کاربر پیدا نشد.", "NOT_FOUND", 404);
    if (actor.role === "CONTRACTOR_CEO" && String(u.companyId) !== String(actor.companyId)) throw new ApiError("دسترسی مجاز نیست.", "FORBIDDEN", 403);

    const ms = await GroupMembership.find({ userId: u._id, isActive: true }).lean();
    const groups = await WorkGroup.find({ _id: { $in: ms.map((m) => m.groupId) } }).lean();
    const recentScores = await ScoreEvent.find({ userId: u._id }).sort({ createdAt: -1 }).limit(10).lean();
    const totalScore = (await ScoreEvent.aggregate([{ $match: { userId: u._id } }, { $group: { _id: null, sum: { $sum: "$score" } } }]))[0]?.sum || 0;

    const visible = await reportsVisibleTo(actor, { userId: u._id });
    const recent = (await visible.sort({ createdAt: -1 }).limit(6).lean()).map((r) => ({
      ...r, _id: String(r._id),
      groupName: groups.find((g) => String(g._id) === String(r.groupId))?.name || "—",
    }));

    return ok({
      _id: String(u._id), fullName: u.fullName, role: u.role, isActive: u.isActive,
      mobileMasked: maskMobile(decryptMobile(u.mobileEnc)),
      lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : null,
      organizationId: String(u.organizationId), companyId: u.companyId ? String(u.companyId) : null,
      createdAt: new Date(u.createdAt).toISOString(),
      groups: groups.map((g) => ({ ...g, _id: String(g._id) })),
      recentScores: recentScores.map((s) => ({ ...s, _id: String(s._id), userId: String(s.userId), reportId: String(s.reportId) })),
      totalScore,
      recentReports: recent,
    });
  },
});

export const dynamic = "force-dynamic";
