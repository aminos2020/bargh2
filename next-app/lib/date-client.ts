"use client";
import { faDigits } from "./amount";

const FA = "۰۱۲۳۴۵۶۷۸۹";

export function relativeTimeFa(iso?: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "هم‌اکنون";
  if (m < 60) return `${faDigits(m)} دقیقه پیش`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${faDigits(h)} ساعت پیش`;
  const d = Math.floor(h / 24);
  if (d < 31) return `${faDigits(d)} روز پیش`;
  const dt = new Date(iso);
  return faDigits(`${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, "0")}/${String(dt.getDate()).padStart(2, "0")}`);
}

export function toFaDigits(v: string | number): string {
  return String(v).replace(/\d/g, (d) => FA[+d]);
}
