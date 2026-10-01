"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, ClipboardList, Clock3, RefreshCw, Star, WifiOff, Zap } from "lucide-react";
import { PanelPage } from "@/components/layout/panel-page";
import { apiFetch } from "@/lib/api-fetch";
import type { Paginated, Task, WorkReport } from "@/types";
import { KpiGrid, type Kpi } from "@/components/dashboard/kpi-grid";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ErrorState } from "@/components/ui/error-state";
import { CardSkeleton, LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useSyncStore } from "@/stores/sync-store";
import { useOffline } from "@/hooks/use-offline";
import { useAuthStore } from "@/stores/auth-store";
import { formatRial, faDigits } from "@/lib/amount";
import { jalaliLong, todayJalali, todayJalaliStr } from "@/lib/date";
import { jalaliKeyToDisplay } from "@/lib/date";
import { cn } from "@/lib/cn";

const PENDING = ["supervisor_review", "expert_review", "employer_ceo_review"];

function TechHome() {
  const me = useAuthStore((s) => s.me);
  const { online } = useOffline();
  const queueCount = useSyncStore((s) => s.queue.length);
  const reports = useQuery({ queryKey: ["reports", "tech-home"], queryFn: () => apiFetch<Paginated<WorkReport>>("/api/v1/reports?scope=mine&limit=60") });
  const tasks = useQuery({ queryKey: ["tasks", "tech-home"], queryFn: () => apiFetch<Paginated<Task>>("/api/v1/tasks?limit=60") });

  if (reports.isLoading) return <div className="space-y-4"><LoadingSkeleton className="h-32 rounded-card" /><CardSkeleton rows={3} /></div>;
  if (reports.isError || !reports.data) return <Card><ErrorState onRetry={() => reports.refetch()} /></Card>;

  const my = reports.data.items;
  const pending = my.filter((r) => PENDING.includes(r.status));
  const openTasks = (tasks.data?.items || []).filter((t) => t.status === "open" || t.status === "in_progress");
  const today = todayJalaliStr();
  const todayTasks = openTasks.filter((t) => !t.dueDate || t.dueDate <= today);

  const kpis: Kpi[] = [
    { label: "کارهای امروز", value: faDigits(todayTasks.length), icon: <ClipboardList size={18} />, tone: "warn", onClick: () => (location.href = "/technician/tasks") },
    { label: "در انتظار بررسی", value: faDigits(pending.length), icon: <Clock3 size={18} />, tone: "cyan", onClick: () => (location.href = "/technician/reports") },
    { label: "در صف ارسال آفلاین", value: faDigits(queueCount), icon: <RefreshCw size={18} />, tone: queueCount ? "warn" : "ok", onClick: () => (location.href = "/technician/sync-status") },
    { label: "امتیاز کاری", value: "رزومه", icon: <Star size={18} />, tone: "orange", onClick: () => (location.href = "/technician/scores") },
  ];

  return (
    <div className="space-y-4">
      <div className="anim-fade-up flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[21px] font-black text-ink-900">سلام، {me?.fullName.split(" ")[0]}</h1>
          <p className="mt-1 text-[12.5px] font-bold text-ink-400">{jalaliLong(todayJalali())} — آماده‌ی ثبت گزارش میدانی</p>
        </div>
        <span className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-black", online ? "bg-ok-50 text-ok-700" : "bg-amber-50 text-warn-700")}>
          {online ? <CheckCircle2 size={13} /> : <WifiOff size={13} />}
          {online ? "آنلاین" : "آفلاین"}
        </span>
      </div>

      <Link
        href="/technician/reports/new"
        className="anim-fade-up press group relative block overflow-hidden rounded-sheet bg-ink-900 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.25)]"
      >
        <div className="pointer-events-none absolute -start-16 -top-16 h-48 w-48 rounded-full bg-primary-600/30 blur-3xl transition-all group-hover:bg-primary-500/40" />
        <div className="relative flex items-center gap-4">
          <span className="anim-bolt flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-primary-600 text-white">
            <Zap size={28} fill="currentColor" strokeWidth={1.5} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[18px] font-black text-white">ثبت گزارش سریع</span>
            <span className="mt-1 block text-[12px] font-bold leading-6 text-slate-400">
              {online ? "با چند لمس، گزارش کار را ثبت و ارسال کن" : "آفلاین هستی؟ گزارش ذخیره و بعدا ارسال می‌شود"}
            </span>
          </span>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-transform group-hover:-translate-x-1"><ArrowLeft size={22} /></span>
        </div>
      </Link>

      <KpiGrid kpis={kpis} />

      {todayTasks.length > 0 && (
        <Card pad={false}>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-[13px] font-black text-ink-700">کارهای فوری</p>
            <Link href="/technician/tasks" className="text-[11.5px] font-black text-primary-600">مشاهده همه</Link>
          </div>
          <div className="divide-y divide-line/70">
            {todayTasks.slice(0, 3).map((t) => (
              <Link key={t._id} href="/technician/tasks" className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-primary-50/40">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", t.priority === "urgent" ? "bg-bad-600 pulse-dot" : "bg-warn-600")} />
                <span className="min-w-0 flex-1 truncate text-[13px] font-black text-ink-800">{t.title}</span>
                {t.dueDate && <span className="tnum shrink-0 text-[11px] font-bold text-ink-300">مهلت: {jalaliKeyToDisplay(t.dueDate)}</span>}
              </Link>
            ))}
          </div>
        </Card>
      )}

      <Card pad={false}>
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-[13px] font-black text-ink-700">آخرین گزارش‌های من</p>
          <Link href="/technician/reports" className="text-[11.5px] font-black text-primary-600">همه</Link>
        </div>
        {my.length === 0 ? (
          <p className="px-4 py-8 text-center text-[12.5px] font-bold text-ink-300">هنوز گزارشی ثبت نکرده‌اید.</p>
        ) : (
          <div className="divide-y divide-line/70">
            {my.slice(0, 5).map((r) => (
              <Link key={r._id} href={`/technician/reports/${r._id}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-primary-50/40">
                <span className="tnum flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-primary-50 text-[12.5px] font-black text-primary-700">{faDigits(r.itemCount || 0)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-black text-ink-900">{r.groupName}</p>
                  <p className="tnum mt-0.5 text-[11px] font-bold text-ink-400">{jalaliKeyToDisplay(r.reportDateJ)} — {formatRial(r.totalAmount || 0, false)} ریال</p>
                </div>
                <StatusBadge status={r.status} />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function TechnicianHomePage() {
  return (
    <PanelPage role="TECHNICIAN" fab={{ label: "گزارش سریع", href: "/technician/reports/new" }}>
      <TechHome />
    </PanelPage>
  );
}
