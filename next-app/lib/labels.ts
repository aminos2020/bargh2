"use client";
import type { StatusMeta } from "@/components/ui/status-badge";

export const EXTRA_STATUS_FA: Record<string, StatusMeta> = {
  pending: { label: "در انتظار معادل‌سازی", badge: "bg-amber-50 text-warn-700 border-amber-200", dot: "bg-amber-500" },
  mapped: { label: "معادل‌سازی‌شده", badge: "bg-ok-50 text-ok-700 border-green-200", dot: "bg-ok-600" },
  rejected: { label: "رد شده", badge: "bg-bad-50 text-bad-700 border-red-200", dot: "bg-bad-600" },
};
