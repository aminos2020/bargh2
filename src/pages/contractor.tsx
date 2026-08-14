import React, { useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Activity, CheckCircle2, ClipboardCheck, Coins, FileText, HardHat, PackageSearch, Receipt, ShieldAlert, ShoppingCart, Users, Wallet, XCircle } from "lucide-react";
import { useStore } from "../store";
import { EXTRA_STATUS_META, PRIORITY_META } from "../types";
import { compactRial, faDigits, formatRial, jalaliKeyToDisplay, lastNDays, nav, relativeTime } from "../lib/utils";
import { Avatar, Badge, Button, Card, EmptyState, Field, KpiCard, Modal, NumberStepper, PageHeader, Select, StatusBadge, Tabs, Textarea, cx, useToast } from "../components/ui";
import { ReviewsList, ReviewDetail, PurchaseBoard, ActivityTimeline } from "./workflows";
import { PersonnelManager, GroupManager, PriceListManager, StatementManager } from "./managers";

const PENDING = ["supervisor_review", "expert_review", "employer_ceo_review"];

/* ============================ contractor home ============================ */

export function ContractorHome() {
  const store = useStore();
  const { user, db, visibleReports, reportTotal, userName, groupName } = store;
  if (!user) return null;
  const work = visibleReports().filter((r) => r.reportType === "work_report");
  const todayKey = lastNDays(1)[0].key;
  const today = work.filter((r) => r.reportDateJ === todayKey);
  const pending = work.filter((r) => PENDING.includes(r.status));
  const approved = work.filter((r) => r.status === "approved" || r.status === "settled");
  const rejected = work.filter((r) => r.status === "rejected" || r.status === "redo_requested" || r.status === "disputed");
  const approvedSum = approved.reduce((s, r) => s + reportTotal(r.id), 0);
  const activePersonnel = db.users.filter((u) => u.companyId === user.companyId && u.isActive && u.id !== user.id).length;

  const trend = useMemo(() => {
    const days = lastNDays(14);
    return days.map((d) => ({
      label: d.label,
      count: work.filter((r) => r.reportDateJ === d.key).length,
      amount: work.filter((r) => r.reportDateJ === d.key && (r.status === "approved" || r.status === "settled")).reduce((s, r) => s + reportTotal(r.id), 0) / 1000000,
    }));
  }, [work, reportTotal]);

  const byGroup = useMemo(() => {
    return db.groups.filter((g) => g.companyId === user.companyId).map((g) => ({
      name: g.name.replace("گروه ", ""),
      count: work.filter((r) => r.groupId === g.id).length,
    }));
  }, [db.groups, work, user]);

  const recentAudits = db.auditLogs
    .filter((a) => db.users.find((u) => u.id === a.actorUserId)?.companyId === user.companyId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="anim-fade-up mb-4">
        <h1 className="text-[21px] font-black text-ink-900">داشبورد شرکت</h1>
        <p className="mt-1 text-[12.5px] font-bold text-ink-400">{db.companies.find((c) => c.id === user.companyId)?.name} — نمای کلی عملکرد نیروها</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard delay={0} label="گزارش‌های امروز" value={faDigits(today.length)} icon={<FileText size={18} />} tone="primary" onClick={() => nav("/contractor-ceo/reports")} />
        <KpiCard delay={40} label="در انتظار بررسی" value={faDigits(pending.length)} icon={<ClipboardCheck size={18} />} tone="warn" onClick={() => nav("/contractor-ceo/reports")} />
        <KpiCard delay={80} label="تایید نهایی" value={faDigits(approved.length)} icon={<CheckCircle2 size={18} />} tone="ok" />
        <KpiCard delay={120} label="رد / اختلاف" value={faDigits(rejected.length)} icon={<XCircle size={18} />} tone="bad" />
        <KpiCard delay={160} label="مبلغ تاییدشده" value={compactRial(approvedSum)} sub="ریال" icon={<Wallet size={18} />} tone="teal" onClick={() => nav("/contractor-ceo/statements")} />
        <KpiCard delay={200} label="نیروهای فعال" value={faDigits(activePersonnel)} icon={<HardHat size={18} />} tone="cyan" onClick={() => nav("/contractor-ceo/personnel")} />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card className="anim-fade-up">
          <p className="mb-3 text-[13px] font-black text-ink-700">روند گزارش‌ها و هزینه تاییدشده (۱۴ روز اخیر)</p>
          <div dir="ltr" className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 4, right: 4, left: -22, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fontFamily: "Vazirmatn", fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={1} />
                <YAxis yAxisId="l" allowDecimals={false} tick={{ fontSize: 9, fontFamily: "Vazirmatn", fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 9, fontFamily: "Vazirmatn", fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontFamily: "Vazirmatn", fontSize: 12, borderRadius: 12, border: "1px solid #e2e8f0" }} />
                <Bar yAxisId="l" dataKey="count" name="تعداد گزارش" fill="#2563eb" radius={[5, 5, 0, 0]} maxBarSize={14} />
                <Bar yAxisId="r" dataKey="amount" name="هزینه (میلیون ریال)" fill="#14b8a6" radius={[5, 5, 0, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="anim-fade-up">
          <p className="mb-3 text-[13px] font-black text-ink-700">توزیع گزارش‌ها بین گروه‌ها</p>
          <div dir="ltr" className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byGroup} layout="vertical" margin={{ top: 4, right: 12, left: 10, bottom: 0 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fontFamily: "Vazirmatn", fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10.5, fontFamily: "Vazirmatn", fill: "#334155", fontWeight: 700 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontFamily: "Vazirmatn", fontSize: 12, borderRadius: 12, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="count" name="گزارش" fill="#3b82f6" radius={[0, 6, 6, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card pad={false} className="anim-fade-up">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-[13px] font-black text-ink-700">آخرین فعالیت نیروها</p>
            <button onClick={() => nav("/contractor-ceo/activity")} className="text-[11.5px] font-black text-primary-600 hover:text-primary-700">همه رویدادها</button>
          </div>
          <div className="divide-y divide-line/70">
            {recentAudits.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={userName(a.actorUserId)} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-black text-ink-800">{userName(a.actorUserId)} — {a.action}</p>
                  {a.detail && <p className="truncate text-[11px] font-bold text-ink-400">{a.detail}</p>}
                </div>
                <span className="shrink-0 text-[10.5px] font-bold text-ink-300">{relativeTime(a.createdAt)}</span>
              </div>
            ))}
            {recentAudits.length === 0 && <p className="px-4 py-6 text-center text-[12px] font-bold text-ink-300">رویدادی ثبت نشده است.</p>}
          </div>
        </Card>

        <div className="grid gap-3">
          <Card className="anim-fade-up flex items-center justify-between gap-3" >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-teal-50 text-teal-600"><Receipt size={20} /></span>
              <div>
                <p className="text-[13.5px] font-black text-ink-900">صورت‌وضعیت بسازید</p>
                <p className="mt-0.5 text-[11.5px] font-bold text-ink-400">از گزارش‌های تایید نهایی‌شده</p>
              </div>
            </div>
            <Button size="sm" variant="soft" onClick={() => nav("/contractor-ceo/statements")}>صورت‌وضعیت‌ها</Button>
          </Card>
          <Card className="anim-fade-up flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-sky-50 text-sky-600"><ShoppingCart size={20} /></span>
              <div>
                <p className="text-[13.5px] font-black text-ink-900">درخواست‌های خرید</p>
                <p className="mt-0.5 text-[11.5px] font-bold text-ink-400">{faDigits(db.purchaseRequests.filter((p) => p.companyId === user.companyId && p.status === "submitted").length)} مورد در انتظار تصمیم</p>
              </div>
            </div>
            <Button size="sm" variant="soft" onClick={() => nav("/contractor-ceo/purchase-requests")}>مشاهده</Button>
          </Card>
          <Card className="anim-fade-up flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-primary-50 text-primary-600"><Coins size={20} /></span>
              <div>
                <p className="text-[13.5px] font-black text-ink-900">فهرست آحاد بها</p>
                <p className="mt-0.5 text-[11.5px] font-bold text-ink-400">{faDigits(db.priceItems.filter((p) => p.isActive).length)} آیتم فعال</p>
              </div>
            </div>
            <Button size="sm" variant="soft" onClick={() => nav("/contractor-ceo/price-list")}>مدیریت</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ============================ resident home + extras ============================ */

export function ResidentHome() {
  const { user, db, visibleExtras } = useStore();
  if (!user) return null;
  const extras = visibleExtras();
  const pendingExtras = extras.filter((e) => e.status === "pending");
  const purchases = db.purchaseRequests.filter((p) => p.companyId === user.companyId);
  const pendingPur = purchases.filter((p) => p.status === "submitted");
  const purchased = purchases.filter((p) => p.status === "purchased");

  return (
    <div className="mx-auto max-w-3xl">
      <div className="anim-fade-up mb-4">
        <h1 className="text-[21px] font-black text-ink-900">نماینده مقیم</h1>
        <p className="mt-1 text-[12.5px] font-bold text-ink-400">معادل‌سازی کارهای اضافی و مدیریت خرید و تجهیز</p>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KpiCard delay={0} label="اضافی در انتظار معادل‌سازی" value={faDigits(pendingExtras.length)} icon={<PackageSearch size={19} />} tone={pendingExtras.length ? "warn" : "ok"} onClick={() => nav("/resident/extra-items")} />
        <KpiCard delay={60} label="خرید در انتظار تصمیم" value={faDigits(pendingPur.length)} icon={<ShoppingCart size={19} />} tone="cyan" onClick={() => nav("/resident/purchase-requests")} />
        <KpiCard delay={120} label="خرید انجام‌شده" value={faDigits(purchased.length)} icon={<CheckCircle2 size={19} />} tone="teal" onClick={() => nav("/resident/purchase-requests")} />
      </div>

      <Card pad={false} className="anim-fade-up mb-4">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-[13px] font-black text-ink-700">کارهای اضافی در انتظار</p>
          <button onClick={() => nav("/resident/extra-items")} className="text-[11.5px] font-black text-primary-600 hover:text-primary-700">همه موارد</button>
        </div>
        {pendingExtras.length === 0 ? (
          <EmptyState icon={<CheckCircle2 size={26} />} title="موردی در انتظار نیست" body="همه کارهای اضافی تعیین تکلیف شده‌اند." />
        ) : (
          <div className="divide-y divide-line/70">
            {pendingExtras.slice(0, 4).map((e) => (
              <button key={e.id} onClick={() => nav("/resident/extra-items")} className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-primary-50/40">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-amber-50 text-warn-600"><PackageSearch size={16} /></span>
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-black text-ink-800">{e.description}</span>
                <span className="shrink-0 text-[10.5px] font-bold text-ink-300">{relativeTime(e.createdAt)}</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card pad={false} className="anim-fade-up">
        <p className="border-b border-line px-4 py-3 text-[13px] font-black text-ink-700">آخرین خریدها</p>
        {purchased.length === 0 ? <p className="px-4 py-6 text-center text-[12px] font-bold text-ink-300">خریدی ثبت نشده است.</p> : (
          <div className="divide-y divide-line/70">
            {purchased.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-teal-50 text-teal-600"><ShoppingCart size={16} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-black text-ink-800">{p.title}</p>
                  <p className="tnum mt-0.5 text-[11px] font-bold text-ink-400">{faDigits(p.quantity)} عدد — {formatRial(p.estimatedPrice, false)} ریال</p>
                </div>
                <StatusBadge meta={EXTRA_STATUS_META.mapped} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export function ExtraItemsPage() {
  const store = useStore();
  const { user, db, visibleExtras, userName, groupName, reportById, mapExtraItem, rejectExtraItem } = store;
  const [tab, setTab] = useState("all");
  const [mapping, setMapping] = useState<string | null>(null);
  const [mItem, setMItem] = useState("");
  const [mQty, setMQty] = useState(1);
  const [mNote, setMNote] = useState("");
  const toast = useToast();

  const list = useMemo(() => {
    let l = visibleExtras();
    if (tab !== "all") l = l.filter((e) => e.status === tab);
    return [...l].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [visibleExtras, tab]);

  if (!user) return null;
  const active = db.extraItems.find((e) => e.id === mapping);
  const priceOptions = db.priceItems.filter((p) => p.isActive);
  const selPrice = db.priceItems.find((p) => p.id === mItem);

  const submitMapping = () => {
    if (!active) return;
    const res = mapExtraItem(active.id, mItem, mQty, mNote.trim() || undefined);
    if (res.ok) { setMapping(null); setMItem(""); setMQty(1); setMNote(""); }
    else toast(res.message, "error");
  };

  return (
    <div>
      <PageHeader title="کارهای اضافی و معادل‌سازی" subtitle="معادل‌سازی کارهای خارج از فهرست بها با آیتم‌های قرارداد" />
      <Tabs className="mb-4" value={tab} onChange={setTab} tabs={[
        { key: "all", label: "همه" },
        { key: "pending", label: "در انتظار", count: visibleExtras().filter((e) => e.status === "pending").length },
        { key: "mapped", label: "معادل‌سازی‌شده" },
        { key: "rejected", label: "رد شده" },
      ]} />

      {list.length === 0 ? (
        <Card><EmptyState icon={<PackageSearch size={28} />} title="کار اضافی‌ای یافت نشد" body="کارهای اضافی که تکنسین‌ها خارج از فهرست بها ثبت کنند اینجا نمایش داده می‌شوند." /></Card>
      ) : (
        <div className="stagger space-y-2.5">
          {list.map((e) => {
            const r = reportById(e.reportId);
            return (
              <Card key={e.id}>
                <div className="flex flex-wrap items-start gap-3">
                  <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]", e.status === "mapped" ? "bg-ok-50 text-ok-600" : e.status === "rejected" ? "bg-bad-50 text-bad-600" : "bg-amber-50 text-warn-600")}>
                    <PackageSearch size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-black leading-6 text-ink-900">{e.description}</p>
                    <p className="mt-1 text-[11.5px] font-bold text-ink-400">
                      {r ? `${userName(r.userId)} — ${groupName(r.groupId)} — ${jalaliKeyToDisplay(r.reportDateJ)}` : ""}
                    </p>
                    {e.status === "mapped" && (
                      <p className="tnum mt-1.5 rounded-[12px] bg-ok-50 px-3 py-1.5 text-[11.5px] font-black text-ok-700">
                        معادل: {db.priceItems.find((p) => p.id === e.mappedPriceItemId)?.title} × {faDigits(e.mappedQuantity || 0)} = {formatRial(e.mappedAmount || 0)}
                      </p>
                    )}
                    {e.mappingNote && e.status === "rejected" && <p className="mt-1.5 text-[11.5px] font-bold text-bad-700">دلیل رد: {e.mappingNote}</p>}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <StatusBadge meta={EXTRA_STATUS_META[e.status]} />
                    {e.status === "pending" && (
                      <div className="flex gap-1.5">
                        <Button size="sm" onClick={() => { setMapping(e.id); setMItem(""); setMQty(1); setMNote(""); }}>معادل‌سازی</Button>
                        <Button size="sm" variant="dangerSoft" onClick={() => rejectExtraItem(e.id, "قابل پرداخت در قرارداد نیست")}>رد</Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!mapping} onClose={() => setMapping(null)} title="معادل‌سازی کار اضافی" footer={
        <>
          <Button full onClick={submitMapping} disabled={!mItem}>تایید معادل‌سازی</Button>
          <Button full variant="outline" onClick={() => setMapping(null)}>انصراف</Button>
        </>
      }>
        {active && <p className="mb-4 rounded-[14px] bg-slate-50 px-3.5 py-2.5 text-[12.5px] font-bold leading-6 text-ink-700">{active.description}</p>}
        <Field label="آیتم معادل از فهرست بها" required>
          <Select value={mItem} onChange={setMItem} placeholder="انتخاب آیتم..." options={priceOptions.map((p) => ({ value: p.id, label: `${p.code} — ${p.title} (${p.unit})` }))} />
        </Field>
        <Field label="تعداد">
          <NumberStepper value={mQty} onChange={setMQty} min={1} />
        </Field>
        {selPrice && (
          <p className="tnum mb-4 rounded-[14px] bg-primary-50 px-3.5 py-2.5 text-[13px] font-black text-primary-700">
            مبلغ معادل: {formatRial(selPrice.unitPrice * mQty)}
          </p>
        )}
        <Field label="یادداشت">
          <Textarea value={mNote} onChange={(e) => setMNote(e.target.value)} placeholder="توضیح مبنای معادل‌سازی..." className="min-h-[70px]" />
        </Field>
        <p className="rounded-[12px] bg-amber-50 px-3 py-2 text-[11.5px] font-bold leading-6 text-warn-700">پس از معادل‌سازی، مبلغ این کار در صورت‌وضعیت پیمانکار محاسبه می‌شود و عملیات در Audit Log ثبت خواهد شد.</p>
      </Modal>
    </div>
  );
}

/* ============================ modules ============================ */

export function ContractorModule({ page, param }: { page: string; param?: string }) {
  switch (page) {
    case "home": return <ContractorHome />;
    case "personnel": return <PersonnelManager page={page} param={param} />;
    case "groups": return <GroupManager page={page} param={param} />;
    case "price-list": return <PriceListManager />;
    case "reports":
      if (param) return <ReviewDetail id={param} backPath="/contractor-ceo/reports" />;
      return <ReviewsList scope="contractor" title="گزارش‌های شرکت" subtitle="همه گزارش‌های نیروهای شرکت در گردش تایید" />;
    case "statements": return <StatementManager mode="contractor" />;
    case "purchase-requests":
      return <PurchaseBoard decideRoles={["RESIDENT_REP", "CONTRACTOR_CEO"]} markRole="RESIDENT_REP" createRoles={["TECHNICIAN", "GROUP_SUPERVISOR", "RESIDENT_REP"]} />;
    case "activity": return <ActivityTimeline title="فعالیت‌های شرکت" />;
    case "profile": return null;
    default: return null;
  }
}

export function ResidentModule({ page }: { page: string }) {
  switch (page) {
    case "home": return <ResidentHome />;
    case "extra-items": return <ExtraItemsPage />;
    case "purchase-requests":
      return <PurchaseBoard decideRoles={["RESIDENT_REP", "CONTRACTOR_CEO"]} markRole="RESIDENT_REP" createRoles={["TECHNICIAN", "GROUP_SUPERVISOR", "RESIDENT_REP"]} />;
    case "activity": return <ActivityTimeline title="فعالیت‌های شرکت" />;
    case "profile": return null;
    default: return null;
  }
}
