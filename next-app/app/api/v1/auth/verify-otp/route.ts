import { z } from "zod";
import { handler, ok, fail } from "@/lib/api-handler";
import { verifyOtp } from "@/services/auth-service";
import { getSession } from "@/lib/session";
import { ROLE_HOME } from "@/lib/permissions";
import type { Role } from "@/types";

const schema = z.object({ mobile: z.string().min(1), code: z.string().length(5) });

export const POST = handler({
  isPublic: true,
  schema,
  rateLimitPerMin: 10,
  run: async ({ body }) => {
    const user = await verifyOtp(body.mobile, body.code);
    const session = await getSession();
    session.userId = user.userId;
    session.role = user.role as Role;
    session.organizationId = user.organizationId;
    session.companyId = user.companyId;
    await session.save();
    return ok({ role: user.role, redirectTo: ROLE_HOME[user.role as Role] });
  },
});

export const dynamic = "force-dynamic";
void fail;
