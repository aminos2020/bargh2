"use client";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ClipboardCheck, ListTodo, Users, Zap } from "lucide-react";
import { PanelPage } from "@/components/layout/panel-page";
import { apiFetch } from "@/lib/api-fetch";
import type { Paginated, WorkReport } from "@/types";
import { KpiGrid, type Kpi } from "@/components/dashboard/kpi-grid";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { ErrorState } from "@/components/ui/error-state";
import { CardSkeleton, LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { formatRial, faDigits } from "@/lib/amount";
import { todayJalaliStr } from "@/lib/date";
import { useAuthStore } from "@/stores/auth-store";

function SupervisorHome() {
  const me = useAuthStore((s) => s.me);
  const q = useQuery({ queryKey: ["reports", "sup-home"], queryFn: () => apiFetch<Paginated<WorkReport>>("/api/v1/reports?limit=80") });
  if (q.isLoading) return <div className="space-y-4"><LoadingSkeleton className="h-8 w-64" /><CardSkeleton rows={3} /></div>;
  if (q.isError || !q.data) return <Card><ErrorState onRetry={() => q.refetch()} /></Card>;
  const work = q.data.items;
  const queue = work.filter((r) => r.status === "supervisor_review" && r.userId !== me?._id);
  const today = todayJalaliStr();
  const todayCount = work.filter((r) => r.reportDateJ === today).length;
  const myReports = work.filter((r) => r.userId === me?._id);

  const kpis: Kpi[] = [
    { label: "در انتظار بررسی", value: faDigits(queue.length), icon: <ClipboardCheck size={18} />, tone: queue.length ? "warn" : "ok", sub: queue.length ? "هم‌اکنون در نوبت شما" : "صف خالی است", onClick: () => (location.href = "/supervisor/reviews") },
    { label: "گزارش‌های امروز", value: faDigits(todayCount), icon: <CheckCircle2 size={18} />, tone: "teal", onClick: () => (location.href = "/supervisor/reviews") },
    { label: "گزارش‌های شخصی من", value: faDigits(myReports.length), icon: <Zap size={18} />, tone: "primary", onClick: () => (location.href = "/supervisor/reports") },
    { label: "گروه من", value: "اعضا", icon: <Users size={18} />, tone: "dark", onClick: () => (location.href = "/supervisor/group") },
  ];

  return (
    <div className="space-y-5">
      <div className="anim-fade-up">
        <h1 className="text-[22px] font-black text-ink-900">{me?.fullName}</h1>
        <p className="mt-1 text-[12.5px] font-bold text-ink-400">سرپرست گروه — بررسی گزارش‌ها، ثبت گزارش شخصی و راهبری اکیپ</p>
      </div>
      <KpiGrid kpis={kpis} />
      <QuickActions actions={[
        { label: "ثبت گزارش کار", icon: Zap, href: "/supervisor/reports/new", tone: "dark" },
        { label: "بررسی گزارش‌ها", icon: ClipboardCheck, href: "/supervisor/reviews" },
        { label: "کارهای گروه", icon: ListTodo, href: "/supervisor/tasks" },
      ]} />
      <Card pad={false}>
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-[13px] font-black text-ink-700">آخرین گزارش‌های گروه</p>
          <a href="/supervisor/reviews" className="text-[11.5px] font-black text-primary-600">همه</a>
        </div>
        {work.length === 0 ? (
          <p className="px-4 py-8 text-center text-[12.5px] font-bold text-ink-300">گزارشی در گروه نیست.</p>
        ) : (
          <div className="divide-y divide-line/70">
            {work.slice(0, 5).map((r) => (
              <a key={r._id} href={`/supervisor/reviews/${r._id}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-primary-50/40">
                <Avatar name={r.userName} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-black text-ink-900">{r.userName}{r.userId === me?._id ? " (شما)" : ""}</p>
                  <p className="mt-0.5 truncate text-[11px] font-bold text-ink-400">{r.groupName} — {r.reportDateJ}</p>
                </div>
                <span className="tnum text-[12px] font-black text-ink-700">{formatRial(r.totalAmount || 0, false)}</span>
                <StatusBadge status={r.status} />
              </a>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function SupervisorHomePage() {
  return <PanelPage role="GROUP_SUPERVISOR" fab={{ label: "گزارش سریع", href: "/supervisor/reports/new" }}><SupervisorHome /></PanelPage>;
}
