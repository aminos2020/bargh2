import { handler, ok } from "@/lib/api-handler";
import { markAllRead } from "@/services/notification-service";

export const POST = handler({
  run: async ({ actor }) => ok(await markAllRead(actor._id)),
});

export const dynamic = "force-dynamic";
