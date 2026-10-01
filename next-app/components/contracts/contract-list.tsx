"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FileSignature, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import type { Contract, Paginated } from "@/types";
import { CONTRACT_TYPE_LABEL } from "@/types";
import { SearchBar } from "@/components/ui/search-bar";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Pagination } from "@/components/ui/pagination";
import { ContractForm } from "@/components/forms/contract-form";
import { useDebouncedValue } from "@/hooks/use-debounce";

export function ContractList() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const search = useDebouncedValue(q, 350);

  const query = useQuery({
    queryKey: ["contracts", search, status, page],
    queryFn: () => apiFetch<Paginated<Contract>>(`/api/v1/contracts?limit=12&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${status ? `&status=${status}` : ""}`),
  });
  const list = query.data?.items || [];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="جستجوی قرارداد..." className="min-w-52 flex-1" />
        <Select value={status} onChange={setStatus} placeholder="همه وضعیت‌ها" className="h-11 w-40"
          options={[{ value: "active", label: "فعال" }, { value: "completed", label: "تکمیل‌شده" }, { value: "terminated", label: "خاتمه‌یافته" }]} />
        <Button icon={<Plus size={17} />} onClick={() => setCreateOpen(true)}>قرارداد جدید</Button>
      </div>

      {query.isLoading ? (
        <CardSkeleton rows={4} />
      ) : query.isError ? (
        <Card><ErrorState onRetry={() => query.refetch()} /></Card>
      ) : list.length === 0 ? (
        <Card><EmptyState icon={<FileSignature size={28} />} title="قراردادی یافت نشد" body="قرارداد جدیدی با اطلاعات عمومی ثبت کنید." action={<Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>ثبت قرارداد</Button>} /></Card>
      ) : (
        <>
          <div className="stagger space-y-2.5">
            {list.map((ct) => (
              <Card key={ct._id} hover onClick={() => router.push(`/deputy/contracts/${ct._id}`)}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-black text-ink-900">{ct.title}</p>
                    <p className="mt-1 text-[12px] font-bold text-ink-400">
                      {ct.contractorName} — {CONTRACT_TYPE_LABEL[ct.contractType]} — <span className="tnum">{ct.startDate} تا {ct.endDate}</span>
                    </p>
                  </div>
                  <StatusBadge status={ct.status} />
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={page} hasNextPage={!!query.data?.hasNextPage} total={query.data?.total || 0} onPage={setPage} />
        </>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="ثبت قرارداد" wide>
        <ContractForm onDone={() => setCreateOpen(false)} />
      </Modal>
    </div>
  );
}
