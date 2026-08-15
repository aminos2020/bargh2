import { z } from "zod";
import { handler, ok, paginate } from "@/lib/api-handler";
import { User } from "@/models/user";
import { createUser } from "@/services/user-service";
import { maskMobile, decryptMobile } from "@/lib/mobile";
import type { PublicUser } from "@/types";

const createSchema = z.object({
  fullName: z.string().min(3),
  mobile: z.string().min(1),
  role: z.enum(["EMPLOYER_CEO", "EMPLOYER_EXPERT", "CONTRACTOR_CEO", "TECHNICIAN", "GROUP_SUPERVISOR", "RESIDENT_REP"]),
  unitId: z.string().nullable().optional(),
  companyId: z.string().nullable().optional(),
  groupIds: z.array(z.string()).optional(),
});

function toPublic(u: Record<string, any>): PublicUser {
  return {
    _id: String(u._id),
    fullName: u.fullName,
    mobileMasked: maskMobile(decryptMobile(u.mobileEnc)),
    role: u.role,
    organizationId: String(u.organizationId),
    companyId: u.companyId ? String(u.companyId) : null,
    unitId: u.unitId ? String(u.unitId) : null,
    isActive: u.isActive,
    lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : null,
    createdAt: new Date(u.createdAt).toISOString(),
  };
}

export { toPublic };

export const GET = handler({
  run: async ({ actor, query }) => {
    const filter: Record<string, unknown> = {};
    if (actor.role === "DEPUTY") {
      filter.organizationId = actor.organizationId;
      const role = query.get("role");
      if (role) filter.role = role;
    } else if (actor.role === "CONTRACTOR_CEO") {
      filter.companyId = actor.companyId;
      const role = query.get("role");
      if (role) filter.role = role;
    } else {
      filter._id = actor._id;
    }
    const search = query.get("search");
    if (search) filter.fullName = { $regex: search, $options: "i" };
    const all = await User.find(filter).sort({ createdAt: -1 }).lean();
    return ok(paginate(all.map(toPublic), query));
  },
});

export const POST = handler({
  roles: ["DEPUTY", "CONTRACTOR_CEO"],
  schema: createSchema,
  run: async ({ actor, body }) => ok(await createUser(actor, body)),
});

export const dynamic = "force-dynamic";
