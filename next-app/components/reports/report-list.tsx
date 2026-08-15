"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, Download } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import type { Paginated, WorkReport } from "@/types";
import { Tabs } from "@/components/ui/tabs";
import { SearchBar } from "@/components/ui/search-bar";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { formatRial, faDigits } from "@/lib/amount";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { downloadCSV } from "@/lib/csv-client";

interface Props {
  title: string;
  subtitle?: string;
  detailHref: (id: string) => string;
  queueStatuses?: string[];
  scopeParam?: string;
  exportable?: boolean;
}

export function ReportList({ title, subtitle, detailHref, queueStatuses, scopeParam = "", exportable }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const search = useDebouncedValue(q, 350);

  const qs = useMemo(() => {
    const p = new URLSearchParams({ page: String(page), limit: "12" });
    if (search) p.set("search", search);
    if (tab === "queue" && queueStatuses?.length) p.set("statuses", queueStatuses.join(","));
    if (tab === "approved") p.set("statuses", "approved,settled");
    if (tab === "failed") p.set("statuses", "rejected,redo_requested,disputed");
    if (scopeParam) p.set("scope", scopeParam);
    return p.toString();
  }, [page, search, tab, queueStatuses, scopeParam]);

  const query = useQuery({
    queryKey: ["reports", qs],
    queryFn: () => apiFetch<Paginated<WorkReport>>(`/api/v1/reports?${qs}`),
  });

  const list = query.data?.items || [];

  const exportCsv = () => {
    downloadCSV(
      "gozaresh-ha.csv",
      ["ردیف", "نیرو", "گروه", "تاریخ", "مبلغ (ریال)", "وضعیت", "تعداد آیتم"],
      list.map((r, i) => [i + 1, r.userName || "", r.groupName || "", r.reportDateJ, r.totalAmount || 0, r.status, r.itemCount || 0])
    );
  };

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={exportable ? <Button variant="outline" size="sm" icon={<Download size={15} />} onClick={exportCsv}>خروجی CSV</Button> : undefined}
      />
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <Tabs
          className="md:w-auto"
          value={tab}
          onChange={(t) => { setTab(t); setPage(1); }}
          tabs={[
            ...(queueStatuses?.length ? [{ key: "queue", label: "در انتظار من" }] : []),
            { key: "all", label: "همه" },
            { key: "approved", label: "تایید نهایی" },
            { key: "failed", label: "رد / مجدد / اختلاف" },
          ]}
        />
        <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="جستجوی نیرو یا گروه..." className="flex-1" />
      </div>

      {query.isLoading ? (
        <CardSkeleton rows={4} />
      ) : query.isError ? (
        <Card><ErrorState onRetry={() => query.refetch()} /></Card>
      ) : list.length === 0 ? (
        <Card><EmptyState icon={<ClipboardCheck size={28} />} title="گزارشی یافت نشد" body={tab === "queue" ? "در حال حاضر گزارشی در نوبت بررسی شما نیست." : "با این فیلترها گزارشی وجود ندارد."} /></Card>
      ) : (
        <>
          <div className="stagger space-y-2.5">
            {list.map((r) => (
              <Card key={r._id} hover onClick={() => router.push(detailHref(r._id))}>
                <div className="flex items-center gap-3">
                  <Avatar name={r.userName} size={42} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-black text-ink-900">{r.userName}</p>
                    <p className="mt-0.5 truncate text-[11.5px] font-bold text-ink-400">{r.groupName} — {r.reportDateJ}</p>
                  </div>
                  <div className="shrink-0 text-left">
                    <StatusBadge status={r.status} />
                    <p className="tnum mt-1.5 text-[13px] font-black text-ink-800">{formatRial(r.totalAmount || 0, false)} <span className="text-[10px] font-bold text-ink-300">ریال</span></p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={page} hasNextPage={!!query.data?.hasNextPage} total={query.data?.total || 0} onPage={setPage} />
          <p className="mt-2 text-center text-[10.5px] font-bold text-ink-300">{faDigits(list.length)} گزارش در این صفحه</p>
        </>
      )}
    </div>
  );
}
