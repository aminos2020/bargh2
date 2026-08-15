"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Building2, CheckCircle2, Clock3, FileText, Receipt, ShieldAlert, Wallet } from "lucide-react";
import { PanelPage } from "@/components/layout/panel-page";
import { apiFetch } from "@/lib/api-fetch";
import { KpiGrid, type Kpi } from "@/components/dashboard/kpi-grid";
import { ChartContainer } from "@/components/dashboard/chart-container";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { TrendLineChart } from "@/components/charts/line-chart";
import { StatusPieChart } from "@/components/charts/pie-chart";
import { AmountAreaChart } from "@/components/charts/area-chart";
import { SimpleBarChart } from "@/components/charts/bar-chart";
import { CardSkeleton, LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Card } from "@/components/ui/card";
import { compactRial, faDigits } from "@/lib/amount";
import { REPORT_STATUS_LABEL } from "@/types";
import type { AuditLog } from "@/types";

interface Analytics {
  kpis: Record<string, number>;
  trend: { day: string; count: number }[];
  statusDist: { status: string; count: number }[];
  groupDist: { name: string; count: number }[];
  companyPerf: { name: string; count: number; approved: number }[];
}

function DeputyHome() {
  const a = useQuery({ queryKey: ["analytics", 14], queryFn: () => apiFetch<Analytics>("/api/v1/analytics?days=14") });
  const logs = useQuery({ queryKey: ["activity", "recent"], queryFn: () => apiFetch<{ items: AuditLog[] }>("/api/v1/activity-logs?limit=8") });

  if (a.isLoading) return <div className="space-y-4"><LoadingSkeleton className="h-8 w-64" /><CardSkeleton rows={4} /><LoadingSkeleton className="h-72 rounded-card" /></div>;
  if (a.isError || !a.data) return <Card><ErrorState onRetry={() => a.refetch()} /></Card>;
  const { kpis } = a.data;

  const kpiList: Kpi[] = [
    { label: "شرکت‌های فعال", value: faDigits(kpis.activeCompanies), icon: <Building2 size={18} />, tone: "primary", onClick: () => (location.href = "/deputy/companies") },
    { label: "قراردادهای فعال", value: faDigits(kpis.activeContracts), icon: <Receipt size={18} />, tone: "cyan", onClick: () => (location.href = "/deputy/contracts") },
    { label: "گزارش‌های امروز", value: faDigits(kpis.todayReports), icon: <FileText size={18} />, tone: "dark", onClick: () => (location.href = "/deputy/reports") },
    { label: "در انتظار بررسی", value: faDigits(kpis.pendingReports), icon: <Clock3 size={18} />, tone: "warn", onClick: () => (location.href = "/deputy/reports") },
    { label: "تایید نهایی", value: faDigits(kpis.approvedReports), icon: <CheckCircle2 size={18} />, tone: "ok", onClick: () => (location.href = "/deputy/reports") },
    { label: "رد شده", value: faDigits(kpis.rejectedReports), icon: <ShieldAlert size={18} />, tone: "bad", onClick: () => (location.href = "/deputy/reports") },
    { label: "اختلاف", value: faDigits(kpis.disputedReports), icon: <ShieldAlert size={18} />, tone: "orange", onClick: () => (location.href = "/deputy/reports") },
    { label: "هزینه تاییدشده", value: compactRial(kpis.approvedAmount), icon: <Wallet size={18} />, tone: "teal", onClick: () => (location.href = "/deputy/statements") },
  ];

  return (
    <div className="space-y-5">
      <div className="anim-fade-up">
        <h1 className="text-[22px] font-black text-ink-900">داشبورد معاونت بهره‌برداری</h1>
        <p className="mt-1 text-[12.5px] font-bold text-ink-400">نمای کلان گزارش‌ها، هزینه‌ها و عملکرد شرکت‌ها — ۱۴ روز اخیر</p>
      </div>

      <KpiGrid kpis={kpiList} />

      <QuickActions actions={[
        { label: "ثبت شرکت", icon: Building2, href: "/deputy/companies" },
        { label: "ثبت قرارداد", icon: Receipt, href: "/deputy/contracts" },
        { label: "تحلیل‌ها", icon: BarChart3, href: "/deputy/analytics", tone: "dark" },
      ]} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartContainer title="روند گزارش‌های روزانه" subtitle="تعداد گزارش ثبت‌شده در هر روز" data={a.data.trend}>
          <TrendLineChart data={a.data.trend} xKey="day" lines={[{ key: "count", color: "#2563EB", name: "گزارش‌ها" }]} />
        </ChartContainer>
        <ChartContainer title="هزینه‌ی تاییدشده" subtitle="روند ۱۴ روزه (ریال)" data={a.data.trend}>
          <AmountAreaChart data={a.data.trend.map((t) => ({ ...t, amount: t.amount * 42_000_000 }))} xKey="day" yKey="amount" />
        </ChartContainer>
        <ChartContainer title="توزیع وضعیت گزارش‌ها" data={a.data.statusDist.filter((s) => s.count > 0)}>
          <StatusPieChart data={a.data.statusDist.filter((s) => s.count > 0).map((s) => ({ name: REPORT_STATUS_LABEL[s.status as keyof typeof REPORT_STATUS_LABEL], value: s.count }))} />
        </ChartContainer>
        <ChartContainer title="عملکرد شرکت‌ها" subtitle="گزارش ثبت‌شده و تاییدشده" data={a.data.companyPerf}>
          <SimpleBarChart data={a.data.companyPerf} xKey="name" yKey="count" />
        </ChartContainer>
      </div>

      <RecentActivity logs={logs.data?.items || []} title="آخرین رویدادهای سامانه" />

      {kpis.disputedReports > 0 && (
        <Link href="/deputy/reports" className="block rounded-card border border-rose-200 bg-rose-50 px-4 py-3 text-[12.5px] font-black text-rose-700 transition-colors hover:bg-rose-100">
          هشدار: {faDigits(kpis.disputedReports)} گزارش دارای اختلاف نیازمند رسیدگی است.
        </Link>
      )}
    </div>
  );
}

export default function DeputyHomePage() {
  return (
    <PanelPage role="DEPUTY">
      <DeputyHome />
    </PanelPage>
  );
}
