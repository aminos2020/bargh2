"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Building2, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import type { Company, Paginated } from "@/types";
import { SearchBar } from "@/components/ui/search-bar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { CompanyForm } from "@/components/forms/company-form";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { faDigits } from "@/lib/amount";

export function CompanyList() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const search = useDebouncedValue(q, 350);

  const query = useQuery({
    queryKey: ["companies", search, page],
    queryFn: () => apiFetch<Paginated<Company>>(`/api/v1/companies?limit=12&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`),
  });
  const list = query.data?.items || [];

  return (
    <div>
      <div className="mb-4 flex items-center gap-2.5">
        <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="جستجوی شرکت..." className="flex-1" />
        <Button icon={<Plus size={17} />} onClick={() => setCreateOpen(true)}>شرکت جدید</Button>
      </div>

      {query.isLoading ? (
        <CardSkeleton rows={4} />
      ) : query.isError ? (
        <Card><ErrorState onRetry={() => query.refetch()} /></Card>
      ) : list.length === 0 ? (
        <Card><EmptyState icon={<Building2 size={28} />} title="شرکتی ثبت نشده" body="اولین شرکت پیمانکار را به همراه رییس آن ایجاد کنید." action={<Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>افزودن شرکت</Button>} /></Card>
      ) : (
        <>
          <div className="stagger space-y-2.5">
            {list.map((c) => (
              <Card key={c._id} hover onClick={() => router.push(`/deputy/companies/${c._id}`)}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[14.5px] font-black text-ink-900">{c.name}</p>
                      <Badge className="border-line bg-slate-50 text-ink-400">{c.code}</Badge>
                    </div>
                    <p className="mt-1 text-[12px] font-bold text-ink-400">مسئول: {c.ceoName || "—"} — {faDigits(c.contractCount || 0)} قرارداد</p>
                  </div>
                  <Badge className={c.isActive ? "border-green-200 bg-ok-50 text-ok-700" : "border-red-200 bg-bad-50 text-bad-700"}>{c.isActive ? "فعال" : "غیرفعال"}</Badge>
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={page} hasNextPage={!!query.data?.hasNextPage} total={query.data?.total || 0} onPage={setPage} />
        </>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="ایجاد شرکت پیمانکار" wide>
        <CompanyForm onDone={() => setCreateOpen(false)} />
      </Modal>
    </div>
  );
}
