import { handler, ok, ApiError } from "@/lib/api-handler";
import { Company } from "@/models/company";
import { Contract } from "@/models/contract";
import { User } from "@/models/user";
import { maskMobile, decryptMobile } from "@/lib/mobile";

export const GET = handler({
  roles: ["DEPUTY"],
  run: async ({ params }) => {
    const c = await Company.findById(params.id).lean();
    if (!c) throw new ApiError("شرکت پیدا نشد.", "NOT_FOUND", 404);
    const ceo = c.contractorCeoUserId ? await User.findById(c.contractorCeoUserId).lean() : null;
    const contracts = await Contract.find({ contractorCompanyId: c._id }).sort({ createdAt: -1 }).lean();
    const personnel = await User.find({ companyId: c._id, role: { $in: ["TECHNICIAN", "GROUP_SUPERVISOR", "RESIDENT_REP"] } }).lean();
    return ok({
      ...c, _id: String(c._id),
      ceo: ceo ? { _id: String(ceo._id), fullName: ceo.fullName, mobileMasked: maskMobile(decryptMobile(ceo.mobileEnc)) } : null,
      contracts: contracts.map((x) => ({ ...x, _id: String(x._id) })),
      personnel: personnel.map((x) => ({ _id: String(x._id), fullName: x.fullName, role: x.role, mobileMasked: maskMobile(decryptMobile(x.mobileEnc)) })),
    });
  },
});

export const dynamic = "force-dynamic";
