import { z } from "zod";
import { handler, ok, paginate, ApiError } from "@/lib/api-handler";
import { Statement } from "@/models/statement";
import { WorkReport } from "@/models/work-report";
import { ReportItem } from "@/models/report-item";
import { ExtraWorkItem } from "@/models/extra-work-item";
import { Contract } from "@/models/contract";
import { Company } from "@/models/company";
import { logAudit } from "@/lib/audit";
import { notifyCompanyRoles } from "@/lib/notification";
import { jalaliDateSchema } from "@/lib/validators";

export const GET = handler({
  roles: ["CONTRACTOR_CEO", "DEPUTY", "RESIDENT_REP"],
  run: async ({ actor, query }) => {
    const filter: Record<string, unknown> = {};
    if (actor.role !== "DEPUTY") filter.contractorCompanyId = actor.companyId;
    const all = await Statement.find(filter).sort({ createdAt: -1 }).lean();
    const contracts = await Contract.find({}).select("title").lean();
    const companies = await Company.find({}).select("name").lean();
    return ok(paginate(all.map((s) => ({
      ...s, _id: String(s._id),
      contractorCompanyId: String(s.contractorCompanyId), contractId: String(s.contractId),
      reportIds: s.reportIds.map(String),
      createdByUserId: String(s.createdByUserId),
      decidedByUserId: s.decidedByUserId ? String(s.decidedByUserId) : null,
      contractTitle: contracts.find((c) => String(c._id) === String(s.contractId))?.title || "—",
      contractorName: companies.find((c) => String(c._id) === String(s.contractorCompanyId))?.name || "—",
      createdAt: new Date(s.createdAt).toISOString(),
    })), query));
  },
});

const createSchema = z.object({
  contractId: z.string().min(1),
  periodStart: jalaliDateSchema,
  periodEnd: jalaliDateSchema,
});

export const POST = handler({
  roles: ["CONTRACTOR_CEO"],
  schema: createSchema,
  run: async ({ actor, body }) => {
    // فقط گزارش‌های تایید نهایی بازه
    const reports = await WorkReport.find({
      companyId: actor.companyId,
      contractId: body.contractId,
      status: { $in: ["approved", "settled"] },
      reportDateJ: { $gte: body.periodStart, $lte: body.periodEnd },
    }).lean();
    if (reports.length === 0) throw new ApiError("در این بازه گزارش تایید نهایی‌شده‌ای وجود ندارد.", "EMPTY_PERIOD");

    const reportIds = reports.map((r) => r._id);
    const items = await ReportItem.find({ reportId: { $in: reportIds }, status: "approved" }).lean();
    const extras = await ExtraWorkItem.find({ reportId: { $in: reportIds }, status: "mapped" }).lean();
    const totalAmount = items.reduce((s, i) => s + (i.totalAmount || 0), 0) + extras.reduce((s, e) => s + (e.mappedAmount || 0), 0);

    const doc = await Statement.create({
      contractorCompanyId: actor.companyId,
      contractId: body.contractId,
      periodStart: body.periodStart,
      periodEnd: body.periodEnd,
      reportIds,
      totalAmount,
      status: "submitted",
      createdByUserId: actor._id,
    });
    await logAudit({ actorUserId: actor._id, actorRole: actor.role, action: "ایجاد صورت‌وضعیت", entity: "statement", entityId: String(doc._id), detail: `${reports.length} گزارش — ${totalAmount} ریال` });
    await notifyCompanyRoles(actor.companyId, ["DEPUTY"], "صورت‌وضعیت جدید", "صورت‌وضعیت جدیدی برای بررسی ارسال شد.", "statement", String(doc._id)).catch(() => {});
    return ok({ id: String(doc._id), totalAmount });
  },
});

export const dynamic = "force-dynamic";
