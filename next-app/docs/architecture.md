# معماری — توان‌بان

## نقش‌ها و پنل‌ها
۷ نقش: DEPUTY، EMPLOYER_CEO، EMPLOYER_EXPERT، CONTRACTOR_CEO، RESIDENT_REP، GROUP_SUPERVISOR، TECHNICIAN. هر کاربر یک نقش اصلی و وابستگی به سازمان/شرکت دارد. Redirect بعد از ورود بر اساس نقش انجام می‌شود.

## لایه‌های امنیت (چندلایه)
1. **middleware.ts** — بدون نشست، routeهای پنل به login هدایت می‌شوند.
2. **lib/api-handler.ts** — هر route: احراز هویت، role check، zod validation، rate limit، پاسخ یکپارچه.
3. **Ownership/ایزولاسیون** — `lib/permissions.ts`: گروه‌های قابل‌دیدن هر کاربر از GroupMembership؛ گزارش‌ها و منابع فقط در حوزه‌ی مجاز.
4. **UI** — فقط لایه‌ی نمایش؛ هیچ تصمیم امنیتی‌ای فقط با پنهان‌کردن UI گرفته نمی‌شود.

## گردش گزارش کار
`supervisor_review → expert_review → employer_ceo_review → approved` با اکشن‌های approve/reject/redo/dispute در `services/approval-service.ts`. هر اکشن: ApprovalEvent + AuditLog + اعلان به مرحله‌ی بعد. بعد از تایید نهایی: امتیاز +۱۰ برای نیرو (ScoreEvent) و اعلان به رییس شرکت. گزارشِ خودِ سرپرست مستقیم به `expert_review` می‌رود (جلوگیری از خودتاییدی).

## Snapshot اقتصادی
هنگام ثبت گزارش، `titleSnapshot / unitSnapshot / unitPriceSnapshot` ذخیره می‌شود — تغییر فهرست بها روی گزارش‌های قبلی اثر ندارد. صورت‌وضعیت فقط آیتم‌های approved و کارهای اضافی mapped را جمع می‌زند.

## آفلاین و همگام‌سازی
- فرم‌ها local-first؛ در آفلاین به SyncQueue (IndexedDB/localStorage) می‌روند.
- `/api/v1/sync` عملیات‌ها را با idempotencyKey پردازش می‌کند — ارسال مکرر، ثبت تکراری نمی‌سازد (unique index روی userId+idempotencyKey).
- retry با backoff در `stores/sync-store.ts`؛ بعد از اتصال، ارسال خودکار (`hooks/use-sync.ts`).
- عکس‌ها سمت کلاینت فشرده می‌شوند (حداکثر ۱۲۸۰px / quality ۰٫۷۲) و با نام تصادفی در `uploads/` ذخیره می‌شوند.

## PWA
`public/sw.js`: پیمایش‌ها network-first (با fallback)، استاتیک‌ها cache-first، APIها هرگز cache نمی‌شوند. manifest با فونت وزیرمتن و جهت RTL.

## تاریخ و مبلغ
همه‌ی تاریخ‌ها شمسی (کلید `YYYY-MM-DD` جلالی با اعتبارسنجی)، همه‌ی مبالغ ریال با فرمت فارسی.

## Audit
هر تغییر مهم (کاربر، گروه، بها، گزارش، تاییدها، معادل‌سازی، صورت‌وضعیت، خرید، تسک‌ها) در `auditlogs` با بازیگر/نقش/جزییات ثبت می‌شود. OTP و داده‌ی حساس هرگز در لاگ نمی‌آید.
