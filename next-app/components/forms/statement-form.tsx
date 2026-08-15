"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPost } from "@/lib/api-fetch";
import { useToast } from "@/components/ui/toast";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DateRangePickerJalali } from "@/components/ui/date-range-picker-jalali";
import { formatRial, faDigits } from "@/lib/amount";
import { jalaliKey, toJalali } from "@/lib/date";
import { useState } from "react";
import type { Contract } from "@/types";

/** پیش‌نمایش گزارش‌های تایید نهایی بازه + ساخت صورت‌وضعیت */
export function StatementForm() {
  const toast = useToast();
  const qc = useQueryClient();
  const [contractId, setContractId] = useState("");
  const d = new Date();
  d.setDate(d.getDate() - 29);
  const [from, setFrom] = useState(jalaliKey(toJalali(d)));
  const [to, setTo] = useState(jalaliKey());
  const [saving, setSaving] = useState(false);

  const contractsQ = useQuery({ queryKey: ["contracts"], queryFn: () => apiFetch<{ items: Contract[] }>("/api/v1/contracts?limit=100") });
  const previewQ = useQuery({
    queryKey: ["statement-preview", contractId, from, to],
    queryFn: () => apiFetch<{ reportCount: number; totalAmount: number; byGroup: { name: string; amount: number; count: number }[] }>(
      `/api/v1/statements/preview?contractId=${contractId}&from=${from}&to=${to}`
    ),
    enabled: !!contractId,
  });

  const create = async () => {
    if (!contractId) { toast("قرارداد را انتخاب کنید.", "warn"); return; }
    setSaving(true);
    try {
      await apiPost("/api/v1/statements", { contractId, periodStart: from, periodEnd: to });
      toast("صورت‌وضعیت ساخته و برای معاونت ارسال شد.", "success");
      qc.invalidateQueries({ queryKey: ["statements"] });
    } catch (e) {
      toast(e instanceof Error ? e.message : "ساخت صورت‌وضعیت ناموفق بود.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-[12.5px] font-black text-ink-700">قرارداد</p>
            <Select value={contractId} onChange={setContractId} placeholder="انتخاب قرارداد"
              options={(contractsQ.data?.items || []).map((c) => ({ value: c._id, label: c.title }))} />
          </div>
          <div>
            <p className="mb-1.5 text-[12.5px] font-black text-ink-700">بازه (شمسی)</p>
            <DateRangePickerJalali from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />
          </div>
        </div>
      </Card>

      {contractId && (
        <Card>
          <p className="mb-3 text-[13px] font-black text-ink-700">گزارش‌های تایید نهایی بازه</p>
          {previewQ.isLoading ? (
            <div className="skeleton h-24 rounded-input" />
          ) : previewQ.data ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-input bg-primary-50/70 p-4">
                  <p className="text-[11px] font-black text-primary-600">تعداد گزارش</p>
                  <p className="tnum mt-1 text-[22px] font-black text-ink-900">{faDigits(previewQ.data.reportCount)}</p>
                </div>
                <div className="rounded-input bg-ok-50 p-4">
                  <p className="text-[11px] font-black text-ok-700">جمع مبلغ (ریال)</p>
                  <p className="tnum mt-1 text-[19px] font-black text-ink-900">{formatRial(previewQ.data.totalAmount, false)}</p>
                </div>
              </div>
              {previewQ.data.byGroup.length > 0 && (
                <div className="mt-4 space-y-2">
                  {previewQ.data.byGroup.map((g) => (
                    <div key={g.name} className="flex items-center justify-between rounded-input border border-line px-4 py-2.5">
                      <span className="text-[12.5px] font-black text-ink-700">{g.name} <span className="text-ink-300">({faDigits(g.count)} گزارش)</span></span>
                      <span className="tnum text-[13px] font-black text-primary-700">{formatRial(g.amount, false)}</span>
                    </div>
                  ))}
                </div>
              )}
              {previewQ.data.reportCount === 0 && (
                <p className="mt-3 rounded-input bg-slate-50 px-4 py-3 text-[12.5px] font-bold text-ink-400">در این بازه گزارش تایید نهایی‌شده‌ای وجود ندارد.</p>
              )}
              <Button full size="lg" className="mt-4" disabled={previewQ.data.reportCount === 0} loading={saving} onClick={create}>
                ساخت و ارسال صورت‌وضعیت
              </Button>
            </>
          ) : null}
        </Card>
      )}
    </div>
  );
}
