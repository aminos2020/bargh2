import { handler, ok, ApiError } from "@/lib/api-handler";
import { WorkGroup } from "@/models/work-group";
import { GroupMembership } from "@/models/group-membership";
import { User } from "@/models/user";
import { assertGroupVisible } from "@/lib/permissions";

export const GET = handler({
  run: async ({ actor, params }) => {
    const g = await WorkGroup.findById(params.id).lean();
    if (!g) throw new ApiError("گروه پیدا نشد.", "NOT_FOUND", 404);
    await assertGroupVisible(actor, String(g._id));
    const ms = await GroupMembership.find({ groupId: g._id, isActive: true }).lean();
    const users = await User.find({ _id: { $in: ms.map((m) => m.userId) }, isActive: true }).select("fullName role").lean();
    return ok(users.map((u) => ({ _id: String(u._id), fullName: u.fullName, role: u.role })));
  },
});

export const dynamic = "force-dynamic";
