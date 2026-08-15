"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import type { Contract, PriceItem } from "@/types";
import { CONTRACT_TYPE_LABEL } from "@/types";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRial, faDigits } from "@/lib/amount";

interface Detail extends Contract { priceItemCount: number; groupNames: string[]; samplePrices: PriceItem[]; }

export function ContractDetail({ id }: { id: string }) {
  const query = useQuery({ queryKey: ["contract", id], queryFn: () => apiFetch<Detail>(`/api/v1/contracts/${id}`) });
  if (query.isLoading) return <LoadingSkeleton className="h-96 rounded-card" />;
  if (query.isError || !query.data) return <Card><ErrorState onRetry={() => query.refetch()} /></Card>;
  const c = query.data;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/deputy/contracts" className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-black text-primary-600"><ArrowRight size={16} /> بازگشت</Link>

      <Card className="mb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[17px] font-black text-ink-900">{c.title}</p>
            <p className="mt-1 text-[12.5px] font-bold text-ink-400">{c.contractorName} — {CONTRACT_TYPE_LABEL[c.contractType]}</p>
          </div>
          <StatusBadge status={c.status} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-dashed border-line pt-4">
          <div><p className="text-[10.5px] font-black text-ink-300">تاریخ شروع</p><p className="tnum mt-1 text-[14px] font-black text-ink-900">{c.startDate}</p></div>
          <div><p className="text-[10.5px] font-black text-ink-300">تاریخ پایان</p><p className="tnum mt-1 text-[14px] font-black text-ink-900">{c.endDate}</p></div>
        </div>
        {c.publicNotes && <p className="mt-4 rounded-input bg-slate-50 px-4 py-3 text-[12.5px] font-bold leading-7 text-ink-500">{c.publicNotes}</p>}
        <div className="mt-4 flex items-start gap-2.5 rounded-input border border-amber-200 bg-warn-50 px-4 py-3">
          <ShieldAlert size={16} className="mt-0.5 shrink-0 text-warn-600" />
          <p className="text-[11.5px] font-bold leading-6 text-warn-700">اطلاعات محرمانه در سامانه ذخیره نمی‌شود؛ فقط اطلاعات عمومی قرارداد ثبت شده است.</p>
        </div>
      </Card>

      <Card className="mb-4">
        <p className="mb-3 text-[13px] font-black text-ink-700">گروه‌های این قرارداد</p>
        {c.groupNames.length === 0 ? <EmptyState title="گروهی متصل نیست" /> : (
          <div className="flex flex-wrap gap-2">{c.groupNames.map((g) => <span key={g} className="rounded-full bg-primary-50 px-4 py-2 text-[12.5px] font-black text-primary-700">{g}</span>)}</div>
        )}
      </Card>

      <Card>
        <p className="mb-3 text-[13px] font-black text-ink-700">فهرست بها ({faDigits(c.priceItemCount)} آیتم)</p>
        {c.samplePrices.length === 0 ? <EmptyState title="آیتمی ثبت نشده" /> : (
          <div className="divide-y divide-line/70">
            {c.samplePrices.map((p) => (
              <div key={p._id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-black text-ink-900">{p.title}</p>
                  <p className="text-[10.5px] font-bold text-ink-300">{p.code} — {p.unit}</p>
                </div>
                <span className="tnum shrink-0 text-[13px] font-black text-primary-700">{formatRial(p.unitPrice, false)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
