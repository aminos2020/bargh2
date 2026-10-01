"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPost } from "@/lib/api-fetch";
import type { ExtraWorkItem, PriceItem } from "@/types";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { NumberStepper } from "@/components/ui/number-stepper";
import { useToast } from "@/components/ui/toast";
import { useMobile } from "@/hooks/use-mobile";
import { formatRial } from "@/lib/amount";

/** معادل‌سازی کار اضافی با آیتم فهرست بها — فقط نقش‌های مجاز (نماینده مقیم) */
export function ExtraItemMapper({ item, onClose }: { item: ExtraWorkItem; onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const mobile = useMobile();
  const [priceItemId, setPriceItemId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const pricesQ = useQuery({ queryKey: ["price-items", "all"], queryFn: () => apiFetch<PriceItem[]>("/api/v1/price-items?limit=200") });
  const prices = pricesQ.data || [];
  const selected = prices.find((p) => p._id === priceItemId);

  const map = async () => {
    if (!priceItemId) { toast("آیتم معادل را انتخاب کنید.", "warn"); return; }
    setSaving(true);
    try {
      await apiPost(`/api/v1/extra-items/${item._id}/map`, { priceItemId, quantity, note });
      toast("کار اضافی معادل‌سازی شد و در صورت‌وضعیت محاسبه می‌شود.", "success");
      qc.invalidateQueries({ queryKey: ["extra-items"] });
      onClose();
    } catch (e) {
      toast(e instanceof Error ? e.message : "ناموفق بود.", "error");
    } finally {
      setSaving(false);
    }
  };

  const reject = async () => {
    setSaving(true);
    try {
      await apiPost(`/api/v1/extra-items/${item._id}/reject`, { note });
      toast("کار اضافی رد شد.", "success");
      qc.invalidateQueries({ queryKey: ["extra-items"] });
      onClose();
    } catch (e) {
      toast(e instanceof Error ? e.message : "ناموفق بود.", "error");
    } finally {
      setSaving(false);
    }
  };

  const Wrap = mobile ? BottomSheet : Modal;
  return (
    <Wrap open onClose={onClose} title="معادل‌سازی کار اضافی">
      <p className="mb-4 rounded-input bg-slate-50 px-4 py-3 text-[13px] font-bold leading-7 text-ink-700">{item.description}</p>
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-[12.5px] font-black text-ink-700">آیتم معادل از فهرست بها</p>
          <Select value={priceItemId} onChange={setPriceItemId} placeholder="انتخاب آیتم"
            options={prices.map((p) => ({ value: p._id, label: `${p.title} — ${formatRial(p.unitPrice, false)} / ${p.unit}` }))} />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[12.5px] font-black text-ink-700">تعداد</p>
          <NumberStepper value={quantity} onChange={setQuantity} min={1} large />
        </div>
        {selected && (
          <p className="tnum rounded-input bg-primary-50 px-4 py-3 text-[13.5px] font-black text-primary-700">
            مبلغ محاسبه‌شده: {formatRial(selected.unitPrice * quantity)}
          </p>
        )}
        <div>
          <p className="mb-1.5 text-[12.5px] font-black text-ink-700">یادداشت</p>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="توضیح معادل‌سازی..." />
        </div>
        <div className="flex gap-2.5">
          <Button className="flex-1" size="lg" loading={saving} onClick={map}>تایید معادل‌سازی</Button>
          <Button variant="dangerSoft" size="lg" loading={saving} onClick={reject}>رد</Button>
        </div>
      </div>
    </Wrap>
  );
}
