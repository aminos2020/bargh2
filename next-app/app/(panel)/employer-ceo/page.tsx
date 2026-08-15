"use client";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ClipboardCheck, FileText, ShieldAlert, Users, PenLine } from "lucide-react";
import { PanelPage } from "@/components/layout/panel-page";
import { apiFetch } from "@/lib/api-fetch";
import type { Paginated, WorkReport } from "@/types";
import { KpiGrid, type Kpi } from "@/components/dashboard/kpi-grid";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ChartContainer } from "@/components/dashboard/chart-container";
import { TrendLineChart } from "@/components/charts/line-chart";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { ErrorState } from "@/components/ui/error-state";
import { CardSkeleton, LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { formatRial, faDigits } from "@/lib/amount";
import { jalaliKey, toJalali } from "@/lib/date";

function CEOHome() {
  const q = useQuery({ queryKey: ["reports", "ceo-home"], queryFn: () => apiFetch<Paginated<WorkReport>>("/api/v1/reports?limit=100") });
  if (q.isLoading) return <div className="space-y-4"><LoadingSkeleton className="h-8 w-64" /><CardSkeleton rows={4} /></div>;
  if (q.isError || !q.data) return <Card><ErrorState onRetry={() => q.refetch()} /></Card>;
  const reports = q.data.items;
  const pending = reports.filter((r) => r.status === "employer_ceo_review");
  const approved = reports.filter((r) => r.status === "approved" || r.status === "settled");
  const disputed = reports.filter((r) => r.status === "disputed");
  const approvedAmount = approved.reduce((s, r) => s + (r.totalAmount || 0), 0);

  const days: { day: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = jalaliKey(toJalali(d));
    days.push({ day: key.slice(5), count: reports.filter((r) => r.reportDateJ === key).length });
  }

  const kpis: Kpi[] = [
    { label: "در انتظار تایید نهایی", value: faDigits(pending.length), icon: <ClipboardCheck size={18} />, tone: "warn", sub: pending.length ? "هم‌اکنون در نوبت شما" : "صف خالی است", onClick: () => (location.href = "/employer-ceo/reviews") },
    { label: "تایید نهایی", value: faDigits(approved.length), icon: <CheckCircle2 size={18} />, tone: "ok", onClick: () => (location.href = "/employer-ceo/reports") },
    { label: "اختلاف", value: faDigits(disputed.length), icon: <ShieldAlert size={18} />, tone: disputed.length ? "bad" : "primary", onClick: () => (location.href = "/employer-ceo/reports") },
    { label: "جمع تاییدشده (ریال)", value: faDigits(approvedAmount.toLocaleString("en-US").replace(/,/g, "٬")), icon: <FileText size={18} />, tone: "teal" },
  ];

  return (
    <div className="space-y-5">
      <div className="anim-fade-up">
        <h1 className="text-[22px] font-black text-ink-900">داشبورد رییس کارفرما</h1>
        <p className="mt-1 text-[12.5px] font-bold text-ink-400">گزارش‌های تاییدشده توسط کارشناسان، آماده‌ی تایید نهایی شما هستند</p>
      </div>
      <KpiGrid kpis={kpis} />
      <QuickActions actions={[
        { label: "مشاهده گزارش‌ها", icon: FileText, href: "/employer-ceo/reviews", tone: "dark" },
        { label: "مدیریت گروه‌ها", icon: Users, href: "/employer-ceo/groups" },
        { label: "گزارش‌های روزانه", icon: PenLine, href: "/employer-ceo/daily-reports" },
      ]} />
      <ChartContainer title="روند گزارش‌های ۱۴ روزه" data={days}>
        <TrendLineChart data={days} xKey="day" lines={[{ key: "count", color: "#2563EB", name: "گزارش" }]} />
      </ChartContainer>
      <Card pad={false}>
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-[13px] font-black text-ink-700">در انتظار تایید نهایی</p>
        </div>
        {pending.length === 0 ? (
          <p className="px-4 py-8 text-center text-[12.5px] font-bold text-ink-300">موردی در نوبت نیست.</p>
        ) : (
          <div className="divide-y divide-line/70">
            {pending.slice(0, 5).map((r) => (
              <a key={r._id} href={`/employer-ceo/reviews/${r._id}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-primary-50/40">
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

export default function EmployerCeoHomePage() {
  return <PanelPage role="EMPLOYER_CEO"><CEOHome /></PanelPage>;
}
