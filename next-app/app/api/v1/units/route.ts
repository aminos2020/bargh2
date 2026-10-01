import { z } from "zod";
import { handler, ok } from "@/lib/api-handler";
import { WorkUnit } from "@/models/work-unit";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({ name: z.string().min(2), description: z.string().optional() });

export const GET = handler({
  roles: ["DEPUTY", "EMPLOYER_CEO", "EMPLOYER_EXPERT"],
  run: async ({ actor }) => {
    const all = await WorkUnit.find({ organizationId: actor.organizationId }).sort({ createdAt: -1 }).lean();
    return ok(all.map((u) => ({ ...u, _id: String(u._id), organizationId: String(u.organizationId) })));
  },
});

export const POST = handler({
  roles: ["DEPUTY"],
  schema: createSchema,
  run: async ({ actor, body }) => {
    const doc = await WorkUnit.create({ name: body.name.trim(), description: body.description, organizationId: actor.organizationId });
    await logAudit({ actorUserId: actor._id, actorRole: actor.role, action: "ایجاد واحد", entity: "unit", entityId: String(doc._id), detail: doc.name });
    return ok({ id: String(doc._id) });
  },
});

export const dynamic = "force-dynamic";
