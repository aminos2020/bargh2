"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PackageSearch } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import type { ExtraWorkItem } from "@/types";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { EXTRA_STATUS_FA } from "@/lib/labels";
import { ExtraItemMapper } from "./extra-item-mapper";
import { faDigits } from "@/lib/amount";

export function ExtraItemList() {
  const [tab, setTab] = useState("pending");
  const [mapping, setMapping] = useState<ExtraWorkItem | null>(null);
  const query = useQuery({
    queryKey: ["extra-items", tab],
    queryFn: () => apiFetch<ExtraWorkItem[]>(`/api/v1/extra-items?status=${tab === "all" ? "" : tab}&limit=50`),
  });
  const list = query.data || [];

  return (
    <div>
      <Tabs className="mb-4" value={tab} onChange={setTab} tabs={[
        { key: "pending", label: "در انتظار معادل‌سازی" }, { key: "mapped", label: "معادل‌سازی‌شده" }, { key: "all", label: "همه" },
      ]} />

      {query.isLoading ? (
        <CardSkeleton rows={3} />
      ) : query.isError ? (
        <Card><ErrorState onRetry={() => query.refetch()} /></Card>
      ) : list.length === 0 ? (
        <Card><EmptyState icon={<PackageSearch size={28} />} title="کار اضافی‌ای نیست" body="کارهای اضافی تکنسین‌ها اینجا برای معادل‌سازی نمایش داده می‌شوند." /></Card>
      ) : (
        <div className="stagger space-y-2.5">
          {list.map((ex) => (
            <Card key={ex._id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-black leading-7 text-ink-900">{ex.description}</p>
                  <p className="mt-1 text-[11.5px] font-bold text-ink-400">
                    {ex.technicianName} — {ex.groupName} — {ex.reportDateJ}
                  </p>
                </div>
                <StatusBadge status={ex.status} meta={EXTRA_STATUS_FA[ex.status]} />
              </div>
              {ex.status === "pending" && (
                <Button variant="soft" size="sm" className="mt-3" onClick={() => setMapping(ex)}>معادل‌سازی با فهرست بها</Button>
              )}
            </Card>
          ))}
          <p className="pt-1 text-center text-[10.5px] font-bold text-ink-300">{faDigits(list.length)} مورد</p>
        </div>
      )}

      {mapping && <ExtraItemMapper item={mapping} onClose={() => setMapping(null)} />}
    </div>
  );
}
