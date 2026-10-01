import { handler, ok, ApiError } from "@/lib/api-handler";
import { Statement } from "@/models/statement";
import { WorkReport } from "@/models/work-report";
import { ReportItem } from "@/models/report-item";
import { Contract } from "@/models/contract";
import { Company } from "@/models/company";
import { User } from "@/models/user";
import { WorkGroup } from "@/models/work-group";

export const GET = handler({
  roles: ["CONTRACTOR_CEO", "DEPUTY", "RESIDENT_REP"],
  run: async ({ actor, params }) => {
    const s = await Statement.findById(params.id).lean();
    if (!s) throw new ApiError("صورت‌وضعیت پیدا نشد.", "NOT_FOUND", 404);
    if (actor.role !== "DEPUTY" && String(s.contractorCompanyId) !== String(actor.companyId)) throw new ApiError("دسترسی مجاز نیست.", "FORBIDDEN", 403);

    const reports = await WorkReport.find({ _id: { $in: s.reportIds } }).lean();
    const items = await ReportItem.find({ reportId: { $in: s.reportIds }, status: "approved" }).lean();
    const users = await User.find({}).select("fullName").lean();
    const groups = await WorkGroup.find({}).select("name").lean();
    const contract = await Contract.findById(s.contractId).select("title").lean();
    const company = await Company.findById(s.contractorCompanyId).select("name").lean();

    return ok({
      ...s, _id: String(s._id),
      contractorCompanyId: String(s.contractorCompanyId), contractId: String(s.contractId),
      reportIds: s.reportIds.map(String),
      createdByUserId: String(s.createdByUserId),
      decidedByUserId: s.decidedByUserId ? String(s.decidedByUserId) : null,
      createdAt: new Date(s.createdAt).toISOString(),
      contractTitle: contract?.title || "—",
      contractorName: company?.name || "—",
      reports: reports.map((r) => ({
        _id: String(r._id), userId: String(r.userId), status: r.status, reportDateJ: r.reportDateJ,
        groupId: r.groupId ? String(r.groupId) : null, companyId: String(r.companyId),
        reportType: r.reportType, contractId: String(r.contractId), idempotencyKey: r.idempotencyKey,
        createdAt: new Date(r.createdAt).toISOString(),
        userName: users.find((u) => String(u._id) === String(r.userId))?.fullName || "—",
        groupName: groups.find((g) => String(g._id) === String(r.groupId))?.name || "—",
        totalAmount: items.filter((i) => String(i.reportId) === String(r._id)).reduce((sum, i) => sum + (i.totalAmount || 0), 0),
        itemCount: items.filter((i) => String(i.reportId) === String(r._id)).length,
      })),
    });
  },
});

export const dynamic = "force-dynamic";
