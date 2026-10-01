# فهرست کامل فایل‌های پروژه‌ی توان‌بان (نسخه‌ی Next.js)

این فایل فقط یک **فهرست مرجع** است تا مطمئن بشید چه فایل‌هایی دارید.
مجموع: حدود ۲۸۰ فایل. همه‌ی مسیرها نسبت به پوشه‌ی `next-app/` هستند.

برای دیدن همه‌ی فایل‌ها روی سرور:
```bash
cd next-app && find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.js" -o -name "*.css" \) | sort
```

---

## ریشه (۱۱ فایل)
- package.json — وابستگی‌ها و دستورات
- tsconfig.json
- next.config.ts — security headers
- tailwind.config.ts
- postcss.config.js
- .env.example — نمونه‌ی متغیرهای محیطی
- .gitignore
- middleware.ts — محافظ routeهای پنل
- README.md — راهنمای نصب و لانچ
- FILES.md — همین فهرست

## app/ — صفحات و APIها

### app/(auth)/ — ورود
- layout.tsx
- login/page.tsx — صفحه‌ی ورود (شماره + OTP)

### app/(panel)/deputy/ — پنل معاونت (۱۵)
- layout.tsx, page.tsx (داشبورد)
- companies/page.tsx, companies/[id]/page.tsx
- contracts/page.tsx, contracts/[id]/page.tsx
- employer-users/page.tsx, units/page.tsx
- reports/page.tsx, reports/[id]/page.tsx
- analytics/page.tsx, statements/page.tsx, statements/[id]/page.tsx
- activity/page.tsx, settings/page.tsx

### app/(panel)/employer-ceo/ — پنل رییس کارفرما (۱۱)
- layout.tsx, page.tsx, reviews/page.tsx, reviews/[id]/page.tsx
- reports/page.tsx, groups/page.tsx, groups/[id]/page.tsx
- tasks/page.tsx, daily-reports/page.tsx, activity/page.tsx, profile/page.tsx

### app/(panel)/employer-expert/ — پنل کارشناس کارفرما (۹)
- layout.tsx, page.tsx, reviews/page.tsx, reviews/[id]/page.tsx
- daily-report/page.tsx, tasks/page.tsx, activity/page.tsx, profile/page.tsx

### app/(panel)/contractor-ceo/ — پنل رییس شرکت (۱۶)
- layout.tsx, page.tsx, personnel/page.tsx, personnel/[id]/page.tsx
- groups/page.tsx, groups/[id]/page.tsx, price-list/page.tsx
- reports/page.tsx, reports/[id]/page.tsx
- statements/page.tsx, statements/new/page.tsx, statements/[id]/page.tsx
- purchase-requests/page.tsx, purchase-requests/[id]/page.tsx
- activity/page.tsx, profile/page.tsx

### app/(panel)/resident/ — پنل نماینده مقیم (۹)
- layout.tsx, page.tsx, extra-items/page.tsx
- purchase-requests/page.tsx, purchase-requests/new/page.tsx, purchase-requests/[id]/page.tsx
- activity/page.tsx, profile/page.tsx

### app/(panel)/supervisor/ — پنل سرپرست گروه (۱۰)
- layout.tsx, page.tsx, reviews/page.tsx, reviews/[id]/page.tsx
- reports/page.tsx, reports/new/page.tsx
- tasks/page.tsx, group/page.tsx, profile/page.tsx

### app/(panel)/technician/ — پنل تکنسین (۱۳)
- layout.tsx, page.tsx
- reports/page.tsx, reports/new/page.tsx, reports/[id]/page.tsx
- tasks/page.tsx, scores/page.tsx
- purchase-requests/page.tsx, purchase-requests/new/page.tsx, purchase-requests/[id]/page.tsx
- sync-status/page.tsx, profile/page.tsx

### app/(panel)/unauthorized/page.tsx
### app/notifications/[entity]/[id]/page.tsx — مقصد کلیک اعلان‌ها

### app/api/v1/ — همه‌ی APIها (حدود ۳۵)
- auth/check-phone, auth/send-otp, auth/verify-otp, auth/logout
- companies, companies/[id]
- contracts, contracts/[id]
- users, users/me, users/[id], users/[id]/profile
- units, groups, groups/[id], groups/[id]/members, groups/all-members, memberships
- price-items
- tasks, tasks/[id]
- reports, reports/[id], reports/[id]/approval, reports/[id]/resubmit, reports/daily
- report-items, extra-items, extra-items/[id]/map, extra-items/[id]/reject
- approvals, attachments
- purchase-requests, [id], [id]/decide, [id]/purchased
- statements, statements/preview, statements/[id], statements/[id]/decide
- notifications, notifications/[id]/read, notifications/read-all
- activity-logs, analytics, sync
- app/api/files/[name] — سرو عکس‌ها

### app/ ریشه
- layout.tsx — root layout (فونت وزیرمتن + RTL)
- globals.css — تم و انیمیشن‌ها
- manifest.ts — PWA

## types/ — تایپ‌ها (۱۵)
- index.ts, user.ts, company.ts, contract.ts, group.ts, price-item.ts
- task.ts, report.ts, attachment.ts, approval.ts, notification.ts
- purchase-request.ts, statement.ts, auth.ts, api.ts

## components/ — کامپوننت‌ها (۹۵)

### components/ui/ (۳۷)
button, icon-button, input, textarea, select, multi-select, search-bar,
card, badge, chip, avatar, modal, bottom-sheet, toast, tooltip, tabs,
segmented-control, data-table, list-card, stat-card, kpi-card, chart-card,
empty-state, error-state, loading-skeleton, offline-banner, sync-status-indicator,
page-header, breadcrumb, pagination, filter-bar, date-range-picker-jalali,
amount-input, number-stepper, file-uploader, image-preview-gallery,
confirmation-dialog, status-badge, notification-item

### components/layout/ (۸)
app-shell, desktop-layout, desktop-sidebar, mobile-layout, mobile-nav,
header, panel-page, profile-page

### components/auth/ (۳) — login-form, otp-form, auth-guard
### components/forms/ (۹) — report-form, task-form, company-form, contract-form, user-form, price-item-form, group-form, purchase-request-form, statement-form
### components/charts/ (۴) — line-chart, bar-chart, pie-chart, area-chart
### components/dashboard/ (۴) — kpi-grid, chart-container, quick-actions, recent-activity
### components/reports/ (۵) — report-list, report-detail, report-item-list, report-summary, approval-workflow
### components/tasks/ (۳), groups/ (۲), companies/ (۲), contracts/ (۲), statements/ (۲), purchase/ (۲), extra-items/ (۲), personnel/ (۲), price-list/ (۲), notifications/ (۲), activity/ (۲), pwa/ (۲)

## lib/ — کتابخانه‌ها (۲۴)
- db.ts, session.ts, session-config.ts, auth.ts, permissions.ts
- encryption.ts (AES-256-GCM), otp.ts, mobile.ts, date.ts, amount.ts
- api-handler.ts, api-fetch.ts, audit.ts, notification.ts, rate-limit.ts
- storage.ts, validators.ts, constants.ts, cn.ts, csv-client.ts,
  date-client.ts, labels.ts

## models/ — اسکیمای Mongoose (۲۱)
organization, company, contract, user, otp-code, work-unit, work-group,
group-membership, price-item, task, work-report, report-item,
extra-work-item, attachment, approval-event, audit-log, score-event,
notification, purchase-request, statement, sync-queue

## services/ — منطق کسب‌وکار (۱۱)
auth-service, company-service, user-service, report-service,
report-service-queries, approval-service, purchase-service, sync-service,
notification-service, storage-service, analytics-service

## stores/ (۴) — auth-store, offline-store, sync-store, ui-store
## hooks/ (۹) — use-toast, use-mobile, use-media-query, use-offline, use-sync, use-session, use-permissions, use-debounce, use-rtl
## scripts/ (۱) — seed.ts — داده‌ی توسعه
## public/ (۲) — logo.svg, sw.js (service worker)
## docs/ (۲) — api.md, architecture.md
