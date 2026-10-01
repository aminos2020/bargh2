const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function faDigits(v: string | number): string {
  return String(v).replace(/\d/g, (d) => FA_DIGITS[+d]);
}

/** همه‌ی مبالغ به ریال ذخیره می‌شوند؛ این تابع فقط برای نمایش است. */
export function formatRial(n: number, withUnit = true): string {
  const grouped = Math.round(n).toLocaleString("en-US").replace(/,/g, "٬");
  return `${faDigits(grouped)}${withUnit ? " ریال" : ""}`;
}

export function compactRial(n: number): string {
  const fmt = (v: number) => faDigits(v.toFixed(1).replace(/\.0$/, "").replace(".", "٫"));
  if (n >= 1_000_000_000) return `${fmt(n / 1_000_000_000)} میلیارد`;
  if (n >= 1_000_000) return `${fmt(n / 1_000_000)} میلیون`;
  if (n >= 1_000) return `${fmt(n / 1_000)} هزار`;
  return faDigits(String(Math.round(n)));
}

export function isPositiveInt(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v > 0 && Number.isInteger(v);
}
