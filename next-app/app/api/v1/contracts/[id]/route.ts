import { handler, ok, ApiError } from "@/lib/api-handler";
import { Contract } from "@/models/contract";
import { Company } from "@/models/company";
import { WorkGroup } from "@/models/work-group";
import { PriceItem } from "@/models/price-item";

export const GET = handler({
  run: async ({ params, actor }) => {
    const c = await Contract.findById(params.id).lean();
    if (!c) throw new ApiError("قرارداد پیدا نشد.", "NOT_FOUND", 404);
    if ((actor.role === "CONTRACTOR_CEO" || actor.role === "RESIDENT_REP") && String(c.contractorCompanyId) !== String(actor.companyId)) {
      throw new ApiError("دسترسی مجاز نیست.", "FORBIDDEN", 403);
    }
    const company = await Company.findById(c.contractorCompanyId).select("name").lean();
    const groups = await WorkGroup.find({ contractId: c._id }).select("name").lean();
    const priceItemCount = await PriceItem.countDocuments({ contractId: c._id });
    const samplePrices = await PriceItem.find({ contractId: c._id }).limit(10).lean();
    return ok({
      ...c, _id: String(c._id), contractorName: company?.name || "—",
      groupNames: groups.map((g) => g.name), priceItemCount,
      samplePrices: samplePrices.map((p) => ({ ...p, _id: String(p._id) })),
    });
  },
});

export const dynamic = "force-dynamic";
