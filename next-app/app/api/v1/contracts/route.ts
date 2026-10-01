import { z } from "zod";
import { handler, ok, paginate } from "@/lib/api-handler";
import { Contract } from "@/models/contract";
import { Company } from "@/models/company";
import { createContract } from "@/services/company-service";
import { jalaliDateSchema } from "@/lib/validators";

const createSchema = z.object({
  title: z.string().min(3),
  contractType: z.enum(["volume", "unit_price", "other"]),
  contractorCompanyId: z.string().min(1),
  startDate: jalaliDateSchema,
  endDate: jalaliDateSchema,
  status: z.enum(["active", "completed", "terminated"]),
  publicNotes: z.string().optional(),
});

export const GET = handler({
  run: async ({ actor, query }) => {
    const filter: Record<string, unknown> = {};
    const search = query.get("search");
    const status = query.get("status");
    if (search) filter.title = { $regex: search, $options: "i" };
    if (status) filter.status = status;
    if (actor.role === "CONTRACTOR_CEO" || actor.role === "RESIDENT_REP") filter.contractorCompanyId = actor.companyId;
    const all = await Contract.find(filter).sort({ createdAt: -1 }).lean();
    const companies = await Company.find({}).select("name").lean();
    const nameOf = (id: unknown) => companies.find((c) => String(c._id) === String(id))?.name || "—";
    return ok(paginate(all.map((c) => ({ ...c, _id: String(c._id), contractorName: nameOf(c.contractorCompanyId) })), query));
  },
});

export const POST = handler({
  roles: ["DEPUTY"],
  schema: createSchema,
  run: async ({ actor, body }) => ok(await createContract(actor, body)),
});

export const dynamic = "force-dynamic";
