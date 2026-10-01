"use client";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Receipt } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import type { Paginated, Statement } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Pagination } from "@/components/ui/pagination";
import { formatRial } from "@/lib/amount";
import { useState } from "react";

export function StatementList({ basePath, canCreate }: { basePath: string; canCreate: boolean }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["statements", page],
    queryFn: () => apiFetch<Paginated<Statement>>(`/api/v1/statements?page=${page}&limit=12`),
  });
  const list = query.data?.items || [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-[12.5px] font-bold text-ink-400">صورت‌وضعیت‌های ثبت‌شده</p>
        {canCreate && <Button icon={<Plus size={17} />} onClick={() => router.push(`${basePath}/new`)}>صورت‌وضعیت جدید</Button>}
      </div>

      {query.isLoading ? (
        <CardSkeleton rows={3} />
      ) : query.isError ? (
        <Card><ErrorState onRetry={() => query.refetch()} /></Card>
      ) : list.length === 0 ? (
        <Card><EmptyState icon={<Receipt size={28} />} title="صورت‌وضعیتی نیست" body="از گزارش‌های تایید نهایی‌شده، صورت‌وضعیت بسازید." /></Card>
      ) : (
        <>
          <div className="stagger space-y-2.5">
            {list.map((s) => (
              <Card key={s._id} hover onClick={() => router.push(`${basePath}/${s._id}`)}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-black text-ink-900">{s.contractTitle}</p>
                    <p className="tnum mt-1 text-[11.5px] font-bold text-ink-400">بازه: {s.periodStart} تا {s.periodEnd} — {s.contractorName}</p>
                  </div>
                  <div className="shrink-0 text-left">
                    <StatusBadge status={s.status} />
                    <p className="tnum mt-1.5 text-[14px] font-black text-ink-900">{formatRial(s.totalAmount, false)} <span className="text-[10px] font-bold text-ink-300">ریال</span></p>
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
