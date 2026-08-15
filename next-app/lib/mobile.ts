import { encrypt, decrypt, stableHash } from "./encryption";

const FA = "۰۱۲۳۴۵۶۷۸۹";
const AR = "٠١٢٣٤٥٦٧٨٩";

export function enDigits(v: string): string {
  return v
    .split("")
    .map((c) => {
      const fa = FA.indexOf(c);
      if (fa > -1) return String(fa);
      const ar = AR.indexOf(c);
      if (ar > -1) return String(ar);
      return c;
    })
    .join("");
}

/** نرمال‌سازی شماره به فرمت 09xxxxxxxxx — در صورت نامعتبر بودن null */
export function normalizeMobile(raw: string): string | null {
  let m = enDigits(String(raw || "")).replace(/[\s\-().]/g, "");
  if (m.startsWith("+98")) m = "0" + m.slice(3);
  else if (m.startsWith("0098")) m = "0" + m.slice(4);
  else if (m.startsWith("98") && m.length === 12) m = "0" + m.slice(2);
  else if (m.startsWith("9") && m.length === 10) m = "0" + m;
  return /^09\d{9}$/.test(m) ? m : null;
}

/** هش برای جستجو/یکتایی */
export function hashMobile(normalized: string): string {
  return stableHash("mobile::" + normalized);
}

/** رمزنگاری برای نمایش (بازگشت‌پذیر) */
export function encryptMobile(normalized: string): string {
  return encrypt(normalized);
}

export function decryptMobile(payload: string): string {
  try {
    return decrypt(payload);
  } catch {
    return "";
  }
}

export function maskMobile(normalized: string): string {
  if (!normalized || normalized.length < 11) return "***";
  return `••••${normalized.slice(7)}`;
}
