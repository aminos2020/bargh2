import { createHash } from "crypto";

export const OTP_TTL_MS = 2 * 60 * 1000; // ۲ دقیقه
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_LENGTH = 5;

export function generateOtp(): string {
  const n = Math.floor(10000 + Math.random() * 90000);
  return String(n);
}

export function hashOtp(otp: string): string {
  return createHash("sha256").update("otp::" + otp).digest("hex");
}

/**
 * ارسال واقعی OTP — در development کد فقط در console سرور لاگ می‌شود.
 * برای production بدنه‌ی این تابع را به درگاه SMS خود (کاوه‌نگار/ملی‌پیامک/…) متصل کنید.
 */
export async function sendOtpByGateway(mobile: string, code: string): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(`\n[OTP-DEV] شماره: ${mobile} — کد ورود: ${code}\n`);
    return;
  }
  // TODO-OPERATIONS: اینجا را با fetch به درگاه پیامک واقعی جایگزین کنید.
  // هیچ‌وقت کد OTP را در لاگ production چاپ نکنید.
  throw new Error("SMS gateway is not configured. Set up sendOtpByGateway() in lib/otp.ts");
}
