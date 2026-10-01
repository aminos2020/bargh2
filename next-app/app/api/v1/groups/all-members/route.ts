import { handler, ok } from "@/lib/api-handler";
import { User } from "@/models/user";

/** نیروهای قابل تخصیص کار برای نقش ایجادکننده */
export const GET = handler({
  run: async ({ actor }) => {
    const filter: Record<string, unknown> = { isActive: true, role: { $in: ["TECHNICIAN", "GROUP_SUPERVISOR"] } };
    if (actor.role === "CONTRACTOR_CEO" || actor.role === "GROUP_SUPERVISOR" || actor.role === "TECHNICIAN" || actor.role === "RESIDENT_REP") {
      filter.companyId = actor.companyId;
    }
    const users = await User.find(filter).select("fullName").lean();
    return ok(users.map((u) => ({ _id: String(u._id), fullName: u.fullName })));
  },
});

export const dynamic = "force-dynamic";
