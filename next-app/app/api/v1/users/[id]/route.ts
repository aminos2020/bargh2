import { z } from "zod";
import { handler, ok, ApiError } from "@/lib/api-handler";
import { User } from "@/models/user";
import { setUserActive } from "@/services/user-service";
import { assertSameCompany } from "@/lib/auth";

const patchSchema = z.object({ isActive: z.boolean() });

export const PATCH = handler({
  roles: ["DEPUTY", "CONTRACTOR_CEO"],
  schema: patchSchema,
  run: async ({ actor, params, body }) => {
    const target = await User.findById(params.id);
    if (!target) throw new ApiError("کاربر پیدا نشد.", "NOT_FOUND", 404);
    if (actor.role === "CONTRACTOR_CEO") assertSameCompany(actor, target.companyId ? String(target.companyId) : null);
    return ok(await setUserActive(actor, params.id, body.isActive));
  },
});

export const dynamic = "force-dynamic";
