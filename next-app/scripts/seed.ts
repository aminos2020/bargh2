/**
 * Seed توسعه — فقط برای environment توسعه.
 * اجرا: npm run seed   (نیاز به MONGODB_URI در .env)
 */
import "dotenv/config";
import mongoose from "mongoose";
import { Organization } from "@/models/organization";
import { Company } from "@/models/company";
import { Contract } from "@/models/contract";
import { User } from "@/models/user";
import { WorkUnit } from "@/models/work-unit";
import { WorkGroup } from "@/models/work-group";
import { GroupMembership } from "@/models/group-membership";
import { PriceItem } from "@/models/price-item";
import { Task } from "@/models/task";
import { WorkReport } from "@/models/work-report";
import { ReportItem } from "@/models/report-item";
import { ApprovalEvent } from "@/models/approval-event";
import { hashMobile, encryptMobile } from "@/lib/mobile";
import { jalaliKey, toJalali } from "@/lib/date";

const users = [
  { fullName: "مدیر معاونت بهره‌برداری", mobile: "09120000001", role: "DEPUTY" },
  { fullName: "رییس واحد بهره‌برداری", mobile: "09120000002", role: "EMPLOYER_CEO" },
  { fullName: "کارشناس نظارت کارفرما", mobile: "09120000003", role: "EMPLOYER_EXPERT" },
  { fullName: "رییس شرکت توان‌گستر", mobile: "09120000004", role: "CONTRACTOR_CEO" },
  { fullName: "نماینده مقیم شرکت", mobile: "09120000005", role: "RESIDENT_REP" },
  { fullName: "سرپرست گروه خطوط", mobile: "09120000006", role: "GROUP_SUPERVISOR" },
  { fullName: "کارشناس فنی شرکت", mobile: "09120000007", role: "TECHNICIAN" },
] as const;

function daysAgoKey(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return jalaliKey(toJalali(d));
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tavanban");
  // eslint-disable-next-line no-console
  console.log("🌱 شروع seed توسعه...");

  // سازمان‌ها
  const deputyOrg = await Organization.findOneAndUpdate({ type: "deputy" }, { name: "معاونت بهره‌برداری برق منطقه‌ای سیستان و بلوچستان", type: "deputy", isActive: true }, { upsert: true, new: true });
  const contractorOrg = await Organization.findOneAndUpdate({ type: "contractor" }, { name: "شرکت‌های پیمانکاری", type: "contractor", isActive: true }, { upsert: true, new: true });

  // کاربران
  const created: Record<string, any> = {};
  for (const u of users) {
    created[u.role] = await User.findOneAndUpdate(
      { mobileHash: hashMobile(u.mobile) },
      { fullName: u.fullName, mobileNormalized: u.mobile, mobileHash: hashMobile(u.mobile), mobileEnc: encryptMobile(u.mobile), role: u.role, organizationId: u.role === "CONTRACTOR_CEO" || u.role === "RESIDENT_REP" || u.role === "GROUP_SUPERVISOR" || u.role === "TECHNICIAN" ? contractorOrg._id : deputyOrg._id, isActive: true },
      { upsert: true, new: true }
    );
  }

  // شرکت و قرارداد
  const company = await Company.findOneAndUpdate(
    { code: "C-101" },
    { name: "شرکت فنی مهندسی توان‌گستر", code: "C-101", organizationId: contractorOrg._id, contractorCeoUserId: created["CONTRACTOR_CEO"]._id, isActive: true },
    { upsert: true, new: true }
  );
  for (const role of ["CONTRACTOR_CEO", "RESIDENT_REP", "GROUP_SUPERVISOR", "TECHNICIAN"] as const) {
    created[role].companyId = company._id;
    await created[role].save();
  }

  const contract = await Contract.findOneAndUpdate(
    { title: "قرارداد نگهداری شبکه توزیع — ۱۴۰۴" },
    { title: "قرارداد نگهداری شبکه توزیع — ۱۴۰۴", contractType: "unit_price", contractorCompanyId: company._id, employerOrganizationId: deputyOrg._id, startDate: daysAgoKey(60), endDate: daysAgoKey(-300), status: "active", publicNotes: "قرارداد فهرست بهایی نگهداری و بهره‌برداری", isActive: true },
    { upsert: true, new: true }
  );

  // واحد و گروه‌ها
  const unit = await WorkUnit.findOneAndUpdate({ name: "واحد بهره‌برداری خطوط" }, { name: "واحد بهره‌برداری خطوط", organizationId: deputyOrg._id, isActive: true }, { upsert: true, new: true });
  const mkGroup = async (name: string, supervisor: boolean) =>
    WorkGroup.findOneAndUpdate(
      { name },
      { name, description: `گروه عملیاتی ${name}`, companyId: company._id, contractId: contract._id, workUnitId: unit._id, supervisorUserId: supervisor ? created["GROUP_SUPERVISOR"]._id : null, isActive: true },
      { upsert: true, new: true }
    );
  const gLines = await mkGroup("گروه خطوط ۶۳ کیلوولت", true);
  const gScada = await mkGroup("گروه اسکادا و مخابرات", true);

  // عضویت‌ها
  const ensure = async (userId: any, groupId: any, type: string) =>
    GroupMembership.findOneAndUpdate({ userId, groupId, membershipType: type }, { isActive: true }, { upsert: true });
  await ensure(created["TECHNICIAN"]._id, gLines._id, "member");
  await ensure(created["TECHNICIAN"]._id, gScada._id, "member");
  await ensure(created["GROUP_SUPERVISOR"]._id, gLines._id, "supervisor");
  await ensure(created["GROUP_SUPERVISOR"]._id, gScada._id, "supervisor");
  await ensure(created["EMPLOYER_EXPERT"]._id, gLines._id, "employer_expert");
  await ensure(created["EMPLOYER_EXPERT"]._id, gScada._id, "employer_expert");
  await ensure(created["EMPLOYER_CEO"]._id, gLines._id, "employer_ceo");

  // فهرست بها
  const prices = [
    { code: "010101", title: "کابل‌کشی فشار متوسط ۲۰ کیلوولت", unit: "کیلومتر", unitPrice: 850_000_000 },
    { code: "020205", title: "نصب و تنظیم کلید هوایی", unit: "دستگاه", unitPrice: 96_000_000 },
    { code: "030411", title: "بازدید و آچارکشی اتصالات پست", unit: "عدد", unitPrice: 12_500_000 },
    { code: "040720", title: "تست رله حفاظتی فیدر", unit: "فیدر", unitPrice: 38_000_000 },
  ];
  const priceDocs: any[] = [];
  for (const p of prices) {
    priceDocs.push(await PriceItem.findOneAndUpdate({ code: p.code, contractId: contract._id }, { ...p, contractId: contract._id, groupIds: [gLines._id, gScada._id], isActive: true }, { upsert: true, new: true }));
  }

  // کارهای محوله
  await Task.findOneAndUpdate(
    { title: "بازدید اضطراری فیدر ۳ پست زاهدان" },
    { title: "بازدید اضطراری فیدر ۳ پست زاهدان", description: "پس از اعلام خطا، بازدید کامل انجام و گزارش ثبت شود.", createdByUserId: created["EMPLOYER_EXPERT"]._id, assignedUserIds: [created["TECHNICIAN"]._id], assignedGroupIds: [gLines._id], groupId: gLines._id, priority: "urgent", dueDate: daysAgoKey(-1), status: "open", sourceRole: "EMPLOYER_EXPERT" },
    { upsert: true }
  );

  // گزارش‌های نمونه در وضعیت‌های مختلف
  const mkReport = async (status: string, dayOffset: number, reviewer: string | null, actor: any = created["TECHNICIAN"]) => {
    const idem = `seed-${status}-${dayOffset}`;
    const existing = await WorkReport.findOne({ idempotencyKey: idem, userId: actor._id });
    if (existing) return existing;
    const r = await WorkReport.create({
      reportType: "work_report", userId: actor._id, companyId: company._id, groupId: gLines._id, contractId: contract._id, unitId: unit._id,
      reportDateJ: daysAgoKey(dayOffset), status, description: "گزارش نمونه seed توسعه", idempotencyKey: idem, submittedAt: new Date(Date.now() - dayOffset * 864e5), currentReviewerRole: reviewer,
    });
    await ReportItem.create({ reportId: r._id, priceItemId: priceDocs[0]._id, titleSnapshot: priceDocs[0].title, unitSnapshot: priceDocs[0].unit, unitPriceSnapshot: priceDocs[0].unitPrice, quantity: 2, totalAmount: priceDocs[0].unitPrice * 2, status: status === "rejected" ? "rejected" : status === "redo_requested" ? "redo" : status === "approved" ? "approved" : "pending" });
    await ApprovalEvent.create({ reportId: r._id, actorUserId: actor._id, actorRole: actor.role, action: "submit", fromStatus: "draft", toStatus: "supervisor_review" });
    return r;
  };
  await mkReport("approved", 6, null);
  await mkReport("expert_review", 2, "EMPLOYER_EXPERT");
  await mkReport("supervisor_review", 0, "GROUP_SUPERVISOR");
  await mkReport("rejected", 4, null);
  await mkReport("redo_requested", 1, null);

  // eslint-disable-next-line no-console
  console.log("✅ seed کامل شد. کاربران (ورود با OTP — در dev کد در console سرور چاپ می‌شود):");
  for (const u of users) console.log(`   ${u.role.padEnd(17)} ${u.mobile}  ${u.fullName}`);
  await mongoose.disconnect();
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
