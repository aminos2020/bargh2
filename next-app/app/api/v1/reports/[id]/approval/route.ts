import { z } from "zod";
import { handler, ok } from "@/lib/api-handler";
import { applyApproval } from "@/services/approval-service";

const schema = z.object({
  action: z.enum(["approve", "reject", "redo", "dispute"]),
  reason: z.string().optional(),
});

export const POST = handler({
  roles: ["GROUP_SUPERVISOR", "EMPLOYER_EXPERT", "EMPLOYER_CEO"],
  schema,
  run: async ({ actor, params, body }) => ok(await applyApproval(actor, params.id, body.action, body.reason)),
});

export const dynamic = "force-dynamic";
