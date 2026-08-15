import { Company } from "@/models/company";
import { Contract } from "@/models/contract";
import { User } from "@/models/user";
import { ApiError } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";
import { normalizeMobile, hashMobile, encryptMobile } from "@/lib/mobile";

export async function createCompany(actor: InstanceType<typeof User>, input: { name: string; code: string; description?: string; ceoFullName?: string; ceoMobile?: string }) {
  const exists = await Company.findOne({ code: input.code });
  if (exists) throw new ApiError("کد شرکت تکراری است.", "DUPLICATE_CODE");
  const company = await Company.create({
    name: input.name.trim(), code: input.code.trim(),
    organizationId: actor.organizationId, description: input.description,
  });
  let ceoId: string | null = null;
  if (input.ceoFullName && input.ceoMobile) {
    const normalized = normalizeMobile(input.ceoMobile);
    if (!normalized) throw new ApiError("شماره موبایل رییس شرکت نامعتبر است.", "INVALID_MOBILE");
    const dup = await User.findOne({ mobileHash: hashMobile(normalized) });
    if (dup) throw new ApiError("این شماره موبایل قبلا ثبت شده است.", "DUPLICATE_MOBILE");
    const ceo = await User.create({
      fullName: input.ceoFullName.trim(),
      mobileNormalized: normalized, mobileHash: hashMobile(normalized), mobileEnc: encryptMobile(normalized),
      role: "CONTRACTOR_CEO", organizationId: actor.organizationId, companyId: company._id, isActive: true,
    });
    company.contractorCeoUserId = ceo._id;
    await company.save();
    ceoId = String(ceo._id);
    await logAudit({ actorUserId: actor._id, actorRole: actor.role, action: "ایجاد رییس شرکت پیمانکار", entity: "user", entityId: String(ceo._id), detail: ceo.fullName });
  }
  await logAudit({ actorUserId: actor._id, actorRole: actor.role, action: "ایجاد شرکت پیمانکار", entity: "company", entityId: String(company._id), detail: company.name });
  return { id: String(company._id), ceoId };
}

export async function createContract(actor: InstanceType<typeof User>, input: {
  title: string; contractType: "volume" | "unit_price" | "other";
  contractorCompanyId: string; startDate: string; endDate: string;
  status: "active" | "completed" | "terminated"; publicNotes?: string;
}) {
  const company = await Company.findById(input.contractorCompanyId);
  if (!company) throw new ApiError("شرکت پیمانکار پیدا نشد.", "BAD_COMPANY");
  const doc = await Contract.create({
    title: input.title.trim(),
    contractType: input.contractType,
    contractorCompanyId: company._id,
    employerOrganizationId: actor.organizationId,
    startDate: input.startDate, endDate: input.endDate,
    status: input.status, publicNotes: input.publicNotes,
  });
  await logAudit({ actorUserId: actor._id, actorRole: actor.role, action: "ایجاد قرارداد", entity: "contract", entityId: String(doc._id), detail: doc.title });
  return { id: String(doc._id) };
}
