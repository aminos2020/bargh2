import { z } from "zod";
import { handler, ok } from "@/lib/api-handler";
import { checkPhone } from "@/services/auth-service";

const schema = z.object({ mobile: z.string().min(1) });

// rate limit سخت‌گیرانه برای جلوگیری از شماره‌یابی
export const POST = handler({
  isPublic: true,
  schema,
  rateLimitPerMin: 10,
  run: async ({ body }) => ok(await checkPhone(body.mobile)),
});
