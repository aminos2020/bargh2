"use client";
import type { ApiResponse } from "@/types";

/**
 * لایه‌ی fetch کلاینت — همه‌ی پاسخ‌ها به فرم { ok, data | error } هستند.
 * در صورت خطا، Error با پیام فارسیِ امن پرتاب می‌شود.
 */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    credentials: "same-origin",
  });
  let json: ApiResponse<T>;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new Error("پاسخ سرور نامعتبر است؛ دوباره تلاش کنید.");
  }
  if (!json.ok) throw new Error(json.error?.message || "خطایی رخ داده است.");
  return json.data;
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  return apiFetch<T>(url, { method: "POST", body: JSON.stringify(body) });
}

export async function apiPatch<T>(url: string, body: unknown): Promise<T> {
  return apiFetch<T>(url, { method: "PATCH", body: JSON.stringify(body) });
}

export async function apiDelete<T>(url: string): Promise<T> {
  return apiFetch<T>(url, { method: "DELETE" });
}
