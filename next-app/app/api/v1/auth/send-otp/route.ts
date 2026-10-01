import { z } from "zod";
import { handler, ok } from "@/lib/api-handler";
import { sendOtp } from "@/services/auth-service";

const schema = z.object({ mobile: z.string().min(1) });

export const POST = handler({
  isPublic: true,
  schema,
  rateLimitPerMin: 5,
  run: async ({ body }) => ok(await sendOtp(body.mobile)),
});
