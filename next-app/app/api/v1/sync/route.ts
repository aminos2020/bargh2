import { z } from "zod";
import { handler, ok } from "@/lib/api-handler";
import { processSyncOps } from "@/services/sync-service";

const schema = z.object({
  ops: z.array(z.object({
    idempotencyKey: z.string().min(8),
    endpoint: z.enum(["create_report", "create_purchase_request"]),
    payload: z.unknown(),
  })).max(20),
});

/** همگام‌سازی صف آفلاین کلاینت — هر عملیات دقیقا یک بار اعمال می‌شود */
export const POST = handler({
  roles: ["TECHNICIAN", "GROUP_SUPERVISOR", "RESIDENT_REP"],
  schema,
  rateLimitPerMin: 20,
  run: async ({ actor, body }) => ok({ results: await processSyncOps(actor, body.ops) }),
});

export const dynamic = "force-dynamic";
