import jalaali from "jalaali-js";

export interface JalaliDate { jy: number; jm: number; jd: number; }

const pad2 = (n: number) => String(n).padStart(2, "0");

export function toJalali(date: Date = new Date()): JalaliDate {
  const j = jalaali.toJalaali(date);
  return { jy: j.jy, jm: j.jm, jd: j.jd };
}

export function jalaliKey(d: JalaliDate = toJalali()): string {
  return `${d.jy}-${pad2(d.jm)}-${pad2(d.jd)}`;
}

export function jalaliStr(d: JalaliDate = toJalali()): string {
  return `${d.jy}/${pad2(d.jm)}/${pad2(d.jd)}`;
}

export function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
  const g = jalaali.toGregorian(jy, jm, jd);
  return new Date(g.gy, g.gm - 1, g.gd);
}

/** اعتبارسنجی کلید تاریخ شمسی YYYY-MM-DD */
export function isValidJalaliKey(key: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return false;
  const [, y, mo, d] = m.map(Number);
  if (mo < 1 || mo > 12) return false;
  const maxDay = mo <= 6 ? 31 : mo <= 11 ? 30 : jalaali.isLeapJalaaliYear(y) ? 30 : 29;
  return d >= 1 && d <= maxDay;
}

const MONTHS_FA = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];

export function jalaliLong(d: JalaliDate = toJalali()): string {
  return `${d.jd} ${MONTHS_FA[d.jm - 1]} ${d.jy}`;
}

export function jalaliKeyToDisplay(key?: string | null): string {
  if (!key) return "—";
  return key;
}
