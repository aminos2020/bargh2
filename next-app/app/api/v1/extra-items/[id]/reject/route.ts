import { z } from "zod";
import { handler, ok, ApiError } from "@/lib/api-handler";
import { ExtraWorkItem } from "@/models/extra-work-item";
import { logAudit } from "@/lib/audit";

const schema = z.object({ note: z.string().optional() });

export const POST = handler({
  roles: ["RESIDENT_REP"],
  schema,
  run: async ({ actor, params, body }) => {
    const ex = await ExtraWorkItem.findById(params.id);
    if (!ex) throw new ApiError("کار اضافی پیدا نشد.", "NOT_FOUND", 404);
    if (ex.status !== "pending") throw new ApiError("این مورد قبلا تعیین تکلیف شده است.", "BAD_STATE");
    ex.status = "rejected";
    ex.mappingNote = body.note || undefined;
    ex.mappedByUserId = actor._id;
    await ex.save();
    await logAudit({ actorUserId: actor._id, actorRole: actor.role, action: "رد کار اضافی", entity: "extra", entityId: String(ex._id) });
    return ok({ id: String(ex._id) });
  },
});

export const dynamic = "force-dynamic";
