"use client";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CheckCheck, ClipboardCheck, ListTodo, PenLine } from "lucide-react";
import { PanelPage } from "@/components/layout/panel-page";
import { apiFetch } from "@/lib/api-fetch";
import type { Paginated, Task, WorkReport } from "@/types";
import { KpiGrid, type Kpi } from "@/components/dashboard/kpi-grid";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { ErrorState } from "@/components/ui/error-state";
import { CardSkeleton, LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { formatRial, faDigits } from "@/lib/amount";
import { todayJalaliStr } from "@/lib/date";

function ExpertHome() {
  const reports = useQuery({ queryKey: ["reports", "expert-home"], queryFn: () => apiFetch<Paginated<WorkReport>>("/api/v1/reports?limit=60") });
  const tasks = useQuery({ queryKey: ["tasks", "expert-home"], queryFn: () => apiFetch<Paginated<Task>>("/api/v1/tasks?limit=60") });
  const daily = useQuery({ queryKey: ["daily-mine"], queryFn: () => apiFetch<Paginated<{ _id: string; reportDateJ: string }>>("/api/v1/reports/daily?limit=10") });

  if (reports.isLoading) return <div className="space-y-4"><LoadingSkeleton className="h-8 w-64" /><CardSkeleton rows={3} /></div>;
  if (reports.isError || !reports.data) return <Card><ErrorState onRetry={() => reports.refetch()} /></Card>;

  const queue = reports.data.items.filter((r) => r.status === "expert_review");
  const openTasks = (tasks.data?.items || []).filter((t) => t.status === "open" || t.status === "in_progress");
  const dailyDone = (daily.data?.items || []).some((d) => d.reportDateJ === todayJalaliStr());

  const kpis: Kpi[] = [
    { label: "در انتظار بررسی", value: faDigits(queue.length), icon: <ClipboardCheck size={18} />, tone: "warn", sub: queue.length ? "تاییدشده توسط سرپرست" : "صف خالی است", onClick: () => (location.href = "/employer-expert/reviews") },
    { label: "کارهای محول‌شده", value: faDigits(openTasks.length), icon: <ListTodo size={18} />, tone: "cyan", onClick: () => (location.href = "/employer-expert/tasks") },
    { label: "گزارش روزانه امروز", value: dailyDone ? "ثبت شد" : "ثبت نشده", icon: <BookOpen size={18} />, tone: dailyDone ? "ok" : "orange", onClick: () => (location.href = "/employer-expert/daily-report") },
  ];

  return (
    <div className="space-y-5">
      <div className="anim-fade-up">
        <h1 className="text-[22px] font-black text-ink-900">پنل کارشناس کارفرما</h1>
        <p className="mt-1 text-[12.5px] font-bold text-ink-400">بررسی مستندات و گزارش‌های تاییدشده توسط سرپرست گروه</p>
      </div>
      <KpiGrid kpis={kpis} cols={3} />
      <QuickActions actions={[
        { label: "ثبت گزارش روزانه", icon: PenLine, href: "/employer-expert/daily-report", tone: "dark" },
        { label: "بررسی گزارش‌ها", icon: CheckCheck, href: "/employer-expert/reviews" },
      ]} />
      <Card pad={false}>
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-[13px] font-black text-ink-700">در انتظار بررسی شما</p>
          <a href="/employer-expert/reviews" className="text-[11.5px] font-black text-primary-600">همه</a>
        </div>
        {queue.length === 0 ? (
          <p className="px-4 py-8 text-center text-[12.5px] font-bold text-ink-300">موردی در نوبت نیست.</p>
        ) : (
          <div className="divide-y divide-line/70">
            {queue.slice(0, 5).map((r) => (
              <a key={r._id} href={`/employer-expert/reviews/${r._id}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-primary-50/40">
                <Avatar name={r.userName} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-black text-ink-900">{r.userName}</p>
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

export default function ExpertHomePage() {
  return <PanelPage role="EMPLOYER_EXPERT"><ExpertHome /></PanelPage>;
}
