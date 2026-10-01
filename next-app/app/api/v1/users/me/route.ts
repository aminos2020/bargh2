import { handler, ok } from "@/lib/api-handler";
import { toPublic } from "../route";

export const GET = handler({
  run: async ({ actor }) => ok(toPublic(actor.toObject())),
});

export const dynamic = "force-dynamic";
