import { handler, ok } from "@/lib/api-handler";
import { assertReportReadable, reportFullDetails } from "@/services/report-service-queries";

export const GET = handler({
  run: async ({ actor, params }) => {
    await assertReportReadable(actor, params.id);
    const d = await reportFullDetails(params.id);
    return ok({
      ...d,
      _id: String(d._id),
      userId: String(d.userId),
      groupId: d.groupId ? String(d.groupId) : null,
      companyId: String(d.companyId),
      contractId: String(d.contractId),
      submittedAt: d.submittedAt ? new Date(d.submittedAt).toISOString() : undefined,
      createdAt: new Date(d.createdAt).toISOString(),
      updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : undefined,
      itemCount: d.items.length,
      items: d.items.map((i: Record<string, any>) => ({ ...i, _id: String(i._id), reportId: String(i.reportId), priceItemId: String(i.priceItemId) })),
      extras: d.extras.map((e: Record<string, any>) => ({ ...e, _id: String(e._id), reportId: String(e.reportId) })),
      attachments: d.attachments.map((a: Record<string, any>) => ({ ...a, _id: String(a._id) })),
      events: d.events.map((e: Record<string, any>) => ({
        ...e, _id: String(e._id), reportId: String(e.reportId),
        createdAt: new Date(e.createdAt).toISOString(),
      })),
    });
  },
});

export const dynamic = "force-dynamic";
