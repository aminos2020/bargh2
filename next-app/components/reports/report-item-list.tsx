"use client";
import type { ReportItem } from "@/types";
import { formatRial, faDigits } from "@/lib/amount";
import { StatusBadge } from "@/components/ui/status-badge";

export function ReportItemList({ items }: { items: ReportItem[] }) {
  if (items.length === 0) return <p className="py-4 text-center text-[12.5px] font-bold text-ink-300">آیتمی ثبت نشده است.</p>;
  return (
    <div className="space-y-2.5">
      {items.map((it, i) => (
        <div key={it._id} className="anim-fade-up rounded-input border border-line bg-white p-3.5" style={{ animationDelay: `${i * 40}ms` }}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[13.5px] font-black text-ink-900">{it.titleSnapshot}</p>
              <p className="tnum mt-0.5 text-[11.5px] font-bold text-ink-400">
                {formatRial(it.unitPriceSnapshot, false)} ریال / {it.unitSnapshot} × {faDigits(it.quantity)}
              </p>
            </div>
            <StatusBadge status={it.status} />
          </div>
          <div className="mt-2.5 flex items-center justify-between border-t border-dashed border-line pt-2.5">
            <span className="text-[11px] font-black text-ink-300">مبلغ کل</span>
            <span className="tnum text-[14.5px] font-black text-primary-700">{formatRial(it.totalAmount)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
