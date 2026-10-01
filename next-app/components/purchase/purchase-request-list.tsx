"use client";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, ShoppingCart } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import type { Paginated, PurchaseRequest } from "@/types";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Pagination } from "@/components/ui/pagination";
import { formatRial } from "@/lib/amount";
import { useState } from "react";

export function PurchaseRequestList({ basePath, canCreate, detailBase }: { basePath: string; canCreate: boolean; detailBase: string }) {
  const router = useRouter();
  const [tab, setTab] = useState("submitted");
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["purchases", tab, page],
    queryFn: () => apiFetch<Paginated<PurchaseRequest>>(`/api/v1/purchase-requests?status=${tab === "all" ? "" : tab}&page=${page}&limit=12`),
  });
  const list = query.data?.items || [];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <Tabs value={tab} onChange={(t) => { setTab(t); setPage(1); }} tabs={[
          { key: "submitted", label: "در انتظار تصمیم" }, { key: "approved", label: "تاییدشده" }, { key: "purchased", label: "خریداری‌شده" }, { key: "all", label: "همه" },
        ]} />
        {canCreate && <Button icon={<Plus size={17} />} onClick={() => router.push(`${basePath}/new`)}>درخواست جدید</Button>}
      </div>

      {query.isLoading ? (
        <CardSkeleton rows={3} />
      ) : query.isError ? (
        <Card><ErrorState onRetry={() => query.refetch()} /></Card>
      ) : list.length === 0 ? (
        <Card><EmptyState icon={<ShoppingCart size={28} />} title="درخواستی نیست" /></Card>
      ) : (
        <>
          <div className="stagger space-y-2.5">
            {list.map((p) => (
              <Card key={p._id} hover onClick={() => router.push(`${detailBase}/${p._id}`)}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-black text-ink-900">{p.title}</p>
                    <p className="mt-1 truncate text-[11.5px] font-bold text-ink-400">{p.requesterName} — {p.itemDescription}</p>
                  </div>
                  <div className="shrink-0 text-left">
                    <StatusBadge status={p.status} />
                    <p className="tnum mt-1.5 text-[13px] font-black text-ink-800">{formatRial(p.estimatedPrice, false)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={page} hasNextPage={!!query.data?.hasNextPage} total={query.data?.total || 0} onPage={setPage} />
        </>
      )}
    </div>
  );
}
