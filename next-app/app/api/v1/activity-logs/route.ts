import { handler, ok, paginate } from "@/lib/api-handler";
import { AuditLog } from "@/models/audit-log";
import { User } from "@/models/user";
import { WorkReport } from "@/models/work-report";
import { Company } from "@/models/company";

export const GET = handler({
  roles: ["DEPUTY", "CONTRACTOR_CEO", "EMPLOYER_CEO"],
  run: async ({ actor, query }) => {
    const filter: Record<string, unknown> = {};
    const entity = query.get("entity");
    const search = query.get("search");
    if (entity) filter.entity = entity;
    if (search) filter.action = { $regex: search, $options: "i" };

    // هر نقش فقط رویدادهای حوزه‌ی خودش را ببیند
    if (actor.role === "CONTRACTOR_CEO") {
      const companyReports = await WorkReport.find({ companyId: actor.companyId }).select("_id").lean();
      const reportIds = companyReports.map((r) => String(r._id));
      const companyUsers = await User.find({ companyId: actor.companyId }).select("_id").lean();
      const userIds = companyUsers.map((u) => String(u._id));
      filter.$or = [
        { entity: "report", entityId: { $in: reportIds } },
        { actorUserId: { $in: userIds } },
        { entity: { $in: ["company", "group", "price", "purchase", "statement"] } },
      ];
    } else if (actor.role === "EMPLOYER_CEO") {
      const users = await User.find({ organizationId: actor.organizationId }).select("_id").lean();
      filter.$or = [{ actorUserId: { $in: users.map((u) => String(u._id)) } }];
    }

    const all = await AuditLog.find(filter).sort({ createdAt: -1 }).lean();
    const users = await User.find({}).select("fullName").lean();
    return ok(paginate(all.map((l) => ({
      ...l, _id: String(l._id), actorUserId: String(l.actorUserId),
      actorName: users.find((u) => String(u._id) === String(l.actorUserId))?.fullName || "—",
      createdAt: new Date(l.createdAt).toISOString(),
    })), query));
  },
});

export const dynamic = "force-dynamic";
void Company;
