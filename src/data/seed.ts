import type { DB, ApprovalEvent, AuditLog, AppNotification, ReportItem } from "../types";
import { jalaliKey, daysAgoJalali } from "../lib/utils";

export const DB_VERSION = 4;

const iso = (daysAgo: number, hours = 0) =>
  new Date(Date.now() - daysAgo * 86400000 - hours * 3600000).toISOString();

const jkey = (daysAgo: number) => jalaliKey(daysAgoJalali(daysAgo));

export function buildSeed(): DB {
  const events: ApprovalEvent[] = [];
  const audits: AuditLog[] = [];
  const notes: AppNotification[] = [];
  const items: ReportItem[] = [];

  const ev = (
    id: string, reportId: string, actorUserId: string, actorRole: ApprovalEvent["actorRole"],
    action: ApprovalEvent["action"], fromStatus: ApprovalEvent["fromStatus"],
    toStatus: ApprovalEvent["toStatus"], daysAgo: number, reason?: string
  ) => events.push({ id, reportId, actorUserId, actorRole, action, fromStatus, toStatus, reason, createdAt: iso(daysAgo) });

  const ad = (
    id: string, actorUserId: string, actorRole: AuditLog["actorRole"], action: string,
    entity: string, entityId: string, daysAgo: number, detail?: string
  ) => audits.push({ id, actorUserId, actorRole, action, entity, entityId, detail, createdAt: iso(daysAgo) });

  const nt = (
    id: string, userId: string, title: string, body: string,
    entity: AppNotification["entity"], entityId: string, daysAgo: number, hours = 0, read = false
  ) => notes.push({ id, userId, title, body, entity, entityId, readAt: read ? iso(daysAgo) : null, createdAt: iso(daysAgo, hours) });

  const ri = (
    id: string, reportId: string, priceItemId: string, titleSnapshot: string,
    unitSnapshot: string, unitPriceSnapshot: number, quantity: number,
    status: ReportItem["status"] = "pending"
  ) => items.push({ id, reportId, priceItemId, titleSnapshot, unitSnapshot, unitPriceSnapshot, quantity, totalAmount: unitPriceSnapshot * quantity, status });

  /* ---------------- r1: approved full chain ---------------- */
  ev("ev-01", "r1", "u-tech1", "TECHNICIAN", "submit", "draft", "supervisor_review", 3.4);
  ev("ev-02", "r1", "u-super", "GROUP_SUPERVISOR", "approve", "supervisor_review", "expert_review", 3.2);
  ev("ev-03", "r1", "u-eexp", "EMPLOYER_EXPERT", "approve", "expert_review", "employer_ceo_review", 3.1);
  ev("ev-04", "r1", "u-eceo", "EMPLOYER_CEO", "approve", "employer_ceo_review", "approved", 3.0);
  ri("ri-01", "r1", "pi1", "بازدید و سرویس پست توزیع ۲۰ کیلوولت", "دستگاه", 18500000, 2, "approved");
  ri("ri-02", "r1", "pi3", "تعویض کابل خودنگهدار", "متر", 850000, 40, "approved");

  /* r2: at employer ceo review */
  ev("ev-05", "r2", "u-tech1", "TECHNICIAN", "submit", "draft", "supervisor_review", 1.3);
  ev("ev-06", "r2", "u-super", "GROUP_SUPERVISOR", "approve", "supervisor_review", "expert_review", 1.2);
  ev("ev-07", "r2", "u-eexp", "EMPLOYER_EXPERT", "approve", "expert_review", "employer_ceo_review", 1.05);
  ri("ri-03", "r2", "pi2", "شستشوی مقره‌های خط ۲۰ کیلوولت", "کیلومتر", 42000000, 2, "pending");

  /* r3: at expert review */
  ev("ev-08", "r3", "u-tech2", "TECHNICIAN", "submit", "draft", "supervisor_review", 1.5);
  ev("ev-09", "r3", "u-super", "GROUP_SUPERVISOR", "approve", "supervisor_review", "expert_review", 1.1);
  ri("ri-04", "r3", "pi3", "تعویض کابل خودنگهدار", "متر", 850000, 60, "pending");

  /* r4: submitted today + extra work */
  ev("ev-10", "r4", "u-tech1", "TECHNICIAN", "submit", "draft", "supervisor_review", 0.2);
  ri("ri-05", "r4", "pi4", "تست و کالیبراسیون RTU", "دستگاه", 26000000, 1, "pending");
  ri("ri-06", "r4", "pi5", "پایش سامانه اسکادا", "شیفت", 12000000, 2, "pending");

  /* r5 rejected */
  ev("ev-11", "r5", "u-tech2", "TECHNICIAN", "submit", "draft", "supervisor_review", 4.5);
  ev("ev-12", "r5", "u-super", "GROUP_SUPERVISOR", "approve", "supervisor_review", "expert_review", 4.3);
  ev("ev-13", "r5", "u-eexp", "EMPLOYER_EXPERT", "reject", "expert_review", "rejected", 4.1, "مستندات عکس ناقص است؛ لطفاً عکس قبل و بعد کار ضمیمه شود.");
  ri("ri-07", "r5", "pi1", "بازدید و سرویس پست توزیع ۲۰ کیلوولت", "دستگاه", 18500000, 1, "rejected");

  /* r6 redo requested */
  ev("ev-14", "r6", "u-tech1", "TECHNICIAN", "submit", "draft", "supervisor_review", 2.4);
  ev("ev-15", "r6", "u-super", "GROUP_SUPERVISOR", "redo", "supervisor_review", "redo_requested", 2.2, "تعداد مقره‌های شستشو‌شده با مستندات عکس همخوانی ندارد؛ مجدداً اندازه‌گیری شود.");
  ri("ri-08", "r6", "pi2", "شستشوی مقره‌های خط ۲۰ کیلوولت", "کیلومتر", 42000000, 1, "redo");

  /* r7 disputed */
  ev("ev-16", "r7", "u-tech2", "TECHNICIAN", "submit", "draft", "supervisor_review", 5.5);
  ev("ev-17", "r7", "u-super", "GROUP_SUPERVISOR", "approve", "supervisor_review", "expert_review", 5.3);
  ev("ev-18", "r7", "u-eexp", "EMPLOYER_EXPERT", "approve", "expert_review", "employer_ceo_review", 5.2);
  ev("ev-19", "r7", "u-eceo", "EMPLOYER_CEO", "dispute", "employer_ceo_review", "disputed", 5.0, "مغایرت متراژ با اندازه‌گیری میدانی واحد؛ نیازمند بررسی مشترک.");
  ri("ri-09", "r7", "pi3", "تعویض کابل خودنگهدار", "متر", 850000, 25, "pending");

  /* r8 approved older + mapped extra */
  ev("ev-20", "r8", "u-tech1", "TECHNICIAN", "submit", "draft", "supervisor_review", 8.4);
  ev("ev-21", "r8", "u-super", "GROUP_SUPERVISOR", "approve", "supervisor_review", "expert_review", 8.3);
  ev("ev-22", "r8", "u-eexp", "EMPLOYER_EXPERT", "approve", "expert_review", "employer_ceo_review", 8.2);
  ev("ev-23", "r8", "u-eceo", "EMPLOYER_CEO", "approve", "employer_ceo_review", "approved", 8.0);
  ri("ri-10", "r8", "pi5", "پایش سامانه اسکادا", "شیفت", 12000000, 3, "approved");

  /* r9 approved oldest */
  ev("ev-24", "r9", "u-tech2", "TECHNICIAN", "submit", "draft", "supervisor_review", 10.4);
  ev("ev-25", "r9", "u-super", "GROUP_SUPERVISOR", "approve", "supervisor_review", "expert_review", 10.3);
  ev("ev-26", "r9", "u-eexp", "EMPLOYER_EXPERT", "approve", "expert_review", "employer_ceo_review", 10.2);
  ev("ev-27", "r9", "u-eceo", "EMPLOYER_CEO", "approve", "employer_ceo_review", "approved", 10.0);
  ri("ri-11", "r9", "pi1", "بازدید و سرویس پست توزیع ۲۰ کیلوولت", "دستگاه", 18500000, 1, "approved");
  ri("ri-12", "r9", "pi3", "تعویض کابل خودنگهدار", "متر", 850000, 20, "approved");

  /* r10 draft */
  ri("ri-13", "r10", "pi3", "تعویض کابل خودنگهدار", "متر", 850000, 12, "pending");

  ad("au-01", "u-deputy", "DEPUTY", "ایجاد شرکت", "company", "comp1", 120, "شرکت خدمات فنی توان‌گستر شرق");
  ad("au-02", "u-deputy", "DEPUTY", "ثبت قرارداد", "contract", "con1", 118, "نگهداری و بهره‌برداری شبکه توزیع زاهدان");
  ad("au-03", "u-cceo", "CONTRACTOR_CEO", "ایجاد گروه", "group", "g1", 110, "گروه خط و شبکه");
  ad("au-04", "u-cceo", "CONTRACTOR_CEO", "ایجاد گروه", "group", "g2", 110, "گروه اسکادا و اندازه‌گیری");
  ad("au-05", "u-cceo", "CONTRACTOR_CEO", "ایجاد آیتم بها", "priceItem", "pi1", 105);
  ad("au-06", "u-cceo", "CONTRACTOR_CEO", "تغییر قیمت آیتم", "priceItem", "pi3", 60, "قیمت از ۸۰۰٬۰۰۰ به ۸۵۰٬۰۰۰ ریال تغییر کرد — گزارش‌های قبلی بدون تغییر ماندند");
  ad("au-07", "u-tech1", "TECHNICIAN", "ارسال گزارش", "report", "r4", 0.2);
  ad("au-08", "u-eceo", "EMPLOYER_CEO", "تایید نهایی گزارش", "report", "r1", 3.0);
  ad("au-09", "u-cceo", "CONTRACTOR_CEO", "ارسال صورت‌وضعیت", "statement", "st1", 1.5, "مبلغ ۱۵۵٬۲۵۰٬۰۰۰ ریال");
  ad("au-10", "u-eceo", "EMPLOYER_CEO", "ایجاد اختلاف", "report", "r7", 5.0);
  ad("au-11", "u-deputy", "DEPUTY", "ایجاد کاربر", "user", "u-eexp", 90, "کارشناس کارفرما: امیر حسینی");
  ad("au-12", "u-cceo", "CONTRACTOR_CEO", "ایجاد نیرو", "user", "u-tech2", 85, "کارشناس شرکت: حسین کمالی");

  nt("n-01", "u-super", "گزارش جدید در انتظار بررسی", "علی بزرگزاده گزارش کار گروه اسکادا را ثبت کرد.", "report", "r4", 0.2);
  nt("n-02", "u-eexp", "گزارش تاییدشده سرپرست", "گزارش حسین کمالی (تعویض کابل خودنگهدار) آماده بررسی شماست.", "report", "r3", 1.1);
  nt("n-03", "u-eceo", "در انتظار تایید نهایی", "گزارش شستشوی مقره‌ها توسط کارشناس کارفرما تایید شد.", "report", "r2", 1.05);
  nt("n-04", "u-tech1", "درخواست انجام مجدد", "سرپرست گروه برای گزارش شستشوی مقره درخواست انجام مجدد ثبت کرد.", "report", "r6", 2.2);
  nt("n-05", "u-cceo", "تایید نهایی گزارش", "گزارش بازدید و سرویس پست‌ها توسط رییس کارفرما تایید نهایی شد.", "report", "r1", 3.0);
  nt("n-06", "u-deputy", "صورت‌وضعیت جدید", "شرکت توان‌گستر شرق صورت‌وضعیت دوره اخیر را ارسال کرد.", "statement", "st1", 1.5);
  nt("n-07", "u-tech1", "کار فوری محول شد", "رفع اتصالی فیدر ۱۲ پست دانشگاه به شما واگذار شد.", "task", "t1", 0.6);
  nt("n-08", "u-resident", "درخواست خرید جدید", "درخواست خرید ماژول RTU پست دانشگاه ثبت شد.", "purchase", "pr1", 1.8);
  nt("n-09", "u-tech1", "امتیاز کاری دریافت کردید", "بابت تایید نهایی گزارش، ۵ امتیاز مثبت در رزومه شما ثبت شد.", "report", "r1", 3.0, 0, true);

  return {
    version: DB_VERSION,
    seq: 1000,
    organizations: [
      { id: "org-dep", name: "معاونت بهره‌برداری برق منطقه‌ای سیستان و بلوچستان", type: "deputy", description: "بالاترین سطح نظارت و راهبری سامانه", isActive: true },
      { id: "org-emp", name: "واحد بهره‌برداری و توزیع برق زاهدان", type: "employer", description: "کارفرمای قرارداد نگهداری شبکه", isActive: true },
      { id: "org-con", name: "سازمان شرکت‌های پیمانکار", type: "contractor", isActive: true },
    ],
    companies: [
      { id: "comp1", name: "شرکت خدمات فنی توان‌گستر شرق", code: "TGS-01", contractorCeoUserId: "u-cceo", phone: "05433225511", address: "زاهدان، بلوار جمهوری، مجتمع فنی توان", description: "پیمانکار نگهداری و بهره‌برداری شبکه توزیع", isActive: true, createdAt: iso(120) },
    ],
    contracts: [
      { id: "con1", title: "نگهداری و بهره‌برداری شبکه توزیع برق زاهدان - ۱۴۰۴", contractType: "unit_price", contractorCompanyId: "comp1", startDateJ: jkey(120), endDateJ: jkey(-245), status: "active", publicNotes: "محدوده قرارداد شامل پست‌های ۲۰ کیلوولت شهر زاهدان و فیدرهای خروجی است.", isActive: true, createdAt: iso(118) },
    ],
    workUnits: [
      { id: "unit1", name: "واحد بهره‌برداری شبکه زاهدان", orgId: "org-emp", description: "نظارت میدانی بر گروه‌های پیمانکار", isActive: true },
    ],
    users: [
      { id: "u-deputy", fullName: "مهندس رضا قنبری", mobile: "09120000001", role: "DEPUTY", orgId: "org-dep", isActive: true, createdAt: iso(130), lastLoginAt: iso(0, 3) },
      { id: "u-eceo", fullName: "مهندس سارا محمدی", mobile: "09120000002", role: "EMPLOYER_CEO", orgId: "org-emp", unitId: "unit1", isActive: true, createdAt: iso(100), lastLoginAt: iso(0, 5) },
      { id: "u-eexp", fullName: "مهندس امیر حسینی", mobile: "09120000003", role: "EMPLOYER_EXPERT", orgId: "org-emp", unitId: "unit1", isActive: true, createdAt: iso(90), lastLoginAt: iso(1) },
      { id: "u-cceo", fullName: "مهندس کریم براهویی", mobile: "09120000004", role: "CONTRACTOR_CEO", orgId: "org-con", companyId: "comp1", isActive: true, createdAt: iso(115), lastLoginAt: iso(0, 8) },
      { id: "u-resident", fullName: "مهندس نرگس ریگی", mobile: "09120000005", role: "RESIDENT_REP", orgId: "org-con", companyId: "comp1", isActive: true, createdAt: iso(112) },
      { id: "u-super", fullName: "محمد دهواری", mobile: "09120000006", role: "GROUP_SUPERVISOR", orgId: "org-con", companyId: "comp1", isActive: true, createdAt: iso(110), lastLoginAt: iso(0, 2) },
      { id: "u-tech1", fullName: "علی بزرگزاده", mobile: "09120000007", role: "TECHNICIAN", orgId: "org-con", companyId: "comp1", isActive: true, createdAt: iso(105), lastLoginAt: iso(0, 1) },
      { id: "u-tech2", fullName: "حسین کمالی", mobile: "09120000008", role: "TECHNICIAN", orgId: "org-con", companyId: "comp1", isActive: true, createdAt: iso(85) },
    ],
    groups: [
      { id: "g1", name: "گروه خط و شبکه", description: "نگهداری خطوط ۲۰ کیلوولت، پست‌های توزیع و کابل‌های خودنگهدار", companyId: "comp1", contractId: "con1", workUnitId: "unit1", supervisorUserId: "u-super", isActive: true, createdAt: iso(110) },
      { id: "g2", name: "گروه اسکادا و اندازه‌گیری", description: "پایش سامانه اسکادا، RTU و کنتورهای هوشمند", companyId: "comp1", contractId: "con1", workUnitId: "unit1", supervisorUserId: "u-super", isActive: true, createdAt: iso(110) },
      { id: "g3", name: "گروه مخابرات و فیبر نوری", description: "نگهداری بستر مخابراتی و فیبر نوری شبکه", companyId: "comp1", contractId: "con1", workUnitId: "unit1", supervisorUserId: null, isActive: true, createdAt: iso(109) },
    ],
    memberships: [
      { id: "m-01", userId: "u-super", groupId: "g1", membershipType: "supervisor", isActive: true },
      { id: "m-02", userId: "u-tech1", groupId: "g1", membershipType: "member", isActive: true },
      { id: "m-03", userId: "u-tech2", groupId: "g1", membershipType: "member", isActive: true },
      { id: "m-04", userId: "u-eexp", groupId: "g1", membershipType: "employer_expert", isActive: true },
      { id: "m-05", userId: "u-eceo", groupId: "g1", membershipType: "employer_ceo", isActive: true },
      { id: "m-06", userId: "u-super", groupId: "g2", membershipType: "supervisor", isActive: true },
      { id: "m-07", userId: "u-tech1", groupId: "g2", membershipType: "member", isActive: true },
      { id: "m-08", userId: "u-eexp", groupId: "g2", membershipType: "employer_expert", isActive: true },
      { id: "m-09", userId: "u-eceo", groupId: "g2", membershipType: "employer_ceo", isActive: true },
      { id: "m-10", userId: "u-eceo", groupId: "g3", membershipType: "employer_ceo", isActive: true },
    ],
    priceItems: [
      { id: "pi1", code: "010101", title: "بازدید و سرویس پست توزیع ۲۰ کیلوولت", unit: "دستگاه", unitPrice: 18500000, contractId: "con1", groupIds: ["g1"], isActive: true, createdAt: iso(105) },
      { id: "pi2", code: "010102", title: "شستشوی مقره‌های خط ۲۰ کیلوولت", unit: "کیلومتر", unitPrice: 42000000, contractId: "con1", groupIds: ["g1"], isActive: true, createdAt: iso(105) },
      { id: "pi3", code: "010201", title: "تعویض کابل خودنگهدار", unit: "متر", unitPrice: 850000, contractId: "con1", groupIds: ["g1"], isActive: true, createdAt: iso(105), updatedAt: iso(60) },
      { id: "pi4", code: "020101", title: "تست و کالیبراسیون RTU", unit: "دستگاه", unitPrice: 26000000, contractId: "con1", groupIds: ["g2"], isActive: true, createdAt: iso(104) },
      { id: "pi5", code: "020102", title: "پایش سامانه اسکادا", unit: "شیفت", unitPrice: 12000000, contractId: "con1", groupIds: ["g2"], isActive: true, createdAt: iso(104) },
      { id: "pi6", code: "030101", title: "فیبرکشی و اسپلایس", unit: "کیلومتر", unitPrice: 155000000, contractId: "con1", groupIds: ["g3"], isActive: true, createdAt: iso(104) },
    ],
    tasks: [
      { id: "t1", title: "رفع اتصالی فیدر ۱۲ پست دانشگاه", description: "اتصالی فاز ۲ فیدر ۱۲ گزارش شده؛ اعزام اکیپ و رفع عیب در اولین فرصت.", createdByUserId: "u-eexp", assignedUserIds: ["u-tech1", "u-tech2"], assignedGroupIds: ["g1"], contractId: "con1", priority: "urgent", dueDateJ: jkey(0), status: "in_progress", sourceRole: "EMPLOYER_EXPERT", createdAt: iso(0, 6) },
      { id: "t2", title: "بازدید و سرویس پست‌های ۲۰ کیلوولت شهرک صنعتی", description: "سرویس کامل دو دستگاه پست همراه با ثبت دمای اتصالات.", createdByUserId: "u-super", assignedUserIds: ["u-tech1"], assignedGroupIds: ["g1"], contractId: "con1", priority: "high", dueDateJ: jkey(-2), status: "open", sourceRole: "GROUP_SUPERVISOR", createdAt: iso(1) },
      { id: "t3", title: "پایش شیفت شب سامانه اسکادا", description: "پایش آلارم‌های شیفت شب و ثبت وقایع سامانه.", createdByUserId: "u-cceo", assignedUserIds: ["u-tech1"], assignedGroupIds: ["g2"], contractId: "con1", priority: "medium", dueDateJ: jkey(-5), status: "open", sourceRole: "CONTRACTOR_CEO", createdAt: iso(2) },
      { id: "t4", title: "تحویل گزارش ماهانه گروه خط", description: "جمع‌بندی عملکرد ماهانه گروه خط و شبکه.", createdByUserId: "u-eceo", assignedUserIds: [], assignedGroupIds: ["g1"], contractId: "con1", priority: "low", dueDateJ: jkey(4), status: "done", sourceRole: "EMPLOYER_CEO", createdAt: iso(9) },
    ],
    reports: [
      { id: "r1", reportType: "work_report", userId: "u-tech1", companyId: "comp1", groupId: "g1", contractId: "con1", unitId: "unit1", reportDateJ: jkey(3), status: "approved", description: "سرویس دو دستگاه پست شهرک صنعتی و تعویض ۴۰ متر کابل خودنگهدار فیدر ۵.", taskReferenceId: "t4", idempotencyKey: "idem-r1", submittedAt: iso(3.4), currentReviewerRole: null, createdAt: iso(3.5) },
      { id: "r2", reportType: "work_report", userId: "u-tech1", companyId: "comp1", groupId: "g1", contractId: "con1", unitId: "unit1", reportDateJ: jkey(1), status: "employer_ceo_review", description: "شستشوی مقره‌های خط خروجی پست دانشجو به طول ۲ کیلومتر.", idempotencyKey: "idem-r2", submittedAt: iso(1.3), currentReviewerRole: "EMPLOYER_CEO", createdAt: iso(1.4) },
      { id: "r3", reportType: "work_report", userId: "u-tech2", companyId: "comp1", groupId: "g1", contractId: "con1", unitId: "unit1", reportDateJ: jkey(1), status: "expert_review", description: "تعویض ۶۰ متر کابل خودنگهدار در معبر ۱۴ شهریور.", idempotencyKey: "idem-r3", submittedAt: iso(1.5), currentReviewerRole: "EMPLOYER_EXPERT", createdAt: iso(1.6) },
      { id: "r4", reportType: "work_report", userId: "u-tech1", companyId: "comp1", groupId: "g2", contractId: "con1", unitId: "unit1", reportDateJ: jkey(0), status: "supervisor_review", description: "کالیبراسیون RTU پست دانشگاه و دو شیفت پایش اسکادا؛ تعمیر ترمینال فیدر ۱۲ خارج از فهرست بها انجام شد.", taskReferenceId: "t1", idempotencyKey: "idem-r4", submittedAt: iso(0.2), currentReviewerRole: "GROUP_SUPERVISOR", createdAt: iso(0.3) },
      { id: "r5", reportType: "work_report", userId: "u-tech2", companyId: "comp1", groupId: "g1", contractId: "con1", unitId: "unit1", reportDateJ: jkey(4), status: "rejected", description: "بازدید و سرویس پست بلوار ملت.", idempotencyKey: "idem-r5", submittedAt: iso(4.5), currentReviewerRole: null, createdAt: iso(4.6) },
      { id: "r6", reportType: "work_report", userId: "u-tech1", companyId: "comp1", groupId: "g1", contractId: "con1", unitId: "unit1", reportDateJ: jkey(2), status: "redo_requested", description: "شستشوی مقره‌های خط شهرک صنعتی.", idempotencyKey: "idem-r6", submittedAt: iso(2.4), currentReviewerRole: null, createdAt: iso(2.5) },
      { id: "r7", reportType: "work_report", userId: "u-tech2", companyId: "comp1", groupId: "g1", contractId: "con1", unitId: "unit1", reportDateJ: jkey(5), status: "disputed", description: "تعویض کابل خودنگهدار معبر دانشگاه.", idempotencyKey: "idem-r7", submittedAt: iso(5.5), currentReviewerRole: null, createdAt: iso(5.6) },
      { id: "r8", reportType: "work_report", userId: "u-tech1", companyId: "comp1", groupId: "g2", contractId: "con1", unitId: "unit1", reportDateJ: jkey(8), status: "approved", description: "سه شیفت پایش اسکادا و جابجایی کابل ورودی پست.", idempotencyKey: "idem-r8", submittedAt: iso(8.4), currentReviewerRole: null, createdAt: iso(8.5) },
      { id: "r9", reportType: "work_report", userId: "u-tech2", companyId: "comp1", groupId: "g1", contractId: "con1", unitId: "unit1", reportDateJ: jkey(10), status: "approved", description: "سرویس پست بلوار جمهوری و تعویض ۲۰ متر کابل.", idempotencyKey: "idem-r9", submittedAt: iso(10.4), currentReviewerRole: null, createdAt: iso(10.5) },
      { id: "r10", reportType: "work_report", userId: "u-tech1", companyId: "comp1", groupId: "g1", contractId: "con1", unitId: "unit1", reportDateJ: jkey(0), status: "draft", description: "پیش‌نویس گزارش تعویض کابل معبر ۱۷.", idempotencyKey: "idem-r10", currentReviewerRole: null, createdAt: iso(0.1) },
      { id: "dr1", reportType: "daily_report", userId: "u-eexp", companyId: "comp1", groupId: "g1", contractId: "con1", unitId: "unit1", reportDateJ: jkey(0), status: "approved", description: "بازدید میدانی از گروه خط و شبکه؛ بررسی مستندات گزارش‌های هفته؛ هماهنگی رفع اتصالی فیدر ۱۲.", idempotencyKey: "idem-dr1", currentReviewerRole: null, createdAt: iso(0, 4) },
    ],
    reportItems: items,
    extraItems: [
      { id: "ex1", reportId: "r4", description: "تعمیر ترمینال فیدر ۱۲ پست دانشگاه - خارج از فهرست بها", status: "pending", createdAt: iso(0.2) },
      { id: "ex2", reportId: "r8", description: "جابجایی کابل ورودی پست اسکادا", status: "mapped", mappedPriceItemId: "pi3", mappedQuantity: 15, mappedAmount: 12750000, mappedByUserId: "u-resident", mappingNote: "معادل آیتم تعویض کابل خودنگهدار در نظر گرفته شد.", createdAt: iso(8.3) },
    ],
    attachments: [
      { id: "at-01", reportId: "r1", kind: "image", fileName: "پست-شهرک-صنعتی-۱.jpg", size: 420000, createdAt: iso(3.5) },
      { id: "at-02", reportId: "r1", kind: "image", fileName: "کابل-خودنگهدار-فیدر۵.jpg", size: 385000, createdAt: iso(3.5) },
      { id: "at-03", reportId: "r4", kind: "image", fileName: "rtu-دانشگاه.jpg", size: 298000, createdAt: iso(0.3) },
      { id: "at-04", reportId: "r3", kind: "image", fileName: "کابل-۱۴شهریور.jpg", size: 350000, createdAt: iso(1.6) },
    ],
    approvalEvents: events,
    auditLogs: audits,
    scoreEvents: [
      { id: "sc-01", userId: "u-tech1", reportId: "r1", score: 5, reason: "تایید نهایی گزارش کار", createdByRole: "EMPLOYER_CEO", createdAt: iso(3.0) },
      { id: "sc-02", userId: "u-tech1", reportId: "r8", score: 5, reason: "تایید نهایی گزارش کار", createdByRole: "EMPLOYER_CEO", createdAt: iso(8.0) },
      { id: "sc-03", userId: "u-tech2", reportId: "r9", score: 5, reason: "تایید نهایی گزارش کار", createdByRole: "EMPLOYER_CEO", createdAt: iso(10.0) },
    ],
    notifications: notes,
    purchaseRequests: [
      { id: "pr1", requesterUserId: "u-tech1", companyId: "comp1", contractId: "con1", title: "ماژول RTU پست دانشگاه", itemDescription: "ماژول ورودی آنالوگ RTU مدل SC-2400 به همراه منابع تغذیه", quantity: 2, estimatedPrice: 185000000, reason: "ماژول فعلی پس از اتصالی فیدر ۱۲ آسیب دیده و نیاز به تعویض دارد.", priority: "high", status: "submitted", createdAt: iso(1.8) },
      { id: "pr2", requesterUserId: "u-super", companyId: "comp1", contractId: "con1", title: "دستکش عایق ۲۰ کیلوولت", itemDescription: "دستکش عایق کلاس ۲ با روکش چرمی", quantity: 10, estimatedPrice: 45000000, reason: "تجهیز ایمنی اکیپ‌های خط", priority: "medium", status: "purchased", decidedByUserId: "u-resident", decisionNote: "تایید و خرید از تأمین‌کننده مجاز انجام شد.", purchasedAt: iso(6), createdAt: iso(9) },
      { id: "pr3", requesterUserId: "u-resident", companyId: "comp1", contractId: "con1", title: "قرقره فیبر نوری ۴۸ کور", itemDescription: "فیبر نوری ADSS 48 core قرقره ۳ کیلومتری", quantity: 4, estimatedPrice: 96000000, reason: "توسعه بستر مخابراتی پست‌های جدید", priority: "low", status: "approved", decidedByUserId: "u-cceo", decisionNote: "با خرید موافقت شد؛ استعلام قیمت انجام شود.", createdAt: iso(7) },
    ],
    statements: [
      { id: "st1", contractorCompanyId: "comp1", contractId: "con1", periodStartJ: jkey(10), periodEndJ: jkey(0), reportIds: ["r1", "r8", "r9"], totalAmount: 155250000, status: "submitted", createdByUserId: "u-cceo", createdAt: iso(1.5) },
    ],
    otp: null,
  };
}
