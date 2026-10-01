import { z } from "zod";
import { handler, ok, paginate } from "@/lib/api-handler";
import { PurchaseRequest } from "@/models/purchase-request";
import { User } from "@/models/user";
import { createPurchaseRequest } from "@/services/purchase-service";
import { prioritySchema } from "@/lib/validators";

const createSchema = z.object({
  title: z.string().min(3),
  itemDescription: z.string().min(5),
  quantity: z.number().min(1),
  estimatedPrice: z.number().min(1),
  priority: prioritySchema,
  reason: z.string().optional(),
  contractId: z.string().nullable().optional(),
});

export const GET = handler({
  roles: ["TECHNICIAN", "GROUP_SUPERVISOR", "RESIDENT_REP", "CONTRACTOR_CEO", "DEPUTY"],
  run: async ({ actor, query }) => {
    const filter: Record<string, unknown> = {};
    const status = query.get("status");
    if (status) filter.status = status;
    if (actor.role !== "DEPUTY") filter.companyId = actor.companyId;
    if (actor.role === "TECHNICIAN") filter.requesterUserId = actor._id;
    const all = await PurchaseRequest.find(filter).sort({ createdAt: -1 }).lean();
    const users = await User.find({}).select("fullName").lean();
    const uName = (id: unknown) => users.find((u) => String(u._id) === String(id))?.fullName || "—";
    return ok(paginate(all.map((p) => ({
      ...p, _id: String(p._id),
      requesterUserId: String(p.requesterUserId),
      companyId: String(p.companyId),
      contractId: p.contractId ? String(p.contractId) : null,
      decidedByUserId: p.decidedByUserId ? String(p.decidedByUserId) : null,
      requesterName: uName(p.requesterUserId),
      deciderName: p.decidedByUserId ? uName(p.decidedByUserId) : null,
      purchasedAt: p.purchasedAt ? new Date(p.purchasedAt).toISOString() : null,
      createdAt: new Date(p.createdAt).toISOString(),
    })), query));
  },
});

export const POST = handler({
  roles: ["TECHNICIAN", "GROUP_SUPERVISOR", "RESIDENT_REP"],
  schema: createSchema,
  run: async ({ actor, body }) => ok(await createPurchaseRequest(actor, body, true)),
});

export const dynamic = "force-dynamic";
