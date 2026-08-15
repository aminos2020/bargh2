"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Boxes, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import type { PriceItem } from "@/types";
import { SearchBar } from "@/components/ui/search-bar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { formatRial } from "@/lib/amount";
import { useMobile } from "@/hooks/use-mobile";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { PriceItemForm } from "@/components/forms/price-item-form";
import { usePermissions } from "@/hooks/use-permissions";

export function PriceItemList() {
  const [q, setQ] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const mobile = useMobile();
  const search = useDebouncedValue(q, 300);
  const { is } = usePermissions();
  const canManage = is("CONTRACTOR_CEO");

  const query = useQuery({
    queryKey: ["price-items", search],
    queryFn: () => apiFetch<PriceItem[]>(`/api/v1/price-items?limit=100${search ? `&search=${encodeURIComponent(search)}` : ""}`),
  });
  const list = query.data || [];
  const Wrap = mobile ? BottomSheet : Modal;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2.5">
        <SearchBar value={q} onChange={setQ} placeholder="جستجوی کد یا عنوان آیتم..." className="flex-1" />
        {canManage && <Button icon={<Plus size={17} />} onClick={() => setCreateOpen(true)}>آیتم جدید</Button>}
      </div>

      {query.isLoading ? (
        <CardSkeleton rows={4} />
      ) : query.isError ? (
        <Card><ErrorState onRetry={() => query.refetch()} /></Card>
      ) : list.length === 0 ? (
        <Card><EmptyState icon={<Boxes size={28} />} title="آیتمی یافت نشد" body="آیتم جدیدی به فهرست بها اضافه کنید." /></Card>
      ) : (
        <div className="stagger space-y-2.5">
          {list.map((p) => (
            <Card key={p._id}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14px] font-black text-ink-900">{p.title}</p>
                    <Badge className="border-line bg-slate-50 text-ink-400">{p.code}</Badge>
                    {!p.isActive && <Badge className="border-red-200 bg-bad-50 text-bad-700">غیرفعال</Badge>}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {(p.groupNames || []).map((g) => (
                      <span key={g} className="rounded-full bg-primary-50 px-2.5 py-0.5 text-[10.5px] font-black text-primary-600">{g}</span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 text-left">
                  <p className="tnum text-[15px] font-black text-ink-900">{formatRial(p.unitPrice, false)}</p>
                  <p className="text-[10.5px] font-bold text-ink-300">ریال / {p.unit}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Wrap open={createOpen} onClose={() => setCreateOpen(false)} title="افزودن آیتم به فهرست بها">
        <PriceItemForm onDone={() => setCreateOpen(false)} />
      </Wrap>
    </div>
  );
}
