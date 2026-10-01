import { handler, ok } from "@/lib/api-handler";
import { Attachment } from "@/models/attachment";
import { assertReportReadable } from "@/services/report-service-queries";

export const GET = handler({
  run: async ({ actor, query }) => {
    const reportId = query.get("reportId");
    if (!reportId) return ok([]);
    await assertReportReadable(actor, reportId);
    const atts = await Attachment.find({ reportId }).lean();
    return ok(atts.map((a) => ({ ...a, _id: String(a._id), reportId: a.reportId ? String(a.reportId) : null })));
  },
});

export const dynamic = "force-dynamic";
