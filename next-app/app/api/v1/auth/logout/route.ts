import { handler, ok } from "@/lib/api-handler";
import { getSession } from "@/lib/session";

export const POST = handler({
  run: async () => {
    const session = await getSession();
    session.destroy();
    return ok({ loggedOut: true });
  },
});
