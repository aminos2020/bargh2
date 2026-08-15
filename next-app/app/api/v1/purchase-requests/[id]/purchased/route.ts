import { z } from "zod";
import { handler, ok } from "@/lib/api-handler";
import { markPurchased } from "@/services/purchase-service";

const schema = z.object({ note: z.string().optional() });

export const POST = handler({
  roles: ["RESIDENT_REP", "CONTRACTOR_CEO"],
  schema,
  run: async ({ actor, params, body }) => ok(await markPurchased(actor, params.id, body.note)),
});

export const dynamic = "force-dynamic";
