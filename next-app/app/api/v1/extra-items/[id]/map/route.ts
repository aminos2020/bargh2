import { z } from "zod";
import { handler, ok, ApiError } from "@/lib/api-handler";
import { ExtraWorkItem } from "@/models/extra-work-item";
import { PriceItem } from "@/models/price-item";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  priceItemId: z.string().min(1),
  quantity: z.number().min(1),
  note: z.string().optional(),
});

/** معادل‌سازی کار اضافی با آیتم فهرست بها — قابل محاسبه در صورت‌وضعیت */
export const POST = handler({
  roles: ["RESIDENT_REP"],
  schema,
  run: async ({ actor, params, body }) => {
    const ex = await ExtraWorkItem.findById(params.id);
    if (!ex) throw new ApiError("کار اضافی پیدا نشد.", "NOT_FOUND", 404);
    if (ex.status !== "pending") throw new ApiError("این مورد قبلا تعیین تکلیف شده است.", "BAD_STATE");
    const pi = await PriceItem.findById(body.priceItemId);
    if (!pi) throw new ApiError("آیتم بها پیدا نشد.", "NOT_FOUND", 404);

    ex.status = "mapped";
    ex.mappedPriceItemId = pi._id;
    ex.mappedQuantity = body.quantity;
    ex.mappedAmount = pi.unitPrice * body.quantity;
    ex.mappedByUserId = actor._id;
    ex.mappingNote = body.note || undefined;
    await ex.save();

    await logAudit({
      actorUserId: actor._id, actorRole: actor.role, action: "معادل‌سازی کار اضافی", entity: "extra", entityId: String(ex._id),
      detail: `آیتم: ${pi.title} — تعداد: ${body.quantity} — مبلغ: ${ex.mappedAmount} ریال`,
    });
    return ok({ id: String(ex._id), amount: ex.mappedAmount });
  },
});

export const dynamic = "force-dynamic";
