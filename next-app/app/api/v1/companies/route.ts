import { z } from "zod";
import { handler, ok, paginate } from "@/lib/api-handler";
import { Company } from "@/models/company";
import { Contract } from "@/models/contract";
import { User } from "@/models/user";
import { createCompany } from "@/services/company-service";

const createSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(1),
  description: z.string().optional(),
  ceoFullName: z.string().min(3),
  ceoMobile: z.string().min(1),
});

export const GET = handler({
  roles: ["DEPUTY"],
  run: async ({ query }) => {
    const search = query.get("search") || "";
    const all = await Company.find(search ? { name: { $regex: search, $options: "i" } } : {}).sort({ createdAt: -1 }).lean();
    const enriched = await Promise.all(all.map(async (c) => ({
      ...c,
      _id: String(c._id),
      contractCount: await Contract.countDocuments({ contractorCompanyId: c._id }),
      ceoName: c.contractorCeoUserId ? (await User.findById(c.contractorCeoUserId).select("fullName").lean())?.fullName || null : null,
    })));
    return ok(paginate(enriched, query));
  },
});

export const POST = handler({
  roles: ["DEPUTY"],
  schema: createSchema,
  run: async ({ actor, body }) => ok(await createCompany(actor, body)),
});

export const dynamic = "force-dynamic";
