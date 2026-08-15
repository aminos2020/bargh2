"use client";
import { Badge } from "./badge";
import { cn } from "@/lib/cn";

export interface StatusMeta { label: string; badge: string; dot: string; }

export const STATUS_STYLES: Record<string, StatusMeta> = {
  // گزارش کار
  draft: { label: "پیش‌نویس", badge: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
  submitted: { label: "ارسال‌شده", badge: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  supervisor_review: { label: "در انتظار سرپرست", badge: "bg-amber-50 text-warn-700 border-amber-200", dot: "bg-amber-500" },
  expert_review: { label: "در انتظار کارشناس کارفرما", badge: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  employer_ceo_review: { label: "در انتظار تایید نهایی", badge: "bg-cyan-50 text-cyan-700 border-cyan-200", dot: "bg-cyan-500" },
  approved: { label: "تایید نهایی", badge: "bg-ok-50 text-ok-700 border-green-200", dot: "bg-ok-600" },
  rejected: { label: "رد شده", badge: "bg-bad-50 text-bad-700 border-red-200", dot: "bg-bad-600" },
  redo_requested: { label: "انجام مجدد", badge: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-400" },
  disputed: { label: "اختلاف", badge: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  settled: { label: "تسویه‌شده", badge: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500" },
  // کار
  open: { label: "باز", badge: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  in_progress: { label: "در حال انجام", badge: "bg-amber-50 text-warn-700 border-amber-200", dot: "bg-amber-500" },
  done: { label: "انجام شده", badge: "bg-ok-50 text-ok-700 border-green-200", dot: "bg-ok-600" },
  cancelled: { label: "لغو شده", badge: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400" },
  // خرید / صورت‌وضعیت / قرارداد
  purchased: { label: "خریداری‌شده", badge: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500" },
  paid: { label: "پرداخت‌شده", badge: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500" },
  active: { label: "فعال", badge: "bg-ok-50 text-ok-700 border-green-200", dot: "bg-ok-600" },
  completed: { label: "تکمیل‌شده", badge: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
  terminated: { label: "خاتمه‌یافته", badge: "bg-bad-50 text-bad-700 border-red-200", dot: "bg-bad-600" },
  // معادل‌سازی
  pending: { label: "در انتظار", badge: "bg-amber-50 text-warn-700 border-amber-200", dot: "bg-amber-500" },
  mapped: { label: "معادل‌سازی‌شده", badge: "bg-ok-50 text-ok-700 border-green-200", dot: "bg-ok-600" },
  // اولویت
  low: { label: "کم", badge: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
  medium: { label: "متوسط", badge: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  high: { label: "زیاد", badge: "bg-amber-50 text-warn-700 border-amber-200", dot: "bg-amber-500" },
  urgent: { label: "فوری", badge: "bg-bad-50 text-bad-700 border-red-200", dot: "bg-bad-600" },
};

export function StatusBadge({ status, meta, className }: { status?: string; meta?: StatusMeta; className?: string }) {
  const m = meta || (status ? STATUS_STYLES[status] : null);
  if (!m) return null;
  return (
    <Badge className={cn(m.badge, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </Badge>
  );
}
