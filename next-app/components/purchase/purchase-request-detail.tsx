"use client";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { apiFetch, apiPost } from "@/lib/api-fetch";
import type { PurchaseRequest } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { formatRial, faDigits } from "@/lib/amount";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";

export function PurchaseRequestDetail({ id, backHref, canDecide, canMark }: { id: string; backHref: string; canDecide: boolean; canMark: boolean }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);
  const query = useQuery({ queryKey: ["purchase", id], queryFn: () => apiFetch<PurchaseRequest>(`/api/v1/purchase-requests/${id}`) });

  if (query.isLoading) return <LoadingSkeleton className="h-96 rounded-card" />;
  if (query.isError || !query.data) return <Card><ErrorState onRetry={() => query.refetch()} /></Card>;
  const p = query.data;

  const decide = async (action: "approved" | "rejected") => {
    if (action === "rejected" && !note.trim()) { toast("ثبت دلیل برای رد الزامی است.", "warn"); return; }
    setActing(true);
    try {
      await apiPost(`/api/v1/purchase-requests/${id}/decide`, { action, note });
      toast(action === "approved" ? "درخواست خرید تایید شد." : "درخواست رد شد.", "success");
      qc.invalidateQueries({ queryKey: ["purchase", id] });
    } catch (e) {
      toast(e instanceof Error ? e.message : "ناموفق بود.", "error");
    } finally {
      setActing(false);
    }
  };

  const markPurchased = async () => {
    setActing(true);
    try {
      await apiPost(`/api/v1/purchase-requests/${id}/purchased`, { note });
      toast("نتیجه خرید ثبت شد.", "success");
      qc.invalidateQueries({ queryKey: ["purchase", id] });
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
            <p className="text-[16px] font-black text-ink-900">{p.title}</p>
            <p className="mt-1 text-[12px] font-bold text-ink-400">درخواست‌دهنده: {p.requesterName}</p>
          </div>
          <StatusBadge status={p.status} />
        </div>
        <p className="mt-4 rounded-input bg-slate-50 px-4 py-3 text-[13px] font-bold leading-7 text-ink-700">{p.itemDescription}</p>
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-dashed border-line pt-4">
          <div><p className="text-[10.5px] font-black text-ink-300">تعداد</p><p className="tnum mt-1 text-[15px] font-black text-ink-900">{faDigits(p.quantity)}</p></div>
          <div><p className="text-[10.5px] font-black text-ink-300">برآورد قیمت</p><p className="tnum mt-1 text-[15px] font-black text-ink-900">{formatRial(p.estimatedPrice, false)}</p></div>
          <div><p className="text-[10.5px] font-black text-ink-300">اولویت</p><StatusBadge status={p.priority} className="mt-1" /></div>
        </div>
        {p.reason && <p className="mt-4 text-[12.5px] font-bold leading-7 text-ink-500">دلیل خرید: {p.reason}</p>}
        {p.decisionNote && <p className="mt-2 rounded-input bg-warn-50 px-4 py-2.5 text-[12px] font-bold text-warn-700">یادداشت تصمیم: {p.decisionNote}</p>}
      </Card>

      {((canDecide && p.status === "submitted") || (canMark && p.status === "approved")) && (
        <Card>
          <p className="mb-2.5 text-[12.5px] font-black text-ink-700">یادداشت تصمیم</p>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="یادداشت (برای رد الزامی)..." />
          <div className="mt-4 flex gap-2.5">
            {canDecide && p.status === "submitted" && (
              <>
                <Button variant="success" className="flex-1" loading={acting} onClick={() => decide("approved")}>تایید خرید</Button>
                <Button variant="dangerSoft" loading={acting} onClick={() => decide("rejected")}>رد</Button>
              </>
            )}
            {canMark && p.status === "approved" && (
              <Button variant="primary" className="flex-1" loading={acting} onClick={markPurchased}>ثبت نتیجه خرید</Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
