"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import type { AuditLog, Paginated } from "@/types";
import { SearchBar } from "@/components/ui/search-bar";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Pagination } from "@/components/ui/pagination";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { relativeTimeFa } from "@/lib/date-client";

const ENTITY_FA: Record<string, string> = {
  report: "گزارش", user: "کاربر", company: "شرکت", contract: "قرارداد", group: "گروه",
  price: "آحاد بها", statement: "صورت‌وضعیت", purchase: "خرید", extra: "کار اضافی", task: "کار",
};

export function ActivityLogList() {
  const [q, setQ] = useState("");
  const [entity, setEntity] = useState("");
  const [page, setPage] = useState(1);
  const search = useDebouncedValue(q, 350);

  const query = useQuery({
    queryKey: ["activity", search, entity, page],
    queryFn: () => apiFetch<Paginated<AuditLog>>(`/api/v1/activity-logs?page=${page}&limit=20${search ? `&search=${encodeURIComponent(search)}` : ""}${entity ? `&entity=${entity}` : ""}`),
  });
  const list = query.data?.items || [];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="جستجو در رویدادها..." className="min-w-52 flex-1" />
        <Select value={entity} onChange={(v) => { setEntity(v); setPage(1); }} placeholder="همه موجودیت‌ها" className="h-11 w-44"
          options={Object.entries(ENTITY_FA).map(([k, v]) => ({ value: k, label: v }))} />
      </div>

      {query.isLoading ? (
        <CardSkeleton rows={5} />
      ) : query.isError ? (
        <Card><ErrorState onRetry={() => query.refetch()} /></Card>
      ) : list.length === 0 ? (
        <Card><EmptyState icon={<History size={28} />} title="رویدادی ثبت نشده" /></Card>
      ) : (
        <>
          <Card pad={false}>
            <div className="divide-y divide-line/70">
              {list.map((l) => (
                <div key={l._id} className="flex items-start gap-3 px-4 py-3.5">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13px] font-black text-ink-800">{l.action}</p>
                      <Badge className="border-line bg-slate-50 text-ink-400">{ENTITY_FA[l.entity] || l.entity}</Badge>
                    </div>
                    <p className="mt-0.5 text-[11.5px] font-bold text-ink-400">{l.actorName || "—"}{l.detail ? ` — ${l.detail}` : ""}</p>
                  </div>
                  <span className="shrink-0 text-[10.5px] font-bold text-ink-300">{relativeTimeFa(l.createdAt)}</span>
                </div>
              ))}
            </div>
          </Card>
          <Pagination page={page} hasNextPage={!!query.data?.hasNextPage} total={query.data?.total || 0} onPage={setPage} />
        </>
      )}
    </div>
  );
}
