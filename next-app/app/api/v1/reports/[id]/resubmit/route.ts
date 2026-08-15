import { handler, ok } from "@/lib/api-handler";
import { resubmitReport } from "@/services/approval-service";

export const POST = handler({
  roles: ["TECHNICIAN", "GROUP_SUPERVISOR"],
  run: async ({ actor, params }) => ok(await resubmitReport(actor, params.id)),
});

export const dynamic = "force-dynamic";
