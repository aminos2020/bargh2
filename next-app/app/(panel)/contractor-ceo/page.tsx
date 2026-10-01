"use client";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock3, FileText, Receipt, Users, Wallet, XCircle } from "lucide-react";
import { PanelPage } from "@/components/layout/panel-page";
import { apiFetch } from "@/lib/api-fetch";
import type { Paginated, WorkReport } from "@/types";
import { KpiGrid, type Kpi } from "@/components/dashboard/kpi-grid";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ChartContainer } from "@/components/dashboard/chart-container";
import { TrendLineChart } from "@/components/charts/line-chart";
import { SimpleBarChart } from "@/components/charts/bar-chart";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { CardSkeleton, LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { compactRial, faDigits } from "@/lib/amount";
import { jalaliKey, toJalali, todayJalaliStr } from "@/lib/date";

function ContractorHome() {
  const q = useQuery({ queryKey: ["reports", "contractor-home"], queryFn: () => apiFetch<Paginated<WorkReport>>("/api/v1/reports?limit=100") });
  if (q.isLoading) return <div className="space-y-4"><LoadingSkeleton className="h-8 w-64" /><CardSkeleton rows={4} /></div>;
  if (q.isError || !q.data) return <Card><ErrorState onRetry={() => q.refetch()} /></Card>;
  const reports = q.data.items;
  const today = todayJalaliStr();
  const approved = reports.filter((r) => r.status === "approved" || r.status === "settled");
  const approvedAmount = approved.reduce((s, r) => s + (r.totalAmount || 0), 0);
  const pending = reports.filter((r) => ["supervisor_review", "expert_review", "employer_ceo_review"].includes(r.status));
  const rejected = reports.filter((r) => r.status === "rejected");

  const days: { day: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = jalaliKey(toJalali(d));
    days.push({ day: key.slice(5), count: reports.filter((r) => r.reportDateJ === key).length });
  }
  const byGroup = [...new Map(reports.filter((r) => r.groupName).map((r) => [r.groupName!, (0)])).keys()].map((name) => ({
    name, count: reports.filter((r) => r.groupName === name).length,
  }));

  const kpis: Kpi[] = [
    { label: "گزارش‌های امروز", value: faDigits(reports.filter((r) => r.reportDateJ === today).length), icon: <FileText size={18} />, tone: "primary", onClick: () => (location.href = "/contractor-ceo/reports") },
    { label: "در انتظار", value: faDigits(pending.length), icon: <Clock3 size={18} />, tone: "warn", onClick: () => (location.href = "/contractor-ceo/reports") },
    { label: "تایید نهایی", value: faDigits(approved.length), icon: <CheckCircle2 size={18} />, tone: "ok", onClick: () => (location.href = "/contractor-ceo/statements") },
    { label: "رد شده", value: faDigits(rejected.length), icon: <XCircle size={18} />, tone: rejected.length ? "bad" : "primary", onClick: () => (location.href = "/contractor-ceo/reports") },
    { label: "جمع تاییدشده", value: compactRial(approvedAmount), icon: <Wallet size={18} />, tone: "teal", onClick: () => (location.href = "/contractor-ceo/statements") },
    { label: "نیروها و گروه‌ها", value: "مدیریت", icon: <Users size={18} />, tone: "dark", onClick: () => (location.href = "/contractor-ceo/personnel") },
  ];

  return (
    <div className="space-y-5">
      <div className="anim-fade-up">
        <h1 className="text-[22px] font-black text-ink-900">داشبورد شرکت</h1>
        <p className="mt-1 text-[12.5px] font-bold text-ink-400">فعالیت نیروها، گزارش‌ها و مبالغ تاییدشده</p>
      </div>
      <KpiGrid kpis={kpis} cols={3} />
      <QuickActions actions={[
        { label: "نیروی جدید", icon: Users, href: "/contractor-ceo/personnel" },
        { label: "فهرست بها", icon: FileText, href: "/contractor-ceo/price-list" },
        { label: "صورت‌وضعیت جدید", icon: Receipt, href: "/contractor-ceo/statements/new", tone: "dark" },
      ]} />
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartContainer title="روند گزارش‌های شرکت" data={days}>
          <TrendLineChart data={days} xKey="day" lines={[{ key: "count", color: "#2563EB", name: "گزارش" }]} />
        </ChartContainer>
        <ChartContainer title="توزیع گروه‌ها" data={byGroup}>
          <SimpleBarChart data={byGroup} xKey="name" yKey="count" colors={["#2563EB", "#16A34A", "#D97706", "#0891B2"]} />
        </ChartContainer>
      </div>
    </div>
  );
}

export default function ContractorHomePage() {
  return <PanelPage role="CONTRACTOR_CEO"><ContractorHome /></PanelPage>;
}
