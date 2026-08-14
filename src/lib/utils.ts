/* ---------------- Jalali (jalaali-js algorithm) ---------------- */

function div(a: number, b: number) { return ~~(a / b); }
function mod(a: number, b: number) { return a - ~~(a / b) * b; }

function jalCal(jy: number) {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  const bl = breaks.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jump = 0;
  for (let i = 1; i < bl; i += 1) {
    const jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  const n = jy - jp;
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  let k = n;
  if (jump - n < 6) k = n - jump + div(jump + 4, 33) * 33;
  let leap = mod(mod(k + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;
  return { leap, gy, march };
}

function g2d(gy: number, gm: number, gd: number) {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

function d2g(jdn: number) {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

function j2d(jy: number, jm: number, jd: number) {
  const r = jalCal(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

function d2j(jdn: number) {
  const gy = d2g(jdn).gy;
  let jy = gy - 621;
  const r = jalCal(jy);
  const jdn1f = g2d(gy, 3, r.march);
  let k = jdn - jdn1f;
  if (k >= 0) {
    if (k <= 185) {
      return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 };
    }
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  return { jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 };
}

export interface JalaliDate { jy: number; jm: number; jd: number; }

export function toJalali(date: Date): JalaliDate {
  return d2j(g2d(date.getFullYear(), date.getMonth() + 1, date.getDate()));
}

export function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
  const g = d2g(j2d(jy, jm, jd));
  return new Date(g.gy, g.gm - 1, g.gd);
}

export const JALALI_MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];

const pad2 = (n: number) => String(n).padStart(2, "0");

export function jalaliKey(d: JalaliDate): string {
  return `${d.jy}-${pad2(d.jm)}-${pad2(d.jd)}`;
}

export function jalaliStr(d: JalaliDate): string {
  return `${d.jy}/${pad2(d.jm)}/${pad2(d.jd)}`;
}

export function jalaliLong(d: JalaliDate): string {
  return `${d.jd} ${JALALI_MONTHS[d.jm - 1]} ${d.jy}`;
}

export function todayJalali(): JalaliDate { return toJalali(new Date()); }
export function todayJalaliStr(): string { return jalaliStr(todayJalali()); }

export function daysAgoJalali(n: number): JalaliDate {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toJalali(d);
}

export function isoToJalaliStr(iso?: string | null): string {
  if (!iso) return "—";
  return jalaliStr(toJalali(new Date(iso)));
}

export function jalaliKeyToDisplay(key: string): string {
  const [jy, jm, jd] = key.split("-");
  return `${jy}/${jm}/${jd}`;
}

export function lastNDays(n: number): { key: string; label: string; date: Date }[] {
  const out: { key: string; label: string; date: Date }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const j = toJalali(d);
    out.push({ key: jalaliKey(j), label: `${pad2(j.jm)}/${pad2(j.jd)}`, date: d });
  }
  return out;
}

/* ---------------- numbers & formatting ---------------- */

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function faDigits(v: string | number): string {
  return String(v).replace(/\d/g, (d) => FA_DIGITS[+d]);
}

export function enDigits(v: string): string {
  return v
    .replace(/[۰-۹]/g, (c) => String(FA_DIGITS.indexOf(c)))
    .replace(/[٠-٩]/g, (c) => String("٠١٢٣٤٥٦٧٨٩".indexOf(c)));
}

export function formatNumber(n: number): string {
  return faDigits(Math.round(n).toLocaleString("en-US").replace(/,/g, "٬"));
}

export function formatRial(n: number, withUnit = true): string {
  return `${formatNumber(n)}${withUnit ? " ریال" : ""}`;
}

export function compactRial(n: number): string {
  const fmt = (v: number) => faDigits(v.toFixed(1).replace(/\.0$/, "").replace(".", "٫"));
  if (n >= 1_000_000_000) return `${fmt(n / 1_000_000_000)} میلیارد`;
  if (n >= 1_000_000) return `${fmt(n / 1_000_000)} میلیون`;
  if (n >= 1_000) return `${fmt(n / 1_000)} هزار`;
  return formatNumber(n);
}

export function relativeTime(iso?: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "هم‌اکنون";
  if (m < 60) return `${faDigits(m)} دقیقه پیش`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${faDigits(h)} ساعت پیش`;
  const d = Math.floor(h / 24);
  if (d < 31) return `${faDigits(d)} روز پیش`;
  return isoToJalaliStr(iso);
}

/* ---------------- mobile ---------------- */

export function normalizeMobile(raw: string): string | null {
  let m = enDigits(String(raw)).replace(/[\s\-().]/g, "");
  if (m.startsWith("+98")) m = "0" + m.slice(3);
  else if (m.startsWith("0098")) m = "0" + m.slice(4);
  else if (m.startsWith("98") && m.length === 12) m = "0" + m.slice(2);
  else if (m.startsWith("9") && m.length === 10) m = "0" + m;
  return /^09\d{9}$/.test(m) ? m : null;
}

export function maskMobile(mobile: string): string {
  return `••••${mobile.slice(7)}`;
}

/* ---------------- misc ---------------- */

export function nav(path: string) {
  window.location.hash = path;
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const content = "\uFEFF" + [headers, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function compressImage(file: File, maxDim = 1280, quality = 0.72): Promise<{ dataUrl: string; size: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve({ dataUrl, size: dataUrl.length });
      };
      img.onerror = reject;
      img.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
