import { handler, ok } from "@/lib/api-handler";
import { ExtraWorkItem } from "@/models/extra-work-item";
import { WorkReport } from "@/models/work-report";
import { WorkGroup } from "@/models/work-group";
import { Company } from "@/models/company";
import { User } from "@/models/user";
import { visibleGroupIds } from "@/lib/permissions";

export const GET = handler({
  roles: ["RESIDENT_REP", "CONTRACTOR_CEO", "DEPUTY"],
  run: async ({ actor, query }) => {
    const status = query.get("status");
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    let reportFilter: Record<string, unknown> = {};
    if (actor.role === "RESIDENT_REP" || actor.role === "CONTRACTOR_CEO") {
      reportFilter = { companyId: actor.companyId };
    } else {
      const vis = await visibleGroupIds(actor);
      if (vis !== "ALL") reportFilter = { groupId: { $in: vis } };
    }
    const reports = await WorkReport.find(reportFilter).select("_id groupId userId reportDateJ").lean();
    const reportIds = reports.map((r) => r._id);
    filter.reportId = { $in: reportIds };

    const extras = await ExtraWorkItem.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    const groups = await WorkGroup.find({}).select("name").lean();
    const companies = await Company.find({}).select("name").lean();
    const users = await User.find({}).select("fullName").lean();

    return ok(extras.map((e) => {
      const r = reports.find((x) => String(x._id) === String(e.reportId));
      const g = groups.find((x) => String(x._id) === String(r?.groupId));
      return {
        ...e, _id: String(e._id), reportId: String(e.reportId),
        groupName: g?.name || "—",
        companyName: companies.find((c) => String(c._id) === String(r?.companyId))?.name || "—",
        technicianName: users.find((u) => String(u._id) === String(r?.userId))?.fullName || "—",
        reportDateJ: r?.reportDateJ || "",
        createdAt: new Date(e.createdAt).toISOString(),
      };
    }));
  },
});

export const dynamic = "force-dynamic";
