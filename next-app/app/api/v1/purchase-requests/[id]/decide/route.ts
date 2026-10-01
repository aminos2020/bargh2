import { z } from "zod";
import { handler, ok } from "@/lib/api-handler";
import { decidePurchaseRequest } from "@/services/purchase-service";

const schema = z.object({ action: z.enum(["approved", "rejected"]), note: z.string().optional() });

export const POST = handler({
  roles: ["RESIDENT_REP", "CONTRACTOR_CEO"],
  schema,
  run: async ({ actor, params, body }) => ok(await decidePurchaseRequest(actor, params.id, body.action, body.note)),
});

export const dynamic = "force-dynamic";
