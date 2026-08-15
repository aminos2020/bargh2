import { handler, ok } from "@/lib/api-handler";
import { markRead } from "@/services/notification-service";

export const POST = handler({
  run: async ({ actor, params }) => ok(await markRead(actor._id, params.id)),
});

export const dynamic = "force-dynamic";
