"use client";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { apiFetch, apiPost } from "@/lib/api-fetch";
import type { Statement, WorkReport } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { formatRial, faDigits } from "@/lib/amount";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";

interface Detail extends Statement { reports: WorkReport[]; }

export function StatementDetail({ id, backHref, canDecide }: { id: string; backHref: string; canDecide: boolean }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [acting, setActing] = useState(false);
  const query = useQuery({ queryKey: ["statement", id], queryFn: () => apiFetch<Detail>(`/api/v1/statements/${id}`) });

  if (query.isLoading) return <LoadingSkeleton className="h-96 rounded-card" />;
  if (query.isError || !query.data) return <Card><ErrorState onRetry={() => query.refetch()} /></Card>;
  const s = query.data;

  const decide = async (action: "approved" | "rejected" | "paid") => {
    setActing(true);
    try {
      await apiPost(`/api/v1/statements/${id}/decide`, { action });
      toast(action === "rejected" ? "صورت‌وضعیت رد شد." : "وضعیت صورت‌وضعیت به‌روزرسانی شد.", "success");
      qc.invalidateQueries({ queryKey: ["statement", id] });
    } catch (e) {
      toast(e instanceof Error ? e.message : "ناموفق بود.", "error");
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={backHref} className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-black text-primary-600"><ArrowRight size={16} /> بازگشت</Link>

      <Card className="mb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[16px] font-black text-ink-900">{s.contractTitle}</p>
            <p className="tnum mt-1 text-[12px] font-bold text-ink-400">{s.contractorName} — بازه: {s.periodStart} تا {s.periodEnd}</p>
          </div>
          <StatusBadge status={s.status} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-dashed border-line pt-4">
          <div>
            <p className="text-[10.5px] font-black text-ink-300">تعداد گزارش</p>
            <p className="tnum mt-1 text-[18px] font-black text-ink-900">{faDigits(s.reportIds.length)}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-black text-ink-300">جمع کل (ریال)</p>
            <p className="tnum mt-1 text-[18px] font-black text-primary-700">{formatRial(s.totalAmount, false)}</p>
          </div>
        </div>
        {s.decisionNote && <p className="mt-4 rounded-input bg-slate-50 px-4 py-3 text-[12.5px] font-bold text-ink-500">یادداشت: {s.decisionNote}</p>}
      </Card>

      <Card className="mb-4">
        <p className="mb-3 text-[13px] font-black text-ink-700">گزارش‌های مشمول</p>
        <div className="divide-y divide-line/70">
          {s.reports.map((r) => (
            <div key={r._id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-black text-ink-800">{r.userName} — {r.groupName}</p>
                <p className="tnum text-[11px] font-bold text-ink-400">{r.reportDateJ}</p>
              </div>
              <span className="tnum shrink-0 text-[12.5px] font-black text-ink-700">{formatRial(r.totalAmount || 0, false)}</span>
            </div>
          ))}
        </div>
      </Card>

      {canDecide && (s.status === "submitted" || s.status === "approved") && (
        <div className="flex gap-2.5">
          {s.status === "submitted" && <Button variant="success" size="lg" className="flex-1" loading={acting} onClick={() => decide("approved")}>تایید صورت‌وضعیت</Button>}
          {s.status === "approved" && <Button variant="primary" size="lg" className="flex-1" loading={acting} onClick={() => decide("paid")}>ثبت پرداخت</Button>}
          {s.status === "submitted" && <Button variant="dangerSoft" size="lg" loading={acting} onClick={() => decide("rejected")}>رد</Button>}
        </div>
      )}
    </div>
  );
}
