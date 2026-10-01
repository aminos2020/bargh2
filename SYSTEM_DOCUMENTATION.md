# مستندات جامع سیستم توان‌بان

## فهرست مطالب
1. [مقدمه](#مقدمه)
2. [تعریف نقش‌ها](#تعریف-نقش‌ها)
3. [مدل‌های دیتابیس (ERD)](#مدل‌های-دیتابیس)
4. [ماتریس دسترسی‌ها](#ماتریس-دسترسی‌ها)
5. [گردش کارها](#گردش-کارها)
6. [امکانات تفصیلی هر نقش](#امکانات-تفصیلی-هر-نقش)

---

## مقدمه

توان‌بان یک سامانه سازمانی برای مدیریت نیروی انسانی، گزارش کار، تایید کارها، فهرست آحاد بها، قراردادها، صورت‌وضعیت و همکاری بین معاونت بهره‌برداری برق منطقه‌ای، کارفرما و شرکت‌های پیمانکار است.

### ویژگی‌های کلیدی
- **7 نقش اصلی** با سطوح دسترسی متفاوت
- **گردش کار تایید 3 مرحله‌ای** برای گزارش‌های کار
- **سیستم امتیازدهی** برای تکنسین‌ها
- **ثبت گزارش آفلاین** با همگام‌سازی خودکار
- **ایزولاسیون گروه‌ها** - هر گروه فقط داده‌های خود را می‌بیند
- **Snapshot اقتصادی** - تغییر قیمت روی گزارش‌های قبلی اثر نمی‌گذارد
- **Audit Log کامل** - تمام تغییرات مهم ثبت می‌شوند

---

## تعریف نقش‌ها

### 1. DEPUTY (معاونت بهره‌برداری)
**توضیح:** بالاترین سطح نظارت و راهبری سامانه
**دامنه:** کل سازمان
**مسئولیت‌ها:**
- مدیریت شرکت‌های پیمانکار
- مدیریت قراردادها
- ایجاد کاربران کارفرمایی
- نظارت بر تمام گزارش‌ها و صورت‌وضعیت‌ها
- تایید نهایی صورت‌وضعیت‌ها
- مشاهده Audit Log کامل

### 2. EMPLOYER_CEO (رییس کارفرما)
**توضیح:** رییس واحد کارفرمایی
**دامنه:** واحدهای زیرمجموعه خود
**مسئولیت‌ها:**
- تایید نهایی گزارش‌ها
- مدیریت گروه‌های مرتبط با واحد
- تخصیص نیروهای شرکتی به گروه‌ها (بدون تغییر مالکیت)
- مشاهده گزارش‌های روزانه کارشناسان
- سپردن کار به گروه‌ها یا کاربران

### 3. EMPLOYER_EXPERT (کارشناس کارفرما)
**توضیح:** نماینده نظارتی کارفرما
**دامنه:** گروه‌های مجاز خود
**مسئولیت‌ها:**
- بررسی و تایید/رد گزارش‌های تاییدشده توسط سرپرست
- ثبت گزارش روزانه فعالیت خود
- سپردن کار به نیروهای شرکتی
- مشاهده کارهای محول‌شده

### 4. CONTRACTOR_CEO (رییس شرکت پیمانکار)
**توضیح:** رییس شرکت پیمانکار
**دامنه:** شرکت خود
**مسئولیت‌ها:**
- مدیریت نیروهای شرکت
- ایجاد و مدیریت گروه‌ها
- تعیین سرپرست گروه
- مدیریت فهرست آحاد بها
- ایجاد صورت‌وضعیت از گزارش‌های تایید نهایی
- مشاهده تمام فعالیت‌های شرکت

### 5. RESIDENT_REP (نماینده مقیم)
**توضیح:** مسئول معادل‌سازی کارهای اضافی و مدیریت خرید
**دامنه:** شرکت پیمانکار
**مسئولیت‌ها:**
- معادل‌سازی کارهای اضافی با آیتم‌های فهرست بها
- مدیریت درخواست‌های خرید
- تایید/رد درخواست‌های خرید
- ثبت نتیجه خرید

### 6. GROUP_SUPERVISOR (سرپرست گروه)
**توضیح:** سرپرست یک یا چند گروه کاری
**دامنه:** گروه‌های تحت سرپرستی
**مسئولیت‌ها:**
- تایید/رد/درخواست مجدد گزارش‌های گروه
- مشاهده گزارش‌های گروه
- سپردن کار به اعضای گروه
- ثبت گزارش کار شخصی یا به نام اعضای گروه
- مشاهده وضعیت نیروهای گروه

### 7. TECHNICIAN (کارشناس شرکت پیمانکار)
**توضیح:** نیروی فنی شرکت پیمانکار
**دامنه:** گروه‌های عضو خود
**مسئولیت‌ها:**
- ثبت گزارش کار
- مشاهده آیتم‌های گروه‌های خود
- مشاهده کارهای محول‌شده
- ثبت کار اضافی
- افزودن عکس و مستندات
- مشاهده امتیازهای کاری
- ثبت درخواست خرید

---

## مدل‌های دیتابیس

### 1. User (کاربر)
```typescript
{
  _id: ObjectId
  fullName: string                    // نام و نام خانوادگی
  mobile: string                      // شماره موبایل (نرمال‌شده)
  hashedMobile: string                // هش شماره برای جستجو
  encryptedMobile: string             // شماره رمزنگاری شده برای نمایش
  role: Role                          // نقش کاربر
  organizationId: ObjectId            // سازمان
  companyId: ObjectId?                // شرکت (برای نقش‌های پیمانکاری)
  unitId: ObjectId?                   // واحد کارفرمایی
  isActive: boolean                   // وضعیت فعال/غیرفعال
  lastLoginAt: Date?                  // آخرین ورود
  loginCount: number                  // تعداد ورودها
  createdAt: Date
  updatedAt: Date
}
```
**ایندکس‌ها:**
- `hashedMobile` (unique) - برای جستجوی سریع
- `organizationId, role` - برای فیلتر
- `companyId, role` - برای فیلتر

**ایجاد توسط:** DEPUTY, CONTRACTOR_CEO
**خواندن توسط:** همه نقش‌ها (با محدودیت دامنه)
**ویرایش توسط:** DEPUTY (غیرفعال‌سازی), کاربر خودش (پروفایل)

---

### 2. Organization (سازمان)
```typescript
{
  _id: ObjectId
  name: string                        // نام سازمان
  type: "deputy" | "employer" | "contractor"
  description: string?
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```
**ایجاد توسط:** فقط در seed اولیه
**خواندن توسط:** همه نقش‌ها
**ویرایش توسط:** فقط DEPUTY

---

### 3. Company (شرکت پیمانکار)
```typescript
{
  _id: ObjectId
  name: string                        // نام شرکت
  code: string                        // کد یکتا
  organizationId: ObjectId            // سازمان مالک
  contractorCeoUserId: ObjectId?      // رییس شرکت
  phone: string?
  address: string?
  description: string?
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```
**ایندکس‌ها:**
- `code` (unique)
- `organizationId`

**ایجاد توسط:** DEPUTY
**خواندن توسط:** 
- DEPUTY: همه شرکت‌ها
- CONTRACTOR_CEO, RESIDENT_REP: فقط شرکت خود
**ویرایش توسط:** DEPUTY

---

### 4. Contract (قرارداد)
```typescript
{
  _id: ObjectId
  title: string                       // عنوان قرارداد
  contractNumber: string              // شماره قرارداد
  employerCompanyId: ObjectId         // شرکت کارفرما
  contractorCompanyId: ObjectId       // شرکت پیمانکار
  startDateJalali: string             // تاریخ شروع شمسی
  endDateJalali: string               // تاریخ پایان شمسی
  description: string?
  totalAmount: number                 // مبلغ کل (ریال)
  status: "active" | "completed" | "terminated"
  organizationId: ObjectId
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```
**ایندکس‌ها:**
- `contractNumber` (unique)
- `organizationId, status`
- `contractorCompanyId`
- `employerCompanyId`

**ایجاد توسط:** DEPUTY
**خواندن توسط:**
- DEPUTY: همه قراردادها
- EMPLOYER_CEO, EMPLOYER_EXPERT: قراردادهای مرتبط با واحد
- CONTRACTOR_CEO: قراردادهای شرکت خود
**ویرایش توسط:** DEPUTY

---

### 5. WorkGroup (گروه کاری)
```typescript
{
  _id: ObjectId
  name: string                        // نام گروه
  description: string?
  companyId: ObjectId                 // شرکت مالک
  contractId: ObjectId                // قرارداد مرتبط
  organizationId: ObjectId
  supervisorUserId: ObjectId?         // سرپرست گروه
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```
**ایندکس‌ها:**
- `companyId`
- `organizationId`
- `supervisorUserId`

**ایجاد توسط:** CONTRACTOR_CEO
**خواندن توسط:**
- DEPUTY: همه گروه‌ها
- CONTRACTOR_CEO: گروه‌های شرکت خود
- GROUP_SUPERVISOR: گروه‌های تحت سرپرستی
- TECHNICIAN: گروه‌های عضو
- EMPLOYER_CEO, EMPLOYER_EXPERT: گروه‌های مرتبط با واحد
**ویرایش توسط:** CONTRACTOR_CEO

---

### 6. GroupMembership (عضویت در گروه)
```typescript
{
  _id: ObjectId
  groupId: ObjectId                   // گروه
  userId: ObjectId                    // کاربر
  membershipType: "supervisor" | "member" | "employer_ceo" | "employer_expert"
  joinedAt: Date                      // تاریخ عضویت
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```
**ایندکس‌ها:**
- `groupId, membershipType`
- `userId`
- `groupId, userId` (unique)

**ایجاد توسط:**
- CONTRACTOR_CEO: اضافه کردن نیرو به گروه
- EMPLOYER_CEO: تخصیص ناظر کارفرما به گروه
**خواندن توسط:** همه نقش‌ها (با محدودیت دامنه)
**ویرایش توسط:**
- CONTRACTOR_CEO: تغییر عضویت نیروهای شرکت
- EMPLOYER_CEO: تغییر عضویت ناظران کارفرما

---

### 7. WorkUnit (واحد کارفرمایی)
```typescript
{
  _id: ObjectId
  name: string                        // نام واحد
  organizationId: ObjectId
  description: string?
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```
**ایجاد توسط:** DEPUTY
**خواندن توسط:** DEPUTY, EMPLOYER_CEO, EMPLOYER_EXPERT
**ویرایش توسط:** DEPUTY

---

### 8. PriceItem (آیتم فهرست بها)
```typescript
{
  _id: ObjectId
  code: string                        // کد آیتم
  title: string                       // عنوان
  unit: string                        // واحد اندازه‌گیری
  unitPrice: number                   // قیمت واحد (ریال)
  contractId: ObjectId                // قرارداد
  groupIds: [ObjectId]                // گروه‌های مجاز
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```
**ایندکس‌ها:**
- `contractId, code` (unique)
- `groupIds`

**ایجاد توسط:** CONTRACTOR_CEO
**خواندن توسط:**
- DEPUTY: همه آیتم‌ها
- CONTRACTOR_CEO: آیتم‌های شرکت خود
- TECHNICIAN, GROUP_SUPERVISOR: فقط آیتم‌های گروه‌های خود
**ویرایش توسط:** CONTRACTOR_CEO

**نکته مهم:** تغییر قیمت روی گزارش‌های قبلی اثر نمی‌گذارد (Snapshot)

---

### 9. Task (کار محوله)
```typescript
{
  _id: ObjectId
  title: string                       // عنوان کار
  description: string?
  createdByUserId: ObjectId           // ایجادکننده
  assignedUserIds: [ObjectId]         // کاربران محول‌شده
  assignedGroupIds: [ObjectId]        // گروه‌های محول‌شده
  contractId: ObjectId?
  groupId: ObjectId?
  priority: "low" | "medium" | "high" | "urgent"
  dueDateJalali: string?              // مهلت انجام (شمسی)
  status: "open" | "in_progress" | "done" | "cancelled"
  completedAt: Date?
  sourceRole: string                  // نقش ایجادکننده
  organizationId: ObjectId
  createdAt: Date
  updatedAt: Date
}
```
**ایندکس‌ها:**
- `assignedUserIds, status`
- `groupId`
- `organizationId`

**ایجاد توسط:** EMPLOYER_EXPERT, EMPLOYER_CEO, GROUP_SUPERVISOR, CONTRACTOR_CEO
**خواندن توسط:**
- DEPUTY: همه کارها
- TECHNICIAN: کارهای محول‌شده به خود یا گروه‌های خود
- GROUP_SUPERVISOR: کارهای گروه‌های تحت سرپرستی
- EMPLOYER_EXPERT, EMPLOYER_CEO: کارهای مرتبط با واحد
- CONTRACTOR_CEO: کارهای شرکت خود
**ویرایش توسط:**
- ایجادکننده
- کاربران محول‌شده (تغییر وضعیت)
- DEPUTY (همه)

---

### 10. WorkReport (گزارش کار)
```typescript
{
  _id: ObjectId
  reportType: "work_report" | "daily_report"
  userId: ObjectId                    // ثبت‌کننده
  companyId: ObjectId                 // شرکت
  groupId: ObjectId?                  // گروه
  contractId: ObjectId
  unitId: ObjectId?                   // واحد کارفرمایی
  reportDateJalali: string            // تاریخ گزارش (شمسی)
  status: ReportStatus                // وضعیت گردش کار
  description: string?
  taskReferenceId: ObjectId?          // ارجاع به کار محوله
  offlineClientId: string?            // شناسه کلاینت آفلاین
  idempotencyKey: string              // کلید یکتا برای جلوگیری از تکرار
  submittedAt: Date?                  // زمان ارسال
  currentReviewerRole: string?        // نقش بررسی‌کننده فعلی
  totalAmount: number                 // مبلغ کل (محاسباتی)
  itemCount: number                   // تعداد آیتم‌ها (محاسباتی)
  organizationId: ObjectId
  createdAt: Date
  updatedAt: Date
}

type ReportStatus = 
  | "draft"
  | "submitted"
  | "supervisor_review"
  | "expert_review"
  | "employer_ceo_review"
  | "approved"
  | "rejected"
  | "redo_requested"
  | "disputed"
  | "settled"
```
**ایندکس‌ها:**
- `userId, reportDateJalali`
- `groupId, reportDateJalali`
- `contractId`
- `organizationId, status`
- `userId, idempotencyKey` (unique)

**ایجاد توسط:** TECHNICIAN, GROUP_SUPERVISOR
**خواندن توسط:**
- DEPUTY: همه گزارش‌ها
- TECHNICIAN: گزارش‌های خود
- GROUP_SUPERVISOR: گزارش‌های گروه‌های تحت سرپرستی
- EMPLOYER_EXPERT: گزارش‌های گروه‌های مجاز
- EMPLOYER_CEO: گزارش‌های واحدهای زیرمجموعه
- CONTRACTOR_CEO, RESIDENT_REP: گزارش‌های شرکت خود
**ویرایش توسط:**
- TECHNICIAN, GROUP_SUPERVISOR: فقط در وضعیت draft
- GROUP_SUPERVISOR: تایید/رد/درخواست مجدد (در supervisor_review)
- EMPLOYER_EXPERT: تایید/رد/درخواست مجدد (در expert_review)
- EMPLOYER_CEO: تایید نهایی/رد/ایجاد اختلاف (در employer_ceo_review)
- DEPUTY: تسویه (در approved)

---

### 11. ReportItem (آیتم گزارش)
```typescript
{
  _id: ObjectId
  reportId: ObjectId                  // گزارش
  priceItemId: ObjectId               // آیتم بها
  titleSnapshot: string               // عنوان در زمان ثبت
  unitSnapshot: string                // واحد در زمان ثبت
  unitPriceSnapshot: number           // قیمت در زمان ثبت (ریال)
  quantity: number                    // تعداد
  totalAmount: number                 // مبلغ کل (ریال)
  status: "pending" | "approved" | "rejected" | "edited" | "redo"
  createdAt: Date
  updatedAt: Date
}
```
**ایندکس‌ها:**
- `reportId`
- `priceItemId`

**ایجاد توسط:** سیستم (هنگام ثبت گزارش)
**خواندن توسط:** همان کسانی که گزارش را می‌بینند
**ویرایش توسط:** سیستم (هنگام تایید/رد گزارش)

---

### 12. ExtraWorkItem (کار اضافی)
```typescript
{
  _id: ObjectId
  reportId: ObjectId                  // گزارش
  description: string                 // شرح کار
  status: "pending" | "mapped" | "rejected"
  mappedPriceItemId: ObjectId?        // آیتم معادل
  mappedQuantity: number?             // تعداد معادل
  mappedAmount: number?               // مبلغ معادل (ریال)
  mappedByUserId: ObjectId?           // کاربر معادل‌ساز
  mappingNote: string?                // یادداشت معادل‌سازی
  createdAt: Date
  updatedAt: Date
}
```
**ایندکس‌ها:**
- `reportId`
- `status`

**ایجاد توسط:** سیستم (هنگام ثبت گزارش با کار اضافی)
**خواندن توسط:**
- DEPUTY: همه
- RESIDENT_REP: کارهای اضافی شرکت
- CONTRACTOR_CEO: کارهای اضافی شرکت خود
- TECHNICIAN, GROUP_SUPERVISOR: کارهای اضافی گزارش‌های خود
**ویرایش توسط:** RESIDENT_REP (معادل‌سازی/رد)

---

### 13. Attachment (پیوست)
```typescript
{
  _id: ObjectId
  reportId: ObjectId?                 // گزارش
  taskId: ObjectId?                   // کار
  purchaseId: ObjectId?               // خرید
  kind: "image" | "video" | "file"
  fileName: string                    // نام فایل
  mimeType: string                    // نوع MIME
  size: number                        // حجم (بایت)
  storagePath: string                 // مسیر ذخیره (نام تصادفی)
  uploadStatus: "local" | "uploading" | "uploaded" | "failed"
  createdAt: Date
}
```
**ایندکس‌ها:**
- `reportId`
- `taskId`
- `purchaseId`

**ایجاد توسط:** سیستم (هنگام آپلود)
**خواندن توسط:** همان کسانی که گزارش/کار/خرید را می‌بینند
**ویرایش توسط:** سیستم (تغییر وضعیت آپلود)

---

### 14. ApprovalEvent (رویداد تایید)
```typescript
{
  _id: ObjectId
  reportId: ObjectId                  // گزارش
  actorUserId: ObjectId               // کاربر انجام‌دهنده
  actorRole: string                   // نقش
  action: "submit" | "resubmit" | "approve" | "reject" | "redo" | "dispute"
  fromStatus: string                  // وضعیت قبلی
  toStatus: string                    // وضعیت جدید
  reason: string?                     // دلیل (برای رد/مجدد/اختلاف)
  createdAt: Date
}
```
**ایندکس‌ها:**
- `reportId, createdAt`
- `actorUserId`

**ایجاد توسط:** سیستم (هنگام تایید/رد)
**خواندن توسط:** همان کسانی که گزارش را می‌بینند

---

### 15. AuditLog (لاگ حسابرسی)
```typescript
{
  _id: ObjectId
  actorUserId: ObjectId               // کاربر
  actorRole: string                   // نقش
  action: string                      // عملیات
  resourceType: string                // نوع منبع
  resourceId: string                  // شناسه منبع
  details: object?                    // جزییات
  ipAddress: string?                  // IP
  userAgent: string?                  // User Agent
  createdAt: Date
}
```
**ایندکس‌ها:**
- `actorUserId, createdAt`
- `resourceType, resourceId`
- `createdAt`

**ایجاد توسط:** سیستم (برای تمام عملیات مهم)
**خواندن توسط:**
- DEPUTY: همه لاگ‌ها
- CONTRACTOR_CEO: لاگ‌های شرکت خود
- EMPLOYER_CEO: لاگ‌های واحد خود

---

### 16. Notification (اعلان)
```typescript
{
  _id: ObjectId
  userId: ObjectId                    // کاربر مقصد
  title: string                       // عنوان
  message: string                     // پیام
  type: "info" | "warning" | "error" | "success"
  priority: "low" | "normal" | "high"
  isRead: boolean
  readAt: Date?
  entity: "report" | "task" | "statement" | "purchase" | "extra" | null
  entityId: ObjectId?
  createdAt: Date
}
```
**ایندکس‌ها:**
- `userId, isRead, createdAt`
- `entity, entityId`

**ایجاد توسط:** سیستم (هنگام رویدادهای مهم)
**خواندن توسط:** کاربر مقصد
**ویرایش توسط:** کاربر مقصد (علامت‌گذاری به عنوان خوانده‌شده)

---

### 17. PurchaseRequest (درخواست خرید)
```typescript
{
  _id: ObjectId
  title: string                       // عنوان
  description: string?
  amount: number                      // مبلغ (ریال)
  supplierCompanyId: ObjectId         // شرکت تأمین‌کننده
  requestedByUserId: ObjectId         // درخواست‌کننده
  approvedByUserId: ObjectId?         // تاییدکننده
  status: "pending" | "approved" | "rejected" | "paid" | "cancelled"
  groupId: ObjectId?
  contractId: ObjectId?
  companyId: ObjectId
  organizationId: ObjectId
  createdAt: Date
  updatedAt: Date
}
```
**ایندکس‌ها:**
- `requestedByUserId`
- `companyId, status`
- `groupId`

**ایجاد توسط:** TECHNICIAN, GROUP_SUPERVISOR, RESIDENT_REP
**خواندن توسط:**
- DEPUTY: همه
- RESIDENT_REP, CONTRACTOR_CEO: درخواست‌های شرکت
- TECHNICIAN, GROUP_SUPERVISOR: درخواست‌های خود
**ویرایش توسط:**
- RESIDENT_REP: تایید/رد
- CONTRACTOR_CEO: تایید/رد
- RESIDENT_REP: ثبت پرداخت

---

### 18. Statement (صورت‌وضعیت)
```typescript
{
  _id: ObjectId
  title: string                       // عنوان
  description: string
  amount: number                      // مبلغ کل (ریال)
  contractorUserId: ObjectId          // پیمانکار
  supervisorUserId: ObjectId          // سرپرست
  groupId: ObjectId
  contractId: ObjectId
  companyId: ObjectId
  organizationId: ObjectId
  status: "pending" | "approved" | "rejected" | "paid"
  approvedAt: Date?
  approvedByUserId: ObjectId?
  reportIds: [ObjectId]               // گزارش‌های شامل
  createdAt: Date
  updatedAt: Date
}
```
**ایندکس‌ها:**
- `contractorUserId, dateJalali`
- `supervisorUserId`
- `groupId`
- `organizationId, status`

**ایجاد توسط:** CONTRACTOR_CEO
**خواندن توسط:**
- DEPUTY: همه
- CONTRACTOR_CEO: صورت‌وضعیت‌های شرکت خود
**ویرایش توسط:**
- DEPUTY: تایید/رد
- DEPUTY: ثبت پرداخت

---

### 19. ScoreEvent (رویداد امتیاز)
```typescript
{
  _id: ObjectId
  userId: ObjectId                    // کاربر
  reportId: ObjectId                  // گزارش
  score: number                       // امتیاز
  reason: string                      // دلیل
  createdByRole: string               // نقش ایجادکننده
  createdAt: Date
}
```
**ایندکس‌ها:**
- `userId, createdAt`
- `reportId`

**ایجاد توسط:** سیستم (هنگام تایید نهایی گزارش)
**خواندن توسط:**
- TECHNICIAN: امتیازهای خود
- CONTRACTOR_CEO: امتیازهای نیروهای شرکت
- DEPUTY: همه

---

### 20. SyncQueue (صف همگام‌سازی)
```typescript
{
  _id: ObjectId
  userId: ObjectId                    // کاربر
  endpoint: string                    // endpoint API
  method: string                      // HTTP method
  payload: object                     // داده
  idempotencyKey: string              // کلید یکتا
  status: "pending" | "sending" | "synced" | "failed"
  attempts: number                    // تعداد تلاش‌ها
  lastError: string?                  // آخرین خطا
  createdAt: Date
  updatedAt: Date
}
```
**ایندکس‌ها:**
- `userId, idempotencyKey` (unique)
- `status`

**ایجاد توسط:** سیستم (هنگام عملیات آفلاین)
**خواندن توسط:** کاربر خود
**ویرایش توسط:** سیستم (تغییر وضعیت)

---

### 21. OtpCode (کد یکبار مصرف)
```typescript
{
  _id: ObjectId
  mobileHash: string                  // هش شماره
  otpHash: string                     // هش کد
  expiresAt: Date                     // زمان انقضا
  attempts: number                    // تعداد تلاش‌ها
  consumedAt: Date?                   // زمان مصرف
  createdAt: Date
}
```
**ایندکس‌ها:**
- `mobileHash`
- `expiresAt` (TTL - حذف خودکار)

**ایجاد توسط:** سیستم (هنگام درخواست OTP)
**خواندن توسط:** سیستم (هنگام تایید)
**ویرایش توسط:** سیستم (افزایش attempts, مصرف)

---

### 22. Setting (تنظیمات)
```typescript
{
  _id: ObjectId
  key: string                         // کلید
  value: string                       // مقدار
  description: string?
  organizationId: ObjectId?           // null = global
  isGlobal: boolean
  createdAt: Date
  updatedAt: Date
}
```
**ایندکس‌ها:**
- `key` (unique)
- `isGlobal, organizationId`

**ایجاد توسط:** DEPUTY
**خواندن توسط:** DEPUTY
**ویرایش توسط:** DEPUTY

---

## ماتریس دسترسی‌ها

### سطح دسترسی
- **C** = Create (ایجاد)
- **R** = Read (خواندن)
- **U** = Update (ویرایش)
- **D** = Delete (حذف - در این سیستم حذف نرم است)

### ماتریس نقش-منبع

| منبع | DEPUTY | EMPLOYER_CEO | EMPLOYER_EXPERT | CONTRACTOR_CEO | RESIDENT_REP | GROUP_SUPERVISOR | TECHNICIAN |
|------|--------|--------------|-----------------|----------------|--------------|------------------|------------|
| User | CRU | R | R | CRU | R | R | R |
| Organization | CRU | R | R | R | R | R | R |
| Company | CRU | R | R | R | R | R | R |
| Contract | CRU | R | R | R | R | R | R |
| WorkGroup | CRU | RU | R | CRU | R | R | R |
| GroupMembership | CRU | CRU | R | CRU | R | R | R |
| WorkUnit | CRU | R | R | R | R | R | R |
| PriceItem | CRU | R | R | CRU | R | R | R |
| Task | CRU | CRU | CRU | CRU | R | CRU | R |
| WorkReport | CRU | RU | RU | R | R | CRU | CRU |
| ReportItem | R | R | R | R | R | R | R |
| ExtraWorkItem | R | R | R | R | RU | R | R |
| Attachment | R | R | R | R | R | R | R |
| ApprovalEvent | R | R | R | R | R | R | R |
| AuditLog | R | R | R | R | R | R | R |
| Notification | R | R | R | R | R | R | R |
| PurchaseRequest | R | R | R | R | CRU | CRU | CRU |
| Statement | CRU | R | R | CRU | R | R | R |
| ScoreEvent | R | R | R | R | R | R | R |
| SyncQueue | R | R | R | R | R | R | R |
| OtpCode | - | - | - | - | - | - | - |
| Setting | CRU | R | R | R | R | R | R |

### محدودیت‌های دامنه

**DEPUTY:**
- دسترسی به همه داده‌های سازمان

**EMPLOYER_CEO:**
- فقط داده‌های واحدهای زیرمجموعه
- فقط گزارش‌های گروه‌های مرتبط با واحد

**EMPLOYER_EXPERT:**
- فقط داده‌های گروه‌های مجاز
- فقط گزارش‌های گروه‌های مجاز

**CONTRACTOR_CEO:**
- فقط داده‌های شرکت خود
- فقط گزارش‌های شرکت خود
- فقط نیروهای شرکت خود

**RESIDENT_REP:**
- فقط داده‌های شرکت پیمانکار
- فقط کارهای اضافی شرکت
- فقط درخواست‌های خرید شرکت

**GROUP_SUPERVISOR:**
- فقط گروه‌های تحت سرپرستی
- فقط گزارش‌های گروه‌های تحت سرپرستی
- فقط اعضای گروه‌های تحت سرپرستی

**TECHNICIAN:**
- فقط گروه‌های عضو
- فقط گزارش‌های خود
- فقط کارهای محول‌شده به خود یا گروه‌های خود

---

## گردش کارها

### 1. گردش کار تایید گزارش کار

```
TECHNICIAN/GROUP_SUPERVISOR
  ↓ ثبت گزارش
  ↓
[draft] → [supervisor_review]
  ↓
GROUP_SUPERVISOR
  ↓ تایید → [expert_review]
  ↓ رد → [rejected]
  ↓ درخواست مجدد → [redo_requested]
  ↓
EMPLOYER_EXPERT
  ↓ تایید → [employer_ceo_review]
  ↓ رد → [rejected]
  ↓ درخواست مجدد → [redo_requested]
  ↓
EMPLOYER_CEO
  ↓ تایید نهایی → [approved]
  ↓ رد → [rejected]
  ↓ ایجاد اختلاف → [disputed]
  ↓
[approved] → [settled] (توسط DEPUTY)
```

**نکات مهم:**
- گزارش سرپرست مستقیم به `expert_review` می‌رود (جلوگیری از خودتاییدی)
- هر مرحله اعلان به مرحله بعد ارسال می‌کند
- تایید نهایی = ثبت امتیاز برای TECHNICIAN
- رد/مجدد = اعلان به ثبت‌کننده با دلیل

### 2. گردش کار معادل‌سازی کار اضافی

```
TECHNICIAN
  ↓ ثبت گزارش با کار اضافی
  ↓
ExtraWorkItem [pending]
  ↓
RESIDENT_REP
  ↓ معادل‌سازی → [mapped]
  ↓ رد → [rejected]
  ↓
[mapped] → قابل محاسبه در صورت‌وضعیت
```

### 3. گردش کار درخواست خرید

```
TECHNICIAN/GROUP_SUPERVISOR/RESIDENT_REP
  ↓ ثبت درخواست
  ↓
PurchaseRequest [pending]
  ↓
RESIDENT_REP/CONTRACTOR_CEO
  ↓ تایید → [approved]
  ↓ رد → [rejected]
  ↓
RESIDENT_REP
  ↓ ثبت پرداخت → [paid]
```

### 4. گردش کار صورت‌وضعیت

```
CONTRACTOR_CEO
  ↓ انتخاب گزارش‌های approved
  ↓ محاسبه مبلغ کل
  ↓
Statement [pending]
  ↓
DEPUTY
  ↓ تایید → [approved]
  ↓ رد → [rejected]
  ↓
DEPUTY
  ↓ ثبت پرداخت → [paid]
```

### 5. گردش کار احراز هویت

```
کاربر
  ↓ ورود شماره موبایل
  ↓
[check-phone] → بررسی ثبت‌بودن و فعال‌بودن
  ↓
[send-otp] → ارسال کد 5 رقمی (2 دقیقه اعتبار)
  ↓
[verify-otp] → تایید کد
  ↓
ایجاد session (Iron Session)
  ↓
Redirect به پنل نقش
```

---

## امکانات تفصیلی هر نقش

### DEPUTY (معاونت بهره‌برداری)

#### داشبورد
- **KPIها:**
  - تعداد شرکت‌های فعال
  - تعداد قراردادهای فعال
  - گزارش‌های امروز
  - گزارش‌های در انتظار
  - گزارش‌های تاییدشده
  - گزارش‌های ردشده
  - جمع هزینه تاییدشده
  - گزارش‌های اختلافی
- **نمودارها:**
  - روند گزارش‌ها (روزانه/هفتگی/ماهانه)
  - روند هزینه‌ها
  - توزیع وضعیت گزارش‌ها
  - توزیع گروه‌ها
  - عملکرد شرکت‌ها
  - عملکرد واحدها
- **Drill-down:** کلیک روی هر KPI/نمودار → لیست گزارش‌های مرتبط
- **خروجی:** CSV, printable view

#### مدیریت شرکت‌ها
- **لیست شرکت‌ها:**
  - جستجو
  - فیلتر وضعیت
  - نمایش: نام، مسئول، تعداد قراردادها، وضعیت
- **ایجاد شرکت:**
  - نام شرکت
  - کد شرکت
  - نام مسئول
  - شماره موبایل مسئول
  - توضیحات
  - وضعیت فعال
- **ویرایش شرکت:** همه فیلدها
- **غیرفعال‌سازی شرکت**

#### مدیریت قراردادها
- **لیست قراردادها:**
  - فیلتر شرکت
  - فیلتر وضعیت
  - فیلتر نوع قرارداد
  - نمایش: عنوان، شرکت، نوع، تاریخ شروع/پایان، وضعیت
- **ایجاد قرارداد:**
  - عنوان
  - نوع قرارداد (حجمی/فهرست بهایی/سایر)
  - شرکت پیمانکار
  - واحد کارفرمایی
  - تاریخ شروع شمسی
  - تاریخ پایان شمسی
  - وضعیت
  - توضیحات عمومی
- **ویرایش قرارداد:** همه فیلدها
- **هشدار:** اطلاعات محرمانه نباید در سامانه ثبت شود

#### مدیریت کاربران کارفرمایی
- **لیست کاربران:**
  - جستجو
  - فیلتر نقش
  - فیلتر وضعیت
- **ایجاد کاربر:**
  - نام و نام خانوادگی
  - شماره موبایل
  - نقش (EMPLOYER_CEO, EMPLOYER_EXPERT)
  - واحد کارفرمایی
  - گروه‌ها (برای EMPLOYER_EXPERT)
  - وضعیت فعال
- **ویرایش کاربر:** همه فیلدها
- **غیرفعال‌سازی کاربر**

#### مدیریت واحدها
- **لیست واحدها**
- **ایجاد واحد:**
  - نام
  - توضیحات
- **ویرایش واحد**

#### مشاهده گزارش‌ها
- **لیست گزارش‌ها:**
  - فیلتر بازه تاریخ شمسی
  - فیلتر شرکت
  - فیلتر قرارداد
  - فیلتر واحد
  - فیلتر گروه
  - فیلتر وضعیت
  - جستجو
- **جزییات گزارش:**
  - اطلاعات ثبت‌کننده
  - گروه
  - تاریخ
  - وضعیت
  - خلاصه مبلغ
  - لیست آیتم‌ها
  - مستندات
  - توضیحات
  - تاریخچه تاییدها
- **خروجی:** CSV, printable

#### مدیریت صورت‌وضعیت‌ها
- **لیست صورت‌وضعیت‌ها:**
  - فیلتر شرکت
  - فیلتر وضعیت
- **جزییات صورت‌وضعیت:**
  - شرکت پیمانکار
  - قرارداد
  - بازه تاریخ
  - لیست گزارش‌ها
  - جمع کل
- **تایید صورت‌وضعیت**
- **رد صورت‌وضعیت** (با دلیل)
- **ثبت پرداخت**

#### مشاهده Audit Log
- **لیست رویدادها:**
  - فیلتر نوع عملیات
  - فیلتر کاربر
  - فیلتر بازه تاریخ
  - جستجو
- **جزییات هر رویداد:**
  - کاربر انجام‌دهنده
  - نقش
  - عملیات
  - موجودیت
  - شناسه موجودیت
  - جزییات
  - زمان

#### تنظیمات
- مشاهده تنظیمات سیستم
- مشاهده وضعیت امنیتی

---

### EMPLOYER_CEO (رییس کارفرما)

#### داشبورد
- **KPIها:**
  - گزارش‌های در انتظار تایید نهایی
  - گزارش‌های تاییدشده
  - گزارش‌های ردشده
  - جمع مبلغ تاییدشده
- **نمودارها:**
  - روند گزارش‌ها
- **لیست‌ها:**
  - گزارش‌های در انتظار تایید نهایی
  - آخرین فعالیت‌ها
- **Quick Actions:**
  - مشاهده گزارش‌ها
  - گروه‌های واحد
  - کارهای محوله

#### بررسی گزارش‌ها
- **لیست گزارش‌ها:**
  - فیلتر وضعیت
  - فیلتر گروه
  - فیلتر تاریخ
  - جستجو
- **جزییات گزارش:**
  - اطلاعات ثبت‌کننده
  - گروه
  - تاریخ
  - وضعیت
  - خلاصه مبلغ
  - لیست آیتم‌ها
  - مستندات
  - توضیحات
  - تاریخچه تاییدها
- **اکشن‌ها:**
  - تایید نهایی (با confirmation)
  - رد نهایی (با دلیل الزامی)
  - ایجاد اختلاف (با دلیل الزامی)

#### مشاهده گزارش‌های واحد
- **لیست گزارش‌ها:**
  - فیلتر وضعیت
  - فیلتر گروه
  - فیلتر تاریخ
  - جستجو
- **جزییات گزارش:** (فقط خواندنی)

#### مدیریت گروه‌ها
- **لیست گروه‌های مرتبط با واحد**
- **تخصیص نیروهای شرکتی به گروه‌ها:**
  - انتخاب گروه
  - انتخاب نیرو
  - نوع عضویت (employer_ceo)
  - **نکته:** مالکیت نیرو تغییر نمی‌کند

#### کارهای محوله
- **لیست کارها:**
  - فیلتر وضعیت
  - فیلتر اولویت
- **ایجاد کار:**
  - عنوان
  - شرح
  - گروه
  - کاربران
  - اولویت
  - تاریخ انجام
  - قرارداد مرتبط
- **ویرایش کار:** همه فیلدها
- **تغییر وضعیت کار**

#### گزارش‌های روزانه کارشناسان
- **لیست گزارش‌های روزانه**
- **جزییات گزارش روزانه:**
  - کارشناس
  - تاریخ
  - شرح فعالیت‌ها
  - نکات

#### فعالیت‌ها
- **لیست رویدادهای واحد**
- **فیلتر و جستجو**

---

### EMPLOYER_EXPERT (کارشناس کارفرما)

#### داشبورد
- **KPIها:**
  - گزارش‌های در انتظار بررسی
  - کارهای محول‌شده
  - گزارش روزانه امروز
- **Quick Actions:**
  - ثبت گزارش روزانه
  - بررسی گزارش‌ها

#### بررسی گزارش‌ها
- **لیست گزارش‌ها:**
  - فقط گزارش‌های گروه‌های مجاز
  - فیلتر وضعیت
  - فیلتر گروه
  - فیلتر تاریخ
  - جستجو
- **جزییات گزارش:**
  - اطلاعات ثبت‌کننده
  - گروه
  - تاریخ
  - وضعیت
  - خلاصه مبلغ
  - لیست آیتم‌ها
  - مستندات
  - توضیحات
  - تاریخچه تاییدها
- **اکشن‌ها:**
  - تایید (با confirmation)
  - رد (با دلیل الزامی)
  - درخواست انجام مجدد (با دلیل الزامی)

#### گزارش روزانه
- **ثبت گزارش روزانه:**
  - تاریخ شمسی
  - شرح فعالیت‌ها
  - گروه‌های مرتبط
  - نکات
- **مشاهده گزارش‌های روزانه قبلی**

#### کارهای محوله
- **لیست کارها:**
  - فیلتر وضعیت
  - فیلتر اولویت
- **ایجاد کار:**
  - عنوان
  - شرح
  - گروه
  - کاربران
  - اولویت
  - تاریخ انجام
  - قرارداد مرتبط
- **ویرایش کار**
- **تغییر وضعیت کار**

#### فعالیت‌ها
- **لیست رویدادهای مرتبط**

---

### CONTRACTOR_CEO (رییس شرکت پیمانکار)

#### داشبورد
- **KPIها:**
  - گزارش‌های امروز
  - گزارش‌های در انتظار
  - گزارش‌های تاییدشده
  - گزارش‌های ردشده
  - جمع مبلغ تاییدشده
  - تعداد نیروهای فعال
- **نمودارها:**
  - روند گزارش‌ها
  - هزینه تاییدشده
  - توزیع گروه‌ها
- **لیست‌ها:**
  - آخرین فعالیت نیروها
  - گزارش‌های اخیر
  - هشدارها

#### مدیریت نیروها
- **لیست نیروها:**
  - جستجو
  - فیلتر نقش
  - فیلتر وضعیت
  - نمایش: نام، نقش، گروه‌ها، وضعیت، آخرین فعالیت
- **ایجاد نیرو:**
  - نام و نام خانوادگی
  - شماره موبایل
  - نقش (TECHNICIAN, GROUP_SUPERVISOR, RESIDENT_REP)
  - گروه‌ها (multi-select)
  - وضعیت فعال
- **پروفایل نیرو:**
  - اطلاعات اصلی
  - گروه‌ها
  - آخرین گزارش‌ها
  - امتیازها
  - وضعیت فعالیت
- **ویرایش نیرو**
- **غیرفعال‌سازی نیرو**

#### مدیریت گروه‌ها
- **لیست گروه‌ها:**
  - نام گروه
  - تعداد اعضا
  - سرپرست
  - وضعیت
- **ایجاد گروه:**
  - نام گروه
  - توضیحات
  - سرپرست گروه
  - اعضای گروه
  - وضعیت فعال
- **جزییات گروه:**
  - ویرایش نام و توضیحات
  - تغییر سرپرست
  - مدیریت اعضا (افزودن/حذف)
- **ویرایش گروه**

#### مدیریت فهرست بها
- **لیست آیتم‌ها:**
  - جستجو
  - فیلتر گروه
  - فیلتر وضعیت
  - نمایش: کد، عنوان، واحد، قیمت، گروه‌ها، وضعیت
- **ایجاد آیتم:**
  - کد
  - عنوان
  - واحد
  - قیمت واحد (ریال)
  - گروه‌ها (multi-select)
  - وضعیت فعال
- **ویرایش آیتم:**
  - تغییر قیمت (Snapshot - گزارش‌های قبلی تغییر نمی‌کنند)
  - تغییر عنوان
  - تغییر واحد
  - تغییر گروه‌ها
- **غیرفعال‌سازی آیتم**

#### مشاهده گزارش‌ها
- **لیست گزارش‌ها:**
  - فقط گزارش‌های شرکت
  - فیلتر وضعیت
  - فیلتر گروه
  - فیلتر تاریخ
  - جستجو
- **جزییات گزارش:** (فقط خواندنی)
- **خروجی:** CSV

#### مدیریت صورت‌وضعیت‌ها
- **لیست صورت‌وضعیت‌ها:**
  - فیلتر وضعیت
- **ایجاد صورت‌وضعیت:**
  - انتخاب قرارداد
  - انتخاب بازه تاریخ شمسی
  - پیش‌نمایش گزارش‌های واجد شرایط
  - محاسبه جمع مبلغ
  - ارسال برای معاونت
- **جزییات صورت‌وضعیت:**
  - لیست گزارش‌ها
  - جمع کل
  - وضعیت

#### درخواست‌های خرید
- **لیست درخواست‌ها:**
  - فیلتر وضعیت
- **جزییات درخواست:**
  - عنوان
  - شرح
  - تعداد
  - برآورد قیمت
  - دلیل
  - اولویت
  - درخواست‌کننده
- **تایید درخواست**
- **رد درخواست** (با دلیل)
- **ثبت نتیجه خرید**

#### فعالیت‌ها
- **لیست رویدادهای شرکت**
- **فیلتر و جستجو**

---

### RESIDENT_REP (نماینده مقیم)

#### داشبورد
- **KPIها:**
  - کارهای اضافی در انتظار معادل‌سازی
  - درخواست‌های خرید در انتظار
  - آخرین خریدها
- **لیست‌ها:**
  - کارهای اضافی در انتظار
  - آخرین خریدها

#### معادل‌سازی کارهای اضافی
- **لیست کارهای اضافی:**
  - فیلتر وضعیت
  - فیلتر گروه
  - فیلتر شرکت
  - جستجو
- **جزییات کار اضافی:**
  - توضیحات تکنسین
  - گزارش مرتبط
  - گروه
  - تاریخ
  - مستندات
- **معادل‌سازی:**
  - انتخاب آیتم معادل از فهرست بها
  - تعیین تعداد
  - تعیین مبلغ (محاسبه خودکار)
  - یادداشت
  - تایید معادل‌سازی
- **رد کار اضافی** (با یادداشت)

#### مدیریت درخواست‌های خرید
- **لیست درخواست‌ها:**
  - فیلتر وضعیت
- **جزییات درخواست:**
  - عنوان
  - شرح
  - تعداد
  - برآورد قیمت
  - دلیل
  - اولویت
  - درخواست‌کننده
- **تایید درخواست**
- **رد درخواست** (با دلیل)
- **ثبت نتیجه خرید**

#### فعالیت‌ها
- **لیست رویدادهای شرکت**

---

### GROUP_SUPERVISOR (سرپرست گروه)

#### داشبورد
- **KPIها:**
  - گزارش‌های در انتظار بررسی
  - کارهای گروه
  - اعضای گروه
  - گزارش‌های امروز
- **Quick Actions:**
  - بررسی گزارش‌ها
  - ثبت گزارش کار شخصی
- **لیست‌ها:**
  - آخرین گزارش‌های گروه

#### تایید گزارش‌ها
- **لیست گزارش‌ها:**
  - فقط گزارش‌های گروه‌های تحت سرپرستی
  - فیلتر وضعیت
  - فیلتر تاریخ
  - جستجو
- **جزییات گزارش:**
  - اطلاعات ثبت‌کننده
  - گروه
  - تاریخ
  - وضعیت
  - خلاصه مبلغ
  - لیست آیتم‌ها
  - مستندات
  - توضیحات
  - تاریخچه تاییدها
- **اکشن‌ها:**
  - تایید (با confirmation)
  - رد (با دلیل الزامی)
  - درخواست انجام مجدد (با دلیل الزامی)

#### ثبت گزارش کار
- **ثبت گزارش به نام خود:**
  - انتخاب گروه
  - انتخاب آیتم‌های بها
  - تعیین تعداد
  - ثبت کار اضافی
  - افزودن عکس
  - توضیحات
  - ارسال (مستقیم به expert_review)
- **ثبت گزارش به نام نیروی گروه:**
  - انتخاب نیرو از اعضای گروه
  - بقیه مراحل مشابه
- **مشاهده گزارش‌های خود:**
  - لیست گزارش‌های ثبت‌شده
  - جزییات هر گزارش

#### کارهای گروه
- **لیست کارها:**
  - فیلتر وضعیت
  - فیلتر اولویت
- **ایجاد کار:**
  - عنوان
  - شرح
  - گروه
  - کاربران (اعضای گروه)
  - اولویت
  - تاریخ انجام
- **سپردن کار به اعضای گروه**
- **تغییر وضعیت کار**

#### گروه من
- **لیست گروه‌های تحت سرپرستی**
- **جزییات گروه:**
  - اعضا
  - وضعیت فعالیت هر عضو
  - آخرین گزارش‌ها

---

### TECHNICIAN (کارشناس شرکت پیمانکار)

#### داشبورد
- **KPIها:**
  - کارهای امروز
  - گزارش‌های در انتظار
  - در صف ارسال آفلاین
  - امتیاز کاری
- **Quick Actions:**
  - ثبت گزارش سریع (FAB)
- **لیست‌ها:**
  - کارهای فوری
  - آخرین گزارش‌ها

#### ثبت گزارش کار
- **صفحه ثبت گزارش:**
  - انتخاب گروه (اگر چند گروه دارد)
  - افزودن آیتم از فهرست بها:
    - جستجوی سریع
    - انتخاب با یک کلیک
    - تعیین تعداد (NumberStepper)
    - حذف آیتم
  - ثبت کار اضافی:
    - توضیحات
    - وضعیت "در انتظار معادل‌سازی"
  - افزودن عکس:
    - دوربین (capture=environment)
    - گالری
    - فشرده‌سازی خودکار
    - پیش‌نمایش
    - حذف عکس
  - توضیحات گزارش
  - اکشن‌ها:
    - ذخیره پیش‌نویس (autosave در localStorage)
    - ارسال گزارش (اگر آنلاین)
    - ذخیره در صف (اگر آفلاین)
- **حالت آفلاین:**
  - ذخیره در IndexedDB
  - نمایش وضعیت sync
  - ارسال خودکار بعد از اتصال
  - idempotencyKey برای جلوگیری از تکرار

#### مشاهده گزارش‌های خود
- **لیست گزارش‌ها:**
  - فیلتر وضعیت (همه/در انتظار/تاییدشده/ردشده)
  - جستجو
- **جزییات گزارش:**
  - وضعیت
  - مبلغ
  - آیتم‌ها
  - مستندات
  - تاریخچه تاییدها
- **ارسال مجدد** (اگر redo_requested)

#### کارهای محوله
- **لیست کارها:**
  - فیلتر وضعیت
  - فیلتر اولویت
- **جزییات کار:**
  - عنوان
  - شرح
  - اولویت
  - مهلت
  - محول‌کننده
- **تغییر وضعیت کار:**
  - شروع کار
  - انجام شد
- **ثبت گزارش از روی کار**

#### امتیازها و رزومه
- **مجموع امتیاز**
- **لیست امتیازها:**
  - امتیاز
  - دلیل
  - تاریخ
  - گزارش مرتبط

#### درخواست‌های خرید
- **لیست درخواست‌های خود**
- **ایجاد درخواست خرید:**
  - عنوان
  - شرح کالا
  - تعداد
  - برآورد قیمت
  - دلیل
  - اولویت
- **جزییات درخواست**
- **مشاهده وضعیت**

#### همگام‌سازی آفلاین
- **وضعیت اتصال** (آنلاین/آفلاین)
- **لیست موارد در صف:**
  - نوع عملیات
  - idempotencyKey
  - وضعیت
- **همگام‌سازی دستی**

---

## نکات امنیتی

### احراز هویت
- ورود فقط با شماره موبایل ثبت‌شده
- OTP 5 رقمی با اعتبار 2 دقیقه
- محدودیت 5 تلاش ناموفق
- OTP هرگز به صورت plain ذخیره نمی‌شود (SHA-256)
- شماره موبایل با AES-256-GCM رمزنگاری می‌شود
- جستجو با hash انجام می‌شود

### مجوزها
- همه APIها role check دارند
- همه APIها resource ownership را بررسی می‌کنند
- هیچ دسترسی‌ای فقط با پنهان‌کردن UI اعمال نمی‌شود
- ایزولاسیون گروه‌ها در سطح دیتابیس

### داده‌ها
- حذف سخت ممنوع (isActive)
- همه تغییرات مهم در Audit Log ثبت می‌شوند
- Snapshot قیمت و عنوان آیتم در گزارش‌ها
- idempotencyKey برای جلوگیری از ثبت تکراری
- فایل‌ها با نام تصادفی ذخیره می‌شوند

### امنیت شبکه
- HTTPS الزامی
- کوکی httpOnly و secure
- CORS فقط same-origin
- Security headers مناسب
- Rate limiting روی APIهای حساس

---

## خلاصه

این مستند تمام جنبه‌های سیستم توان‌بان را پوشش می‌دهد:
- **7 نقش** با سطوح دسترسی متفاوت
- **22 مدل دیتابیس** با روابط پیچیده
- **ماتریس دسترسی کامل** برای هر نقش-منبع
- **5 گردش کار اصلی** با جزییات
- **امکانات تفصیلی** هر نقش

این مستند برای:
- رسم نمودار ERD
- توسعه امکانات جدید
- اصلاح باگ‌ها
- آموزش کاربران
- ممیزی امنیتی

قابل استفاده است.
