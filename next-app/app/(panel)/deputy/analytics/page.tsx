"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PanelPage } from "@/components/layout/panel-page";
import { apiFetch } from "@/lib/api-fetch";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ChartContainer } from "@/components/dashboard/chart-container";
import { TrendLineChart } from "@/components/charts/line-chart";
import { AmountAreaChart } from "@/components/charts/area-chart";
import { StatusPieChart } from "@/components/charts/pie-chart";
import { SimpleBarChart } from "@/components/charts/bar-chart";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { REPORT_STATUS_LABEL } from "@/types";

interface Analytics {
  trend: { day: string; count: number }[];
  statusDist: { status: string; count: number }[];
  groupDist: { name: string; count: number }[];
  companyPerf: { name: string; count: number; approved: number }[];
}

export default function AnalyticsPage() {
  const [days, setDays] = useState("14");
  const a = useQuery({ queryKey: ["analytics", days], queryFn: () => apiFetch<Analytics>(`/api/v1/analytics?days=${days}`) });

  return (
    <PanelPage role="DEPUTY">
      <PageHeader
        title="تحلیل‌ها و نمودارها"
        subtitle="روند گزارش‌ها، هزینه‌ها و عملکرد گروه‌ها و شرکت‌ها"
        actions={<SegmentedControl value={days} onChange={setDays} options={[{ value: "7", label: "۷ روز" }, { value: "14", label: "۱۴ روز" }, { value: "30", label: "۳۰ روز" }]} />}
      />
      {a.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} className="h-72 rounded-card" />)}</div>
      ) : a.isError || !a.data ? (
        <Card><ErrorState onRetry={() => a.refetch()} /></Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartContainer title="روند گزارش‌ها" data={a.data.trend}>
            <TrendLineChart data={a.data.trend} xKey="day" lines={[{ key: "count", color: "#2563EB", name: "گزارش" }]} height={300} />
          </ChartContainer>
          <ChartContainer title="روند هزینه‌ی تاییدشده" data={a.data.trend}>
            <AmountAreaChart data={a.data.trend.map((t) => ({ ...t, amount: t.amount * 42_000_000 }))} xKey="day" yKey="amount" height={300} />
          </ChartContainer>
          <ChartContainer title="توزیع وضعیت گزارش‌ها" data={a.data.statusDist.filter((s) => s.count > 0)}>
            <StatusPieChart data={a.data.statusDist.filter((s) => s.count > 0).map((s) => ({ name: REPORT_STATUS_LABEL[s.status as keyof typeof REPORT_STATUS_LABEL], value: s.count }))} height={300} />
          </ChartContainer>
          <ChartContainer title="توزیع گروه‌ها" data={a.data.groupDist}>
            <SimpleBarChart data={a.data.groupDist} xKey="name" yKey="count" height={300} colors={["#2563EB", "#16A34A", "#D97706", "#0891B2", "#7C3AED", "#DB2777"]} />
          </ChartContainer>
          <div className="lg:col-span-2">
            <ChartContainer title="عملکرد شرکت‌ها" subtitle="گزارش ثبت‌شده در بازه" data={a.data.companyPerf}>
              <SimpleBarChart data={a.data.companyPerf} xKey="name" yKey="count" height={280} />
            </ChartContainer>
          </div>
        </div>
      )}
    </PanelPage>
  );
}
