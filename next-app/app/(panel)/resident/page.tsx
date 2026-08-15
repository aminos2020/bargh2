"use client";
import { useQuery } from "@tanstack/react-query";
import { PackageSearch, ShoppingCart, CheckCircle2 } from "lucide-react";
import { PanelPage } from "@/components/layout/panel-page";
import { apiFetch } from "@/lib/api-fetch";
import type { ExtraWorkItem, Paginated, PurchaseRequest } from "@/types";
import { KpiGrid, type Kpi } from "@/components/dashboard/kpi-grid";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { CardSkeleton, LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { EXTRA_STATUS_FA } from "@/lib/labels";
import { faDigits } from "@/lib/amount";

function ResidentHome() {
  const extras = useQuery({ queryKey: ["extra-items", "home"], queryFn: () => apiFetch<ExtraWorkItem[]>("/api/v1/extra-items?limit=50") });
  const purchases = useQuery({ queryKey: ["purchases", "home"], queryFn: () => apiFetch<Paginated<PurchaseRequest>>("/api/v1/purchase-requests?limit=50") });

  if (extras.isLoading || purchases.isLoading) return <div className="space-y-4"><LoadingSkeleton className="h-8 w-64" /><CardSkeleton rows={3} /></div>;
  if (extras.isError) return <Card><ErrorState onRetry={() => extras.refetch()} /></Card>;

  const pendingExtras = (extras.data || []).filter((e) => e.status === "pending");
  const pendingPurchases = (purchases.data?.items || []).filter((p) => p.status === "submitted");
  const purchased = (purchases.data?.items || []).filter((p) => p.status === "purchased");

  const kpis: Kpi[] = [
    { label: "در انتظار معادل‌سازی", value: faDigits(pendingExtras.length), icon: <PackageSearch size={18} />, tone: pendingExtras.length ? "warn" : "ok", onClick: () => (location.href = "/resident/extra-items") },
    { label: "خریدهای در انتظار", value: faDigits(pendingPurchases.length), icon: <ShoppingCart size={18} />, tone: "cyan", onClick: () => (location.href = "/resident/purchase-requests") },
    { label: "خریداری‌شده", value: faDigits(purchased.length), icon: <CheckCircle2 size={18} />, tone: "teal", onClick: () => (location.href = "/resident/purchase-requests") },
  ];

  return (
    <div className="space-y-5">
      <div className="anim-fade-up">
        <h1 className="text-[22px] font-black text-ink-900">پنل نماینده مقیم</h1>
        <p className="mt-1 text-[12.5px] font-bold text-ink-400">معادل‌سازی کارهای اضافی و مدیریت خرید و تجهیز</p>
      </div>
      <KpiGrid kpis={kpis} cols={3} />
      <QuickActions actions={[
        { label: "معادل‌سازی کارهای اضافی", icon: PackageSearch, href: "/resident/extra-items", tone: "dark" },
        { label: "درخواست‌های خرید", icon: ShoppingCart, href: "/resident/purchase-requests" },
      ]} />
      <Card pad={false}>
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-[13px] font-black text-ink-700">آخرین خریدها</p>
        </div>
        {purchased.length === 0 ? (
          <p className="px-4 py-8 text-center text-[12.5px] font-bold text-ink-300">خریدی ثبت نشده است.</p>
        ) : (
          <div className="divide-y divide-line/70">
            {purchased.slice(0, 5).map((p) => (
              <div key={p._id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-black text-ink-900">{p.title}</p>
                  <p className="mt-0.5 text-[11px] font-bold text-ink-400">{p.requesterName}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
      {pendingExtras.length > 0 && (
        <Card pad={false}>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-[13px] font-black text-ink-700">در انتظار معادل‌سازی</p>
            <a href="/resident/extra-items" className="text-[11.5px] font-black text-primary-600">همه</a>
          </div>
          <div className="divide-y divide-line/70">
            {pendingExtras.slice(0, 4).map((e) => (
              <div key={e._id} className="flex items-center gap-3 px-4 py-3">
                <p className="min-w-0 flex-1 truncate text-[12.5px] font-bold text-ink-700">{e.description}</p>
                <StatusBadge status={e.status} meta={EXTRA_STATUS_FA[e.status]} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function ResidentHomePage() {
  return <PanelPage role="RESIDENT_REP"><ResidentHome /></PanelPage>;
}
