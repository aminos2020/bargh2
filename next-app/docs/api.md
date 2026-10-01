# مستندات API — توان‌بان

همه‌ی endpointها زیر `/api/v1` هستند. فرمت پاسخ:

```json
// موفق
{ "ok": true, "data": { ... } }
// ناموفق
{ "ok": false, "error": { "code": "FORBIDDEN", "message": "پیام فارسی امن", "details": null } }
```

لیست‌ها pagination دارند: `{ page, limit, total, hasNextPage, items }`.

## auth
| متد | مسیر | توضیح | دسترسی |
|---|---|---|---|
| POST | `/auth/check-phone` | بررسی ثبت/فعال‌بودن شماره | عمومی (rate limit: ۱۰/دقیقه) |
| POST | `/auth/send-otp` | ارسال OTP پنج‌رقمی (۲ دقیقه اعتبار) | عمومی (۵/دقیقه) |
| POST | `/auth/verify-otp` | تایید کد و ایجاد نشست | عمومی (۱۰/دقیقه) |
| POST | `/auth/logout` | پایان نشست | لاگین |

## گزارش کار
| متد | مسیر | توضیح |
|---|---|---|
| GET | `/reports` | لیست با فیلترهای status/group/search + ایزولاسیون نقش؛ `scope=my-queue` (صف بدون گزارش‌های خودم) و `scope=mine` (فقط خودم) |
| POST | `/reports` | ثبت گزارش (تکنسین/سرپرست + ثبت سرپرست به نام نیرو با `onBehalfUserId`) — idempotencyKey الزامی |
| GET | `/reports/[id]` | جزییات کامل (آیتم‌ها، اضافی‌ها، مستندات، تایم‌لاین) |
| POST | `/reports/[id]/approval` | `{ action: approve\|reject\|redo\|dispute, reason? }` — دلیل برای رد/مجدد/اختلاف الزامی |
| POST | `/reports/[id]/resubmit` | ارسال مجدد بعد از redo (فقط صاحب گزارش) |
| GET/POST | `/reports/daily` | گزارش روزانه‌ی کارشناس کارفرما |

## سایر
- `/companies`, `/contracts` — CRUD معاونت
- `/users`, `/users/me`, `/users/[id]`, `/users/[id]/profile` — مدیریت کاربران (نقش‌های مجاز)
- `/units`, `/groups`, `/groups/[id]`, `/groups/[id]/members`, `/memberships` — واحدها/گروه‌ها/تخصیص بدون تغییر مالکیت
- `/price-items` — فهرست بها (تکنسین فقط گروه‌های خودش را می‌بیند)
- `/tasks`, `/tasks/[id]` — کارهای محوله
- `/extra-items`, `/extra-items/[id]/map|reject` — معادل‌سازی (فقط نماینده مقیم)
- `/purchase-requests`, `/[id]/decide|purchased` — خرید/تجهیز
- `/statements`, `/statements/preview`, `/[id]/decide` — صورت‌وضعیت (تایید: معاونت)
- `/notifications`, `/[id]/read`, `/read-all` — اعلان‌ها
- `/activity-logs` — Audit Log (به تفکیک حوزه‌ی هر نقش)
- `/analytics` — KPI و نمودارها
- `/sync` — همگام‌سازی صف آفلاین (هر op با idempotencyKey دقیقا یک بار)
- `/files/[name]` — سرو عکس‌های آپلودشده

## خطاهای رایج
`UNAUTHENTICATED (401)` / `FORBIDDEN (403)` / `NOT_FOUND (404)` / `VALIDATION (422)` / `RATE_LIMITED (429)` / `OTP_EXPIRED` / `OTP_WRONG` / `TOO_MANY_ATTEMPTS` / `USER_INACTIVE`
