import React, { useEffect, useMemo, useRef, useState } from "react";
import { Camera, CheckCircle2, UploadCloud, ImagePlus, ListPlus, Loader2, Plus, Send, Trash2, WifiOff, X, PackageSearch } from "lucide-react";
import { useStore } from "../store";
import type { PriceItem } from "../types";
import { compressImage, faDigits, formatRial, jalaliLong, nav, todayJalali, uid } from "../lib/utils";
import { Badge, Button, Card, Confirm, EmptyState, Modal, NumberStepper, PageHeader, SearchBar, Select, Tabs, Textarea, cx, useToast } from "../components/ui";

interface SelectedItem { priceItemId: string; quantity: number; }
interface SelectedPhoto { fileName: string; dataUrl: string; size: number; }

interface Draft {
  groupId: string | null;
  description: string;
  items: SelectedItem[];
  extras: string[];
  photos: SelectedPhoto[];
  taskReferenceId: string | null;
}

function ItemPicker({ open, onClose, groupId, items, onAdd }: { open: boolean; onClose: () => void; groupId: string; items: SelectedItem[]; onAdd: (pi: PriceItem) => void }) {
  const { groupPriceItems, groupName } = useStore();
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const all = groupPriceItems(groupId);
    const t = q.trim();
    if (!t) return all;
    return all.filter((p) => p.title.includes(t) || p.code.includes(t));
  }, [groupPriceItems, groupId, q]);

  return (
    <Modal open={open} onClose={onClose} title={`انتخاب آیتم — ${groupName(groupId)}`} wide>
      <SearchBar value={q} onChange={setQ} placeholder="جستجوی کد یا عنوان آیتم..." className="mb-3" />
      {list.length === 0 ? (
        <EmptyState icon={<PackageSearch size={28} />} title="آیتمی یافت نشد" body={q ? "عبارت دیگری جستجو کنید." : "برای این گروه آیتم بهایی تعریف نشده است؛ با رییس شرکت پیمانکار هماهنگ کنید."} />
      ) : (
        <div className="stagger space-y-2">
          {list.map((p) => {
            const added = items.some((i) => i.priceItemId === p.id);
            return (
              <button key={p.id} onClick={() => onAdd(p)}
                className={cx("press flex w-full items-center gap-3 rounded-[16px] border p-3.5 text-start transition-colors", added ? "border-ok-600/40 bg-ok-50/60" : "border-line bg-white hover:border-primary-300 hover:bg-primary-50/40")}>
                <span className="tnum rounded-[10px] bg-slate-100 px-2 py-1 text-[11px] font-black text-ink-500" dir="ltr">{p.code}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-black text-ink-900">{p.title}</span>
                  <span className="mt-0.5 block text-[11.5px] font-bold text-ink-300">واحد: {p.unit}</span>
                </span>
                <span className="text-left">
                  <span className="tnum block text-[13px] font-black text-primary-700">{formatRial(p.unitPrice, false)}</span>
                  <span className="block text-[10.5px] font-bold text-ink-300">ریال / {p.unit}</span>
                </span>
                {added && <CheckCircle2 size={20} className="shrink-0 text-ok-600" />}
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

export default function ReportNewPage({ taskParam }: { taskParam?: string | null }) {
  const store = useStore();
  const { user, userGroups, groupPriceItems, groupById, groupMembers, online, submitReport, db } = store;
  const toast = useToast();
  const groups = user ? userGroups(user.id) : [];
  const draftKey = user ? `tavanban-draft-${user.id}` : "";
  const isSupervisor = user?.role === "GROUP_SUPERVISOR";

  const [groupId, setGroupId] = useState<string | null>(groups.length === 1 ? groups[0].id : null);
  const [onBehalf, setOnBehalf] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [extras, setExtras] = useState<string[]>([]);
  const [extraText, setExtraText] = useState("");
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [removeItem, setRemoveItem] = useState<SelectedItem | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const task = taskParam ? db.tasks.find((t) => t.id === taskParam) : null;
  const taskRef = useRef(taskParam || null);

  /* load draft */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw) as Draft;
        if (d.groupId) setGroupId(d.groupId);
        setDescription(d.description || "");
        setItems(d.items || []);
        setExtras(d.extras || []);
        setPhotos(d.photos || []);
        if (d.taskReferenceId && !taskRef.current) taskRef.current = d.taskReferenceId;
        setSaveState("saved");
      }
    } catch { /* ignore */ }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  /* debounced autosave */
  useEffect(() => {
    if (!loaded) return;
    setSaveState("saving");
    const t = setTimeout(() => {
      try {
        const d: Draft = { groupId, description, items, extras, photos, taskReferenceId: taskRef.current };
        localStorage.setItem(draftKey, JSON.stringify(d));
        setSaveState("saved");
      } catch { setSaveState("idle"); }
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, description, items, extras, photos, loaded]);

  const priceOf = (id: string) => db.priceItems.find((p) => p.id === id);
  const total = items.reduce((s, i) => { const p = priceOf(i.priceItemId); return s + (p ? p.unitPrice * i.quantity : 0); }, 0);
  const jToday = jalaliLong(todayJalali());

  const addItem = (p: PriceItem) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.priceItemId === p.id);
      if (ex) return prev.map((i) => (i.priceItemId === p.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { priceItemId: p.id, quantity: 1 }];
    });
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files || !files.length) return;
    if (photos.length + files.length > 6) { toast("حداکثر ۶ عکس برای هر گزارش مجاز است", "warn"); return; }
    setCompressing(true);
    try {
      for (const f of Array.from(files)) {
        if (!f.type.startsWith("image/")) continue;
        const c = await compressImage(f);
        setPhotos((prev) => [...prev, { fileName: f.name.replace(/\.[^.]+$/, "") + ".jpg", dataUrl: c.dataUrl, size: c.size }]);
      }
      toast("عکس‌ها آماده شد", "success");
    } catch {
      toast("خطا در پردازش عکس", "error");
    } finally {
      setCompressing(false);
    }
  };

  const doSubmit = () => {
    if (!user) return;
    if (!groupId) { toast("ابتدا گروه کاری را انتخاب کنید", "warn"); return; }
    if (items.length === 0 && extras.length === 0) { toast("حداقل یک آیتم بها یا کار اضافی اضافه کنید", "warn"); return; }
    setSubmitting(true);
    setTimeout(() => {
      const res = submitReport({
        userId: onBehalf || undefined,
        groupId,
        contractId: groupById(groupId)?.contractId || db.contracts[0]?.id || "",
        reportDateJ: `${todayJalali().jy}-${String(todayJalali().jm).padStart(2, "0")}-${String(todayJalali().jd).padStart(2, "0")}`,
        description: description || undefined,
        taskReferenceId: taskRef.current,
        items,
        extras: extras.map((d) => ({ description: d })),
        photos,
        idempotencyKey: uid("idem"),
      }, !online);
      setSubmitting(false);
      if (!res.ok) { toast(res.message, "error"); return; }
      localStorage.removeItem(draftKey);
      toast(res.message, "success");
      nav("/technician/reports");
    }, 400);
  };

  const saveDraftManual = () => {
    const d: Draft = { groupId, description, items, extras, photos, taskReferenceId: taskRef.current };
    try { localStorage.setItem(draftKey, JSON.stringify(d)); } catch { /* quota */ }
    setSaveState("saved");
    toast("پیش‌نویس در این دستگاه ذخیره شد", "success");
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl pb-40 lg:pb-8">
      <PageHeader
        title="ثبت گزارش کار"
        subtitle={jToday}
        onBack={() => nav("/technician/home")}
        actions={
          <span className={cx("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black", saveState === "saving" ? "bg-slate-100 text-ink-400" : "bg-ok-50 text-ok-700")}>
            {saveState === "saving" ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
            {saveState === "saving" ? "در حال ذخیره..." : "پیش‌نویس ذخیره شد"}
          </span>
        }
      />

      {!online && (
        <div className="anim-fade-up mb-4 flex items-center gap-2.5 rounded-[16px] border border-amber-200 bg-warn-50 px-4 py-3 text-[12.5px] font-bold leading-6 text-warn-700">
          <WifiOff size={17} className="shrink-0" />
          حالت آفلاین — گزارش روی دستگاه ذخیره می‌شود و بعد از اتصال، خودکار ارسال خواهد شد.
        </div>
      )}

      {task && (
        <Card className="mb-4 border-primary-200 bg-primary-50/50">
          <p className="text-[11px] font-black text-primary-600">گزارش از روی کار محوله</p>
          <p className="mt-1 text-[13.5px] font-black text-ink-900">{task.title}</p>
        </Card>
      )}

      {/* group */}
      <Card className="mb-4">
        <p className="mb-2.5 text-[13px] font-black text-ink-700">گروه کاری</p>
        {groups.length === 0 && <p className="text-[13px] font-bold text-bad-600">شما به هیچ گروهی تخصیص ندارید؛ با رییس شرکت تماس بگیرید.</p>}
        {groups.length === 1 ? (
          <div className="flex items-center justify-between rounded-[14px] bg-primary-50/70 px-4 py-3">
            <span className="text-[14px] font-black text-primary-700">{groups[0].name}</span>
            <Badge className="border-primary-200 bg-white text-primary-600">انتخاب خودکار</Badge>
          </div>
        ) : groups.length > 1 && (
          <Tabs
            value={groupId || ""}
            onChange={(k) => setGroupId(k)}
            tabs={groups.map((g) => ({ key: g.id, label: g.name }))}
          />
        )}
      </Card>

      {/* on-behalf (supervisor only) */}
      {isSupervisor && (
        <Card className="mb-4">
          <p className="mb-2.5 text-[13px] font-black text-ink-700">ثبت به نام</p>
          <Select
            value={onBehalf}
            onChange={setOnBehalf}
            placeholder="به نام خودم (سرپرست)"
            options={groupMembers(groupId || "")
              .filter((m) => m.user.id !== user?.id && m.user.role === "TECHNICIAN" && m.user.isActive)
              .map((m) => ({ value: m.user.id, label: m.user.fullName }))}
          />
          <p className="mt-2 text-[11.5px] font-bold leading-6 text-ink-300">
            اگر کار را خودتان انجام داده‌اید، «به نام خودم» را رها کنید؛ در غیر این صورت گزارش به نام نیروی انتخابی ثبت و در رزومه‌ی او لحاظ می‌شود.
          </p>
        </Card>
      )}

      {/* items */}
      <Card className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] font-black text-ink-700">آیتم‌های فهرست بها</p>
          {items.length > 0 && <span className="tnum text-[12px] font-black text-ink-400">{faDigits(items.length)} آیتم</span>}
        </div>
        <Button full variant="soft" size="lg" icon={<ListPlus size={20} />} onClick={() => { if (!groupId) { toast("ابتدا گروه را انتخاب کنید", "warn"); return; } setPickerOpen(true); }}>
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
                  <button onClick={() => setRemoveItem(it)} className="press text-ink-300 transition-colors hover:text-bad-600" aria-label="حذف آیتم"><Trash2 size={18} /></button>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <NumberStepper value={it.quantity} onChange={(v) => setItems((prev) => prev.map((x) => (x.priceItemId === it.priceItemId ? { ...x, quantity: v } : x)))} />
                  <span className="tnum text-[14px] font-black text-primary-700">{formatRial(p.unitPrice * it.quantity, false)} <span className="text-[10.5px] font-bold text-ink-300">ریال</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* extra works */}
      <Card className="mb-4">
        <p className="mb-1 text-[13px] font-black text-ink-700">کار اضافی خارج از فهرست بها</p>
        <p className="mb-3 text-[11.5px] font-semibold leading-5 text-ink-300">این موارد پس از بررسی، توسط نماینده مقیم با آیتم بها معادل‌سازی می‌شوند.</p>
        <div className="flex gap-2">
          <Textarea value={extraText} onChange={(e) => setExtraText(e.target.value)} placeholder="شرح کار انجام‌شده خارج از فهرست..." className="min-h-[72px] flex-1" />
        </div>
        <Button variant="outline" size="sm" className="mt-2" icon={<Plus size={15} />} onClick={() => {
          if (extraText.trim().length < 5) { toast("شرح کار اضافی را کامل‌تر بنویسید", "warn"); return; }
          setExtras((p) => [...p, extraText.trim()]); setExtraText("");
        }}>ثبت کار اضافی</Button>
        {extras.length > 0 && (
          <div className="mt-3 space-y-2">
            {extras.map((e, i) => (
              <div key={i} className="anim-fade-up flex items-start gap-2.5 rounded-[14px] border border-amber-200 bg-warn-50/70 px-3.5 py-2.5">
                <span className="min-w-0 flex-1 text-[12.5px] font-bold leading-6 text-ink-800">{e}</span>
                <Badge className="shrink-0 border-amber-200 bg-white text-warn-700">در انتظار معادل‌سازی</Badge>
                <button onClick={() => setExtras((p) => p.filter((_, x) => x !== i))} className="press text-ink-300 hover:text-bad-600" aria-label="حذف"><X size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* photos */}
      <Card className="mb-4">
        <p className="mb-3 text-[13px] font-black text-ink-700">مستندات و عکس</p>
        <div className="grid grid-cols-4 gap-2.5">
          {photos.map((ph, i) => (
            <div key={i} className="anim-scale-in group relative aspect-square overflow-hidden rounded-[14px] border border-line">
              <img src={ph.dataUrl} alt={ph.fileName} className="h-full w-full object-cover" />
              <button onClick={() => setPhotos((p) => p.filter((_, x) => x !== i))}
                className="absolute inset-0 flex items-center justify-center bg-ink-900/50 opacity-0 transition-opacity group-hover:opacity-100" aria-label="حذف عکس">
                <Trash2 size={20} className="text-white" />
              </button>
            </div>
          ))}
          {compressing && (
            <div className="flex aspect-square items-center justify-center rounded-[14px] border border-dashed border-line bg-slate-50 text-ink-300">
              <Loader2 size={22} className="animate-spin" />
            </div>
          )}
          <button onClick={() => cameraRef.current?.click()} className="press flex aspect-square flex-col items-center justify-center gap-1.5 rounded-[14px] border border-dashed border-primary-300 bg-primary-50/50 text-primary-600 transition-colors hover:bg-primary-50">
            <Camera size={22} /><span className="text-[10.5px] font-black">دوربین</span>
          </button>
          <button onClick={() => galleryRef.current?.click()} className="press flex aspect-square flex-col items-center justify-center gap-1.5 rounded-[14px] border border-dashed border-line bg-slate-50 text-ink-400 transition-colors hover:bg-slate-100">
            <ImagePlus size={22} /><span className="text-[10.5px] font-black">گالری</span>
          </button>
        </div>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
        <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
      </Card>

      {/* description */}
      <Card className="mb-4">
        <p className="mb-2.5 text-[13px] font-black text-ink-700">توضیحات گزارش</p>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="شرح مختصر کارهای انجام‌شده، محل کار و نکات..." />
      </Card>

      {/* action bar */}
      <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur-lg lg:static lg:mt-2 lg:rounded-[20px] lg:border lg:px-5 lg:py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-black text-ink-300">جمع گزارش</p>
            <p className="tnum truncate text-[15px] font-black text-ink-900">{formatRial(total)}</p>
          </div>
          <Button variant="outline" size="lg" onClick={saveDraftManual}>ذخیره پیش‌نویس</Button>
          <Button size="lg" loading={submitting} onClick={doSubmit} icon={!online ? <UploadCloud size={19} /> : <Send size={19} />}>
            {online ? "ارسال گزارش" : "ذخیره و ارسال بعدی"}
          </Button>
        </div>
      </div>

      {groupId && <ItemPicker open={pickerOpen} onClose={() => setPickerOpen(false)} groupId={groupId} items={items} onAdd={addItem} />}
      <Confirm
        open={!!removeItem}
        onClose={() => setRemoveItem(null)}
        onConfirm={() => { if (removeItem) setItems((p) => p.filter((x) => x.priceItemId !== removeItem.priceItemId)); setRemoveItem(null); }}
        title="حذف آیتم"
        body={`«${removeItem ? priceOf(removeItem.priceItemId)?.title : ""}» از گزارش حذف شود؟`}
        confirmLabel="حذف شود"
        tone="danger"
      />
    </div>
  );
}
