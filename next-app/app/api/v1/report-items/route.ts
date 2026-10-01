import { handler, ok, ApiError } from "@/lib/api-handler";
import { ReportItem } from "@/models/report-item";
import { assertReportReadable } from "@/services/report-service-queries";

export const GET = handler({
  run: async ({ actor, query }) => {
    const reportId = query.get("reportId");
    if (!reportId) throw new ApiError("شناسه گزارش الزامی است.", "MISSING_PARAM");
    await assertReportReadable(actor, reportId);
    const items = await ReportItem.find({ reportId }).lean();
    return ok(items.map((i) => ({ ...i, _id: String(i._id), reportId: String(i.reportId), priceItemId: String(i.priceItemId) })));
  },
});

export const dynamic = "force-dynamic";
