import { handler, ok } from "@/lib/api-handler";
import { WorkReport } from "@/models/work-report";
import { ReportItem } from "@/models/report-item";
import { ExtraWorkItem } from "@/models/extra-work-item";
import { WorkGroup } from "@/models/work-group";
import { jalaliDateSchema } from "@/lib/validators";
import { z } from "zod";

const qSchema = z.object({
  contractId: z.string().min(1),
  from: jalaliDateSchema,
  to: jalaliDateSchema,
});

/** پیش‌نمایش گزارش‌های تایید نهایی بازه برای ساخت صورت‌وضعیت */
export const GET = handler({
  roles: ["CONTRACTOR_CEO"],
  querySchema: qSchema,
  run: async ({ actor, query }) => {
    const from = query.get("from")!;
    const to = query.get("to")!;
    const contractId = query.get("contractId")!;
    const reports = await WorkReport.find({
      companyId: actor.companyId,
      contractId,
      status: { $in: ["approved", "settled"] },
      reportDateJ: { $gte: from, $lte: to },
    }).lean();
    const reportIds = reports.map((r) => r._id);
    const items = await ReportItem.find({ reportId: { $in: reportIds }, status: "approved" }).lean();
    const extras = await ExtraWorkItem.find({ reportId: { $in: reportIds }, status: "mapped" }).lean();
    const groups = await WorkGroup.find({}).select("name").lean();

    const amountByReport = new Map<string, number>();
    for (const i of items) {
      const k = String(i.reportId);
      amountByReport.set(k, (amountByReport.get(k) || 0) + (i.totalAmount || 0));
    }
    for (const e of extras) {
      const k = String(e.reportId);
      amountByReport.set(k, (amountByReport.get(k) || 0) + (e.mappedAmount || 0));
    }

    const byGroupMap = new Map<string, { name: string; amount: number; count: number }>();
    for (const r of reports) {
      const g = groups.find((x) => String(x._id) === String(r.groupId));
      const name = g?.name || "بدون گروه";
      const cur = byGroupMap.get(name) || { name, amount: 0, count: 0 };
      cur.amount += amountByReport.get(String(r._id)) || 0;
      cur.count += 1;
      byGroupMap.set(name, cur);
    }

    return ok({
      reportCount: reports.length,
      totalAmount: [...amountByReport.values()].reduce((s, v) => s + v, 0),
      byGroup: [...byGroupMap.values()],
    });
  },
});

export const dynamic = "force-dynamic";
