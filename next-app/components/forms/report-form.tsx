"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ListPlus, PackageSearch, Plus, Send, Trash2, UploadCloud } from "lucide-react";
import { apiFetch, apiPost } from "@/lib/api-fetch";
import { useAuthStore } from "@/stores/auth-store";
import { useOffline } from "@/hooks/use-offline";
import { useSyncStore } from "@/stores/sync-store";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select";
import { NumberStepper } from "@/components/ui/number-stepper";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { SearchBar } from "@/components/ui/search-bar";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { FileUploader, type PickedImage } from "@/components/ui/file-uploader";
import { ImagePreviewGallery } from "@/components/ui/image-preview-gallery";
import { formatRial } from "@/lib/amount";
import { faDigits } from "@/lib/amount";
import type { PriceItem, WorkGroup } from "@/types";

/**
 * فرم ثبت گزارش کار — local-first:
 * پیش‌نویس در localStorage، ارسال آفلاین به SyncQueue، آنلاین مستقیم به API.
 */
export function ReportForm({ backHref }: { backHref: string }) {
  const me = useAuthStore((s) => s.me);
  const { online } = useOffline();
  const toast = useToast();
  const router = useRouter();
  const enqueue = useSyncStore((s) => s.enqueue);

  const groupsQ = useQuery({ queryKey: ["my-groups"], queryFn: () => apiFetch<WorkGroup[]>("/api/v1/groups?mine=1"), enabled: !!me });
  const groups = groupsQ.data || [];

  const [groupId, setGroupId] = useState("");
  const [onBehalf, setOnBehalf] = useState("");
  const [items, setItems] = useState<{ priceItemId: string; quantity: number }[]>([]);
  const [extras, setExtras] = useState<string[]>([]);
  const [extraText, setExtraText] = useState("");
  const [photos, setPhotos] = useState<PickedImage[]>([]);
  const [description, setDescription] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const effGroupId = groupId || (groups.length === 1 ? groups[0]._id : "");
  const isSupervisor = me?.role === "GROUP_SUPERVISOR";

  const pricesQ = useQuery({
    queryKey: ["group-prices", effGroupId],
    queryFn: () => apiFetch<PriceItem[]>(`/api/v1/price-items?groupId=${effGroupId}`),
    enabled: !!effGroupId,
  });
  const membersQ = useQuery({
    queryKey: ["group-members", effGroupId],
    queryFn: () => apiFetch<{ _id: string; fullName: string; role: string }[]>(`/api/v1/groups/${effGroupId}/members`),
    enabled: !!effGroupId && isSupervisor,
  });
  const [search, setSearch] = useState("");
  const prices = useMemo(() => {
    const l = pricesQ.data || [];
    return search.trim() ? l.filter((p) => p.title.includes(search.trim()) || p.code.includes(search.trim())) : l;
  }, [pricesQ.data, search]);

  const priceOf = (id: string) => (pricesQ.data || []).find((p) => p._id === id);
  const total = items.reduce((s, it) => s + (priceOf(it.priceItemId)?.unitPrice || 0) * it.quantity, 0);

  const addExtra = () => {
    if (!extraText.trim()) return;
    setExtras((e) => [...e, extraText.trim()]);
    setExtraText("");
  };

  const submit = async () => {
    if (!effGroupId) { toast("ابتدا گروه کاری را انتخاب کنید.", "warn"); return; }
    if (items.length === 0 && extras.length === 0) { toast("حداقل یک آیتم بها یا کار اضافی اضافه کنید.", "warn"); return; }
    setSubmitting(true);
    const payload = {
      groupId: effGroupId,
      onBehalfUserId: onBehalf || null,
      contractId: "",
      description: description || undefined,
      items,
      extras: extras.map((d) => ({ description: d })),
      photos,
      idempotencyKey: `idem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    };
    try {
      if (!online) {
        enqueue({ idempotencyKey: payload.idempotencyKey, endpoint: "create_report", payload });
        toast("ذخیره شد و بعد از اتصال ارسال می‌شود.", "success");
      } else {
        await apiPost("/api/v1/reports", payload);
        toast("گزارش با موفقیت ارسال شد.", "success");
      }
      localStorage.removeItem(`draft-${me?._id}`);
      router.push(backHref);
    } catch (e) {
      enqueue({ idempotencyKey: payload.idempotencyKey, endpoint: "create_report", payload });
      toast(e instanceof Error ? e.message : "ارسال ناموفق بود؛ در صف قرار گرفت.", "warn");
      router.push(backHref);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* گروه */}
      <Card className="mb-4">
        <p className="mb-2.5 text-[13px] font-black text-ink-700">گروه کاری</p>
        {groups.length === 0 ? (
          <p className="text-[13px] font-bold text-bad-600">شما به هیچ گروهی تخصیص ندارید؛ با رییس شرکت تماس بگیرید.</p>
        ) : groups.length === 1 ? (
          <div className="flex items-center justify-between rounded-input bg-primary-50/70 px-4 py-3">
            <span className="text-[14px] font-black text-primary-700">{groups[0].name}</span>
            <span className="rounded-full border border-primary-200 bg-white px-2.5 py-1 text-[11px] font-black text-primary-600">انتخاب خودکار</span>
          </div>
        ) : (
          <Tabs value={effGroupId} onChange={setGroupId} tabs={groups.map((g) => ({ key: g._id, label: g.name }))} />
        )}
      </Card>

      {/* ثبت به نام (سرپرست) */}
      {isSupervisor && (
        <Card className="mb-4">
          <p className="mb-2.5 text-[13px] font-black text-ink-700">ثبت به نام</p>
          <Select
            value={onBehalf}
            onChange={setOnBehalf}
            placeholder="به نام خودم (سرپرست)"
            options={(membersQ.data || []).filter((m) => m._id !== me?._id && m.role === "TECHNICIAN").map((m) => ({ value: m._id, label: m.fullName }))}
          />
          <p className="mt-2 text-[11.5px] font-bold leading-6 text-ink-300">
            اگر کار را خودتان انجام داده‌اید «به نام خودم» را رها کنید؛ گزارش شما مستقیم به بررسی کارشناس کارفرما می‌رود.
          </p>
        </Card>
      )}

      {/* آیتم‌ها */}
      <Card className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] font-black text-ink-700">آیتم‌های فهرست بها</p>
          {items.length > 0 && <span className="tnum text-[12px] font-black text-ink-400">{faDigits(items.length)} آیتم</span>}
        </div>
        <Button full variant="soft" size="lg" icon={<ListPlus size={20} />} onClick={() => { if (!effGroupId) { toast("ابتدا گروه را انتخاب کنید.", "warn"); return; } setPickerOpen(true); }}>
          افزودن آیتم از فهرست بها
        </Button>
        <div className="mt-3 space-y-2.5">
          {items.map((it) => {
            const p = priceOf(it.priceItemId);
            if (!p) return null;
            return (
              <div key={it.priceItemId} className="anim-fade-up rounded-[16px] border border-line bg-slate-50/60 p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-black text-ink-900">{p.title}</p>
                    <p className="tnum mt-0.5 text-[11.5px] font-bold text-ink-300">{formatRial(p.unitPrice, false)} ریال / {p.unit}</p>
                  </div>
                  <button onClick={() => setRemoveTarget(it.priceItemId)} className="press text-ink-300 transition-colors hover:text-bad-600" aria-label="حذف آیتم"><Trash2 size={18} /></button>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <NumberStepper value={it.quantity} onChange={(v) => setItems((prev) => prev.map((x) => (x.priceItemId === it.priceItemId ? { ...x, quantity: v } : x)))} large />
                  <span className="tnum text-[14px] font-black text-primary-700">{formatRial(p.unitPrice * it.quantity, false)} <span className="text-[10.5px] font-bold text-ink-300">ریال</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* کار اضافی */}
      <Card className="mb-4">
        <p className="mb-2.5 text-[13px] font-black text-ink-700">کار اضافی خارج از فهرست بها</p>
        <Textarea placeholder="شرح کار اضافی انجام‌شده..." value={extraText} onChange={(e) => setExtraText(e.target.value)} />
        <Button variant="outline" className="mt-2.5" icon={<Plus size={17} />} onClick={addExtra}>ثبت کار اضافی</Button>
        <div className="mt-3 space-y-2">
          {extras.map((ex, i) => (
            <div key={i} className="anim-fade-up flex items-center gap-2.5 rounded-input border border-amber-200 bg-warn-50 px-3.5 py-2.5">
              <PackageSearch size={16} className="shrink-0 text-warn-600" />
              <p className="min-w-0 flex-1 truncate text-[12.5px] font-bold text-warn-700">{ex}</p>
              <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-warn-700">در انتظار معادل‌سازی</span>
              <button onClick={() => setExtras((e) => e.filter((_, j) => j !== i))} className="text-warn-600 hover:text-bad-600" aria-label="حذف"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      </Card>

      {/* مستندات */}
      <Card className="mb-4">
        <p className="mb-2.5 text-[13px] font-black text-ink-700">عکس و مستندات</p>
        <FileUploader onPick={(img) => setPhotos((p) => [...p, img])} />
        <div className="mt-3"><ImagePreviewGallery images={photos} onRemove={(i) => setPhotos((p) => p.filter((_, j) => j !== i))} /></div>
      </Card>

      <Card className="mb-4">
        <p className="mb-2.5 text-[13px] font-black text-ink-700">توضیحات (اختیاری)</p>
        <Textarea placeholder="توضیحات تکمیلی گزارش..." value={description} onChange={(e) => setDescription(e.target.value)} />
      </Card>

      {/* جمع و ارسال */}
      <div className="sticky bottom-[calc(84px+env(safe-area-inset-bottom))] z-20 lg:bottom-4">
        <div className="anim-fade-up flex items-center gap-3 rounded-card border border-line bg-white/95 p-3.5 shadow-[0_14px_40px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-black text-ink-300">جمع گزارش</p>
            <p className="tnum text-[16px] font-black text-ink-900">{formatRial(total)}</p>
          </div>
          <Button size="lg" loading={submitting} onClick={submit} icon={!online ? <UploadCloud size={19} /> : <Send size={19} />}>
            {online ? "ارسال گزارش" : "ذخیره و ارسال بعدی"}
          </Button>
        </div>
      </div>

      {/* انتخاب آیتم */}
      <BottomSheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="انتخاب آیتم از فهرست بها">
        <SearchBar value={search} onChange={setSearch} placeholder="جستجوی سریع آیتم..." />
        <div className="mt-3 max-h-[50vh] space-y-2 overflow-y-auto">
          {prices.length === 0 && <p className="py-6 text-center text-[12.5px] font-bold text-ink-300">آیتمی یافت نشد.</p>}
          {prices.map((p) => {
            const added = items.some((i) => i.priceItemId === p._id);
            return (
              <button
                key={p._id}
                disabled={added}
                onClick={() => { setItems((prev) => [...prev, { priceItemId: p._id, quantity: 1 }]); toast("آیتم اضافه شد.", "success"); }}
                className="press flex w-full items-center gap-3 rounded-input border border-line bg-white p-3.5 text-start transition-all hover:border-primary-300 disabled:opacity-45"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-black text-ink-900">{p.title}</span>
                  <span className="tnum mt-0.5 block text-[11px] font-bold text-ink-400">{p.code} — {formatRial(p.unitPrice, false)} ریال / {p.unit}</span>
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white"><Plus size={16} /></span>
              </button>
            );
          })}
        </div>
      </BottomSheet>

      <ConfirmationDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => setItems((prev) => prev.filter((i) => i.priceItemId !== removeTarget))}
        title="حذف آیتم"
        body="این آیتم از گزارش حذف شود؟"
        confirmLabel="حذف شود"
        variant="danger"
      />
    </div>
  );
}
