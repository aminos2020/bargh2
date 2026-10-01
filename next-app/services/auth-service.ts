import { User } from "@/models/user";
import { OtpCode } from "@/models/otp-code";
import { normalizeMobile, hashMobile, maskMobile } from "@/lib/mobile";
import { generateOtp, hashOtp, OTP_TTL_MS, OTP_MAX_ATTEMPTS, sendOtpByGateway } from "@/lib/otp";
import { ApiError } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";
import type { CheckPhoneResult } from "@/types";

export async function checkPhone(rawMobile: string): Promise<CheckPhoneResult> {
  const normalized = normalizeMobile(rawMobile);
  if (!normalized) throw new ApiError("شماره موبایل نامعتبر است.", "INVALID_MOBILE");
  const user = await User.findOne({ mobileHash: hashMobile(normalized) });
  if (!user) return { state: "not_found" };
  if (!user.isActive) return { state: "inactive" };
  return { state: "ok", maskedMobile: maskMobile(normalized), fullName: user.fullName };
}

export async function sendOtp(rawMobile: string): Promise<{ devCode?: string }> {
  const normalized = normalizeMobile(rawMobile);
  if (!normalized) throw new ApiError("شماره موبایل نامعتبر است.", "INVALID_MOBILE");
  const user = await User.findOne({ mobileHash: hashMobile(normalized) });
  if (!user || !user.isActive) throw new ApiError("برای این شماره دسترسی فعالی وجود ندارد.", "NOT_ALLOWED", 403);

  const mobileHash = hashMobile(normalized);
  // بررسی محدودیت تلاش‌های ناموفق اخیر
  const recentFailures = await OtpCode.countDocuments({
    mobileHash,
    attempts: { $gte: OTP_MAX_ATTEMPTS },
    consumedAt: null,
    createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
  });
  if (recentFailures > 0) throw new ApiError("تعداد تلاش‌ها بیش از حد مجاز است؛ ۱۵ دقیقه صبر کنید.", "TOO_MANY_ATTEMPTS", 429);

  const code = generateOtp();
  await OtpCode.create({ mobileHash, otpHash: hashOtp(code), expiresAt: new Date(Date.now() + OTP_TTL_MS), attempts: 0 });
  await sendOtpByGateway(normalized, code);

  // فقط در development کد به کلاینت برمی‌گردد (در production هرگز)
  return process.env.NODE_ENV !== "production" ? { devCode: code } : {};
}

export async function verifyOtp(rawMobile: string, code: string) {
  const normalized = normalizeMobile(rawMobile);
  if (!normalized) throw new ApiError("شماره موبایل نامعتبر است.", "INVALID_MOBILE");
  const mobileHash = hashMobile(normalized);

  const otp = await OtpCode.findOne({ mobileHash, consumedAt: null }).sort({ createdAt: -1 });
  if (!otp) throw new ApiError("کدی برای این شماره ارسال نشده است.", "OTP_NOT_FOUND", 400);
  if (otp.attempts >= OTP_MAX_ATTEMPTS) throw new ApiError("تعداد تلاش‌ها بیش از حد مجاز است؛ دوباره کد بگیرید.", "TOO_MANY_ATTEMPTS", 429);
  if (new Date() > otp.expiresAt) throw new ApiError("کد منقضی شده است؛ دوباره کد بگیرید.", "OTP_EXPIRED", 400);
  if (otp.otpHash !== hashOtp(code)) {
    otp.attempts += 1;
    await otp.save();
    const remaining = OTP_MAX_ATTEMPTS - otp.attempts;
    throw new ApiError(
      remaining > 0 ? `کد اشتباه است؛ ${remaining} تلاش باقی مانده.` : "تعداد تلاش‌ها بیش از حد مجاز شد.",
      remaining > 0 ? "OTP_WRONG" : "TOO_MANY_ATTEMPTS",
      remaining > 0 ? 400 : 429
    );
  }

  otp.consumedAt = new Date();
  await otp.save();

  const user = await User.findOne({ mobileHash });
  if (!user || !user.isActive) throw new ApiError("دسترسی شما غیرفعال شده است. با مدیر تماس بگیرید.", "USER_INACTIVE", 403);

  user.lastLoginAt = new Date();
  await user.save();
  await logAudit({ actorUserId: user._id, actorRole: user.role, action: "ورود به سامانه", entity: "user", entityId: String(user._id) });

  return { userId: String(user._id), role: user.role, organizationId: String(user.organizationId), companyId: user.companyId ? String(user.companyId) : null };
}
