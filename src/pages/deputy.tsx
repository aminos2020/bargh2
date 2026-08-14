import React, { useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  Activity, AlertTriangle, Building2, CheckCircle2, ClipboardCheck, Download, FileSignature, FileText,
  Landmark, Printer, Receipt, RotateCcw, Settings as SettingsIcon, ShieldAlert, Wallet, XCircle, Plus, ChevronLeft,
} from "lucide-react";
import { useStore } from "../store";
import type { ContractStatus, ContractType } from "../types";
import { CONTRACT_TYPE_LABEL, REPORT_STATUS_META, ROLE_LABEL } from "../types";
import { compactRial, downloadCSV, faDigits, formatRial, jalaliKeyToDisplay, lastNDays, nav, relativeTime } from "../lib/utils";
import { Avatar, Badge, Button, Card, Confirm, EmptyState, Field, Input, KeyValue, KpiCard, Modal, PageHeader, Pagination, SearchBar, Select, StatusBadge, Textarea, cx, useToast } from "../components/ui";
import { ReviewDetail, ActivityTimeline } from "./workflows";
import { StatementManager, UserAdmin, UnitsAdmin, JalaliDateInput } from "./managers";

const PENDING = ["supervisor_review", "expert_review", "employer_ceo_review"];
const PIE_COLORS = ["#f59e0b", "#f97316", "#06b6d4", "#16a34a", "#dc2626", "#e11d48", "#94a3b8", "#14b8a6"];

/* ============================ deputy home ============================ */

export function DeputyHome() {
  const store = useStore();
  const { db, reportTotal, userName } = store;
  const work = db.reports.filter((r) => r.reportType === "work_report");
  const todayKey = lastNDays(1)[0].key;
  const today = work.filter((r) => r.reportDateJ === todayKey);
  const pending = work.filter((r) => PENDING.includes(r.status));
  const approved = work.filter((r) => r.status === "approved" || r.status === "settled");
  const rejected = work.filter((r) => r.status === "rejected");
  const disputed = work.filter((r) => r.status === "disputed");
  const approvedSum = approved.reduce((s, r) => s + reportTotal(r.id), 0);
  const pendingStatements = db.statements.filter((s) => s.status === "submitted");

  const trend = useMemo(() => {
    const days = lastNDays(14);
    return days.map((d) => ({
      label: d.label,
      count: work.filter((r) => r.reportDateJ === d.key).length,
      cost: work.filter((r) => r.reportDateJ === d.key).reduce((s, r) => s + reportTotal(r.id), 0) / 1000000,
    }));
  }, [work, reportTotal]);

  const statusDist = useMemo(() => {
    const keys = ["supervisor_review", "expert_review", "employer_ceo_review", "approved", "rejected", "redo_requested", "disputed"] as const;
    return keys.map((k, i) => ({ name: REPORT_STATUS_META[k].label, value: work.filter((r) => r.status === k).length, color: PIE_COLORS[i] })).filter((x) => x.value > 0);
  }, [work]);

  const byGroup = useMemo(() => db.groups.map((g) => ({ name: g.name.replace("گروه ", ""), count: work.filter((r) => r.groupId === g.id).length })), [db.groups, work]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="anim-fade-up mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-black text-ink-900">داشبورد معاونت بهره‌برداری</h1>
          <p className="mt-1 text-[12.5px] font-bold text-ink-400">نمای کلان شرکت‌ها، قراردادها و گزارش‌های سراسر شبکه</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" icon={<Activity size={15} />} onClick={() => nav("/deputy/activity")}>رویدادها</Button>
          <Button size="sm" variant="dark" onClick={() => nav("/deputy/analytics")}>تحلیل پیشرفته</Button>
        </div>
      </div>

      {/* KPI band */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <KpiCard delay={0} label="شرکت فعال" value={faDigits(db.companies.filter((c) => c.isActive).length)} icon={<Building2 size={18} />} tone="primary" onClick={() => nav("/deputy/companies")} />
        <KpiCard delay={30} label="قرارداد فعال" value={faDigits(db.contracts.filter((c) => c.status === "active").length)} icon={<FileSignature size={18} />} tone="cyan" onClick={() => nav("/deputy/contracts")} />
        <KpiCard delay={60} label="گزارش امروز" value={faDigits(today.length)} icon={<FileText size={18} />} tone="sky" onClick={() => nav("/deputy/reports?bucket=today")} />
        <KpiCard delay={90} label="در انتظار" value={faDigits(pending.length)} icon={<ClipboardCheck size={18} />} tone="warn" onClick={() => nav("/deputy/reports?bucket=queue")} />
        <KpiCard delay={120} label="تایید نهایی" value={faDigits(approved.length)} icon={<CheckCircle2 size={18} />} tone="ok" onClick={() => nav("/deputy/reports?bucket=approved")} />
        <KpiCard delay={150} label="رد شده" value={faDigits(rejected.length)} icon={<XCircle size={18} />} tone="bad" onClick={() => nav("/deputy/reports?bucket=rejected")} />
        <KpiCard delay={180} label="هزینه تاییدشده" value={compactRial(approvedSum)} sub="ریال" icon={<Wallet size={18} />} tone="teal" onClick={() => nav("/deputy/reports?bucket=approved")} />
        <KpiCard delay={210} label="اختلافی" value={faDigits(disputed.length)} icon={<ShieldAlert size={18} />} tone={disputed.length ? "bad" : "ink"} onClick={() => nav("/deputy/reports?bucket=disputed")} />
      </div>

      {/* charts */}
      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <Card className="anim-fade-up lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] font-black text-ink-700">روند گزارش‌ها و هزینه (۱۴ روز اخیر)</p>
            <button onClick={() => nav("/deputy/analytics")} className="text-[11.5px] font-black text-primary-600 hover:text-primary-700">جزئیات بیشتر</button>
          </div>
          <div dir="ltr" className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="depTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="depCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9.5, fontFamily: "Vazirmatn", fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={1} />
                <YAxis yAxisId="l" allowDecimals={false} tick={{ fontSize: 9.5, fontFamily: "Vazirmatn", fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 9.5, fontFamily: "Vazirmatn", fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontFamily: "Vazirmatn", fontSize: 12, borderRadius: 12, border: "1px solid #e2e8f0" }} />
                <Area yAxisId="l" type="monotone" dataKey="count" name="تعداد گزارش" stroke="#2563eb" strokeWidth={2.5} fill="url(#depTrend)" />
                <Area yAxisId="r" type="monotone" dataKey="cost" name="هزینه (میلیون ریال)" stroke="#14b8a6" strokeWidth={2} fill="url(#depCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="anim-fade-up">
          <p className="mb-3 text-[13px] font-black text-ink-700">توزیع وضعیت گزارش‌ها</p>
          <div dir="ltr" className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusDist} dataKey="value" nameKey="name" innerRadius={38} outerRadius={62} paddingAngle={3} strokeWidth={0}>
                  {statusDist.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: "Vazirmatn", fontSize: 12, borderRadius: 12, border: "1px solid #e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
            {statusDist.map((s) => (
              <span key={s.name} className="flex items-center gap-1 text-[10.5px] font-bold text-ink-400">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.name} ({faDigits(s.value)})
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* companies + alerts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card pad={false} className="anim-fade-up">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-[13px] font-black text-ink-700">وضعیت شرکت‌های پیمانکار</p>
            <button onClick={() => nav("/deputy/companies")} className="text-[11.5px] font-black text-primary-600 hover:text-primary-700">مدیریت شرکت‌ها</button>
          </div>
          <div className="divide-y divide-line/70">
            {db.companies.map((c) => {
              const reps = db.reports.filter((r) => r.companyId === c.id && r.reportType === "work_report");
              const sum = reps.filter((r) => r.status === "approved" || r.status === "settled").reduce((s, r) => s + reportTotal(r.id), 0);
              const ceo = db.users.find((u) => u.id === c.contractorCeoUserId);
              return (
                <button key={c.id} onClick={() => nav(`/deputy/companies/${c.id}`)} className="flex w-full items-center gap-3 px-4 py-3.5 text-start transition-colors hover:bg-primary-50/40">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-primary-50 text-primary-600"><Building2 size={18} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-black text-ink-900">{c.name}</p>
                    <p className="mt-0.5 text-[11px] font-bold text-ink-400">{ceo?.fullName} — {faDigits(reps.length)} گزارش</p>
                  </div>
                  <div className="shrink-0 text-left">
                    <p className="tnum text-[12.5px] font-black text-ink-800">{compactRial(sum)} <span className="text-[10px] text-ink-300">ریال</span></p>
                    <Badge className={c.isActive ? "mt-1 border-green-200 bg-ok-50 text-ok-700" : "mt-1 border-red-200 bg-bad-50 text-bad-700"}>{c.isActive ? "فعال" : "غیرفعال"}</Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card pad={false} className="anim-fade-up">
            <p className="flex items-center gap-1.5 border-b border-line px-4 py-3 text-[13px] font-black text-ink-700"><AlertTriangle size={15} className="text-warn-600" /> هشدارها و موارد نیازمند اقدام</p>
            <div className="divide-y divide-line/70">
              {pendingStatements.map((s) => (
                <button key={s.id} onClick={() => nav("/deputy/statements")} className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-warn-50/60">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-teal-50 text-teal-600"><Receipt size={16} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-black text-ink-800">صورت‌وضعیت در انتظار بررسی</span>
                    <span className="tnum block text-[11px] font-bold text-ink-400">{formatRial(s.totalAmount)} — {relativeTime(s.createdAt)}</span>
                  </span>
                  <ChevronLeft size={16} className="text-ink-300" />
                </button>
              ))}
              {disputed.map((r) => (
                <button key={r.id} onClick={() => nav(`/deputy/reports/${r.id}`)} className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-bad-50/60">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-bad-50 text-bad-600"><ShieldAlert size={16} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-black text-ink-800">گزارش دارای اختلاف — {userName(r.userId)}</span>
                    <span className="tnum block text-[11px] font-bold text-ink-400">{jalaliKeyToDisplay(r.reportDateJ)} — {formatRial(reportTotal(r.id), false)} ریال</span>
                  </span>
                  <ChevronLeft size={16} className="text-ink-300" />
                </button>
              ))}
              {pendingStatements.length === 0 && disputed.length === 0 && (
                <p className="px-4 py-6 text-center text-[12px] font-bold text-ink-300">مورد بحرانی وجود ندارد.</p>
              )}
            </div>
          </Card>

          <Card pad={false} className="anim-fade-up">
            <p className="border-b border-line px-4 py-3 text-[13px] font-black text-ink-700">آخرین رویدادها</p>
            <div className="divide-y divide-line/70">
              {[...db.auditLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                  <Avatar name={userName(a.actorUserId)} size={30} />
                  <p className="min-w-0 flex-1 truncate text-[12px] font-bold text-ink-600">{userName(a.actorUserId)} — {a.action}</p>
                  <span className="shrink-0 text-[10.5px] font-bold text-ink-300">{relativeTime(a.createdAt)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ============================ companies ============================ */

function CompanyForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addCompany } = useStore();
  const toast = useToast();
  const [f, setF] = useState({ name: "", code: "", ceoName: "", ceoMobile: "", phone: "", address: "", description: "" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const submit = () => {
    const res = addCompany(f);
    if (res.ok) { onClose(); setF({ name: "", code: "", ceoName: "", ceoMobile: "", phone: "", address: "", description: "" }); }
    else toast(res.message, "error");
  };
  return (
    <Modal open={open} onClose={onClose} title="افزودن شرکت پیمانکار" wide footer={
      <>
        <Button full onClick={submit} icon={<Plus size={17} />}>ایجاد شرکت و حساب رییس</Button>
        <Button full variant="outline" onClick={onClose}>انصراف</Button>
      </>
    }>
      <div className="grid gap-x-3 md:grid-cols-2">
        <Field label="نام شرکت" required><Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="شرکت خدمات فنی ..." /></Field>
        <Field label="کد شرکت" required><Input ltr value={f.code} onChange={(e) => set("code", e.target.value)} placeholder="TGS-02" /></Field>
        <Field label="نام مسئول (رییس شرکت)" required><Input value={f.ceoName} onChange={(e) => set("ceoName", e.target.value)} /></Field>
        <Field label="شماره موبایل مسئول" required hint="حساب ورود رییس شرکت با این شماره ساخته می‌شود."><Input ltr inputMode="numeric" value={f.ceoMobile} onChange={(e) => set("ceoMobile", e.target.value)} placeholder="09xxxxxxxxx" maxLength={14} /></Field>
        <Field label="تلفن شرکت"><Input ltr value={f.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="نشانی"><Input value={f.address} onChange={(e) => set("address", e.target.value)} /></Field>
      </div>
      <Field label="توضیحات"><Textarea value={f.description} onChange={(e) => set("description", e.target.value)} className="min-h-[70px]" /></Field>
    </Modal>
  );
}

export function CompaniesPage({ param }: { param?: string }) {
  const store = useStore();
  const { db, userName, toggleEntity, reportTotal } = store;
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("");
  const [open, setOpen] = useState(false);

  if (param) return <CompanyDetail id={param} />;

  const list = db.companies
    .filter((c) => (statusF === "active" ? c.isActive : statusF === "inactive" ? !c.isActive : true))
    .filter((c) => (q.trim() ? c.name.includes(q.trim()) : true));

  return (
    <div>
      <PageHeader title="شرکت‌های پیمانکار" subtitle="تعریف شرکت و ایجاد حساب رییس شرکت"
        actions={<Button icon={<Plus size={17} />} onClick={() => setOpen(true)}>افزودن شرکت</Button>} />
      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row">
        <SearchBar value={q} onChange={setQ} placeholder="جستجوی نام شرکت..." className="flex-1" />
        <Select value={statusF} onChange={setStatusF} placeholder="همه وضعیت‌ها" options={[{ value: "active", label: "فعال" }, { value: "inactive", label: "غیرفعال" }]} className="sm:w-44" />
      </div>
      {list.length === 0 ? (
        <Card><EmptyState icon={<Building2 size={28} />} title="شرکتی یافت نشد" action={<Button variant="soft" icon={<Plus size={16} />} onClick={() => setOpen(true)}>افزودن شرکت</Button>} /></Card>
      ) : (
        <div className="stagger grid gap-3 md:grid-cols-2">
          {list.map((c) => {
            const reps = db.reports.filter((r) => r.companyId === c.id && r.reportType === "work_report");
            const contracts = db.contracts.filter((x) => x.contractorCompanyId === c.id);
            return (
              <Card key={c.id} onClick={() => nav(`/deputy/companies/${c.id}`)}>
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-primary-50 text-primary-600"><Building2 size={22} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[14.5px] font-black text-ink-900">{c.name}</p>
                      <Badge className={c.isActive ? "border-green-200 bg-ok-50 text-ok-700" : "border-red-200 bg-bad-50 text-bad-700"}>{c.isActive ? "فعال" : "غیرفعال"}</Badge>
                    </div>
                    <p className="mt-1 text-[11.5px] font-bold text-ink-400">مسئول: {c.contractorCeoUserId ? userName(c.contractorCeoUserId) : "—"}</p>
                    <div className="tnum mt-2.5 flex gap-4 text-[11.5px] font-black text-ink-400">
                      <span>{faDigits(contracts.length)} قرارداد</span>
                      <span>{faDigits(reps.length)} گزارش</span>
                      <span className="text-primary-700">{compactRial(reps.filter((r) => r.status === "approved" || r.status === "settled").reduce((s, r) => s + reportTotal(r.id), 0))} ریال تاییدشده</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <CompanyForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function CompanyDetail({ id }: { id: string }) {
  const store = useStore();
  const { db, userName, userGroups } = store;
  const c = db.companies.find((x) => x.id === id);
  if (!c) return <Card><EmptyState title="شرکت یافت نشد" action={<Button variant="soft" onClick={() => nav("/deputy/companies")}>بازگشت</Button>} /></Card>;
  const ceo = db.users.find((u) => u.id === c.contractorCeoUserId);
  const contracts = db.contracts.filter((x) => x.contractorCompanyId === id);
  const personnel = db.users.filter((u) => u.companyId === id);
  const groups = db.groups.filter((g) => g.companyId === id);
  const reps = db.reports.filter((r) => r.companyId === id && r.reportType === "work_report");

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={c.name} subtitle={`کد ${c.code}`} onBack={() => nav("/deputy/companies")} />
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="anim-fade-up">
          <p className="mb-2 text-[13px] font-black text-ink-700">اطلاعات شرکت</p>
          <KeyValue k="کد" v={c.code} ltr />
          <KeyValue k="تلفن" v={c.phone || "—"} ltr />
          <KeyValue k="نشانی" v={c.address || "—"} />
          <KeyValue k="وضعیت" v={c.isActive ? "فعال" : "غیرفعال"} />
          {c.description && <p className="mt-3 rounded-[12px] bg-slate-50 p-3 text-[12px] leading-6 text-ink-500">{c.description}</p>}
        </Card>
        <Card className="anim-fade-up">
          <p className="mb-2 text-[13px] font-black text-ink-700">رییس شرکت</p>
          {ceo ? (
            <div className="flex items-center gap-3 rounded-[16px] border border-line p-3.5">
              <Avatar name={ceo.fullName} size={44} />
              <div>
                <p className="text-[14px] font-black text-ink-900">{ceo.fullName}</p>
                <p className="tnum mt-0.5 text-[11.5px] font-bold text-ink-300" dir="ltr">••••{ceo.mobile.slice(7)}</p>
              </div>
            </div>
          ) : <p className="text-[12.5px] font-bold text-ink-300">رییس شرکت تعیین نشده است.</p>}
          <p className="mb-2 mt-4 text-[13px] font-black text-ink-700">آمار</p>
          <KeyValue k="نیروها" v={faDigits(personnel.length)} />
          <KeyValue k="گروه‌ها" v={faDigits(groups.length)} />
          <KeyValue k="گزارش‌ها" v={faDigits(reps.length)} />
          <KeyValue k="قراردادها" v={faDigits(contracts.length)} />
        </Card>
      </div>
      <Card className="anim-fade-up mt-4" pad={false}>
        <p className="border-b border-line px-4 py-3 text-[13px] font-black text-ink-700">قراردادهای شرکت</p>
        {contracts.length === 0 ? <p className="px-4 py-5 text-center text-[12px] font-bold text-ink-300">قراردادی ثبت نشده است.</p> : (
          <div className="divide-y divide-line/70">
            {contracts.map((ct) => (
              <button key={ct.id} onClick={() => nav(`/deputy/contracts/${ct.id}`)} className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-primary-50/40">
                <FileSignature size={17} className="shrink-0 text-primary-600" />
                <span className="min-w-0 flex-1 truncate text-[13px] font-black text-ink-800">{ct.title}</span>
                <Badge className={ct.status === "active" ? "border-green-200 bg-ok-50 text-ok-700" : "border-slate-200 bg-slate-50 text-ink-400"}>{ct.status === "active" ? "فعال" : ct.status === "completed" ? "تکمیل شده" : "خاتمه یافته"}</Badge>
                <ChevronLeft size={16} className="text-ink-300" />
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ============================ contracts ============================ */

function ContractForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useStore();
  const { db, addContract } = store;
  const toast = useToast();
  const [f, setF] = useState({ title: "", contractType: "unit_price" as ContractType, contractorCompanyId: db.companies[0]?.id || "", startDateJ: "", endDateJ: "", status: "active" as ContractStatus, publicNotes: "" });
  const submit = () => {
    const res = addContract(f);
    if (res.ok) { onClose(); setF({ ...f, title: "", startDateJ: "", endDateJ: "", publicNotes: "" }); }
    else toast(res.message, "error");
  };
  return (
    <Modal open={open} onClose={onClose} title="ثبت قرارداد جدید" wide footer={
      <>
        <Button full onClick={submit} icon={<Plus size={17} />}>ثبت قرارداد</Button>
        <Button full variant="outline" onClick={onClose}>انصراف</Button>
      </>
    }>
      <Field label="عنوان قرارداد" required><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="نگهداری و بهره‌برداری شبکه ..." /></Field>
      <div className="grid gap-x-3 md:grid-cols-2">
        <Field label="نوع قرارداد">
          <Select value={f.contractType} onChange={(v) => setF({ ...f, contractType: v as ContractType })} options={(Object.keys(CONTRACT_TYPE_LABEL) as ContractType[]).map((k) => ({ value: k, label: CONTRACT_TYPE_LABEL[k] }))} />
        </Field>
        <Field label="شرکت پیمانکار">
          <Select value={f.contractorCompanyId} onChange={(v) => setF({ ...f, contractorCompanyId: v })} options={db.companies.map((c) => ({ value: c.id, label: c.name }))} />
        </Field>
        <JalaliDateInput label="تاریخ شروع (شمسی)" value={f.startDateJ} onChange={(v) => setF({ ...f, startDateJ: v })} />
        <JalaliDateInput label="تاریخ پایان (شمسی)" value={f.endDateJ} onChange={(v) => setF({ ...f, endDateJ: v })} />
      </div>
      <Field label="توضیحات عمومی"><Textarea value={f.publicNotes} onChange={(e) => setF({ ...f, publicNotes: e.target.value })} className="min-h-[70px]" /></Field>
      <p className="flex items-start gap-2 rounded-[14px] border border-red-200 bg-bad-50 px-3.5 py-3 text-[12px] font-bold leading-6 text-bad-700">
        <ShieldAlert size={17} className="mt-0.5 shrink-0" />
        اطلاعات محرمانه قرارداد (مبالغ محرمانه، اسناد مالی و پیوست‌های طبقه‌بندی‌شده) نباید در سامانه ثبت شود؛ فقط اطلاعات عمومی ذخیره می‌شود.
      </p>
    </Modal>
  );
}

export function ContractsPage({ param }: { param?: string }) {
  const { db, companyName } = useStore();
  const [companyF, setCompanyF] = useState("");
  const [statusF, setStatusF] = useState("");
  const [typeF, setTypeF] = useState("");
  const [open, setOpen] = useState(false);

  if (param) return <ContractDetail id={param} />;

  const list = db.contracts
    .filter((c) => (companyF ? c.contractorCompanyId === companyF : true))
    .filter((c) => (statusF ? c.status === statusF : true))
    .filter((c) => (typeF ? c.contractType === typeF : true));

  return (
    <div>
      <PageHeader title="قراردادها" subtitle="فقط اطلاعات عمومی قراردادها در سامانه ذخیره می‌شود"
        actions={<Button icon={<Plus size={17} />} onClick={() => setOpen(true)}>ثبت قرارداد</Button>} />
      <div className="mb-4 grid gap-2.5 sm:grid-cols-3">
        <Select value={companyF} onChange={setCompanyF} placeholder="همه شرکت‌ها" options={db.companies.map((c) => ({ value: c.id, label: c.name }))} />
        <Select value={typeF} onChange={setTypeF} placeholder="همه انواع" options={(Object.keys(CONTRACT_TYPE_LABEL) as ContractType[]).map((k) => ({ value: k, label: CONTRACT_TYPE_LABEL[k] }))} />
        <Select value={statusF} onChange={setStatusF} placeholder="همه وضعیت‌ها" options={[{ value: "active", label: "فعال" }, { value: "completed", label: "تکمیل شده" }, { value: "terminated", label: "خاتمه یافته" }]} />
      </div>
      {list.length === 0 ? (
        <Card><EmptyState icon={<FileSignature size={28} />} title="قراردادی یافت نشد" action={<Button variant="soft" icon={<Plus size={16} />} onClick={() => setOpen(true)}>ثبت قرارداد</Button>} /></Card>
      ) : (
        <div className="stagger space-y-2.5">
          {list.map((c) => (
            <Card key={c.id} onClick={() => nav(`/deputy/contracts/${c.id}`)}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-primary-50 text-primary-600"><FileSignature size={20} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-black text-ink-900">{c.title}</p>
                  <p className="tnum mt-1 text-[11.5px] font-bold text-ink-400">
                    {companyName(c.contractorCompanyId)} — {CONTRACT_TYPE_LABEL[c.contractType]} — {jalaliKeyToDisplay(c.startDateJ)} تا {jalaliKeyToDisplay(c.endDateJ)}
                  </p>
                </div>
                <Badge className={c.status === "active" ? "border-green-200 bg-ok-50 text-ok-700" : c.status === "completed" ? "border-sky-200 bg-sky-50 text-sky-700" : "border-slate-200 bg-slate-50 text-ink-400"}>
                  {c.status === "active" ? "فعال" : c.status === "completed" ? "تکمیل شده" : "خاتمه یافته"}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
      <ContractForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function ContractDetail({ id }: { id: string }) {
  const { db, companyName } = useStore();
  const c = db.contracts.find((x) => x.id === id);
  if (!c) return <Card><EmptyState title="قرارداد یافت نشد" action={<Button variant="soft" onClick={() => nav("/deputy/contracts")}>بازگشت</Button>} /></Card>;
  const groups = db.groups.filter((g) => g.contractId === id);
  const items = db.priceItems.filter((p) => p.contractId === id);
  const reps = db.reports.filter((r) => r.contractId === id && r.reportType === "work_report");

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={c.title} subtitle={`${companyName(c.contractorCompanyId)} — ${CONTRACT_TYPE_LABEL[c.contractType]}`} onBack={() => nav("/deputy/contracts")}
        actions={<Badge className={c.status === "active" ? "border-green-200 bg-ok-50 text-ok-700" : "border-slate-200 bg-slate-50 text-ink-400"}>{c.status === "active" ? "فعال" : c.status === "completed" ? "تکمیل شده" : "خاتمه یافته"}</Badge>} />
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="anim-fade-up">
          <p className="mb-2 text-[13px] font-black text-ink-700">مشخصات</p>
          <KeyValue k="شرکت پیمانکار" v={companyName(c.contractorCompanyId)} />
          <KeyValue k="نوع قرارداد" v={CONTRACT_TYPE_LABEL[c.contractType]} />
          <KeyValue k="تاریخ شروع" v={jalaliKeyToDisplay(c.startDateJ)} />
          <KeyValue k="تاریخ پایان" v={jalaliKeyToDisplay(c.endDateJ)} />
          {c.publicNotes && <p className="mt-3 rounded-[12px] bg-slate-50 p-3 text-[12px] leading-6 text-ink-500">{c.publicNotes}</p>}
          <p className="mt-3 flex items-start gap-2 rounded-[12px] bg-warn-50 p-3 text-[11.5px] font-bold leading-6 text-warn-700">
            <ShieldAlert size={15} className="mt-0.5 shrink-0" /> اطلاعات محرمانه در سامانه ذخیره نشده است.
          </p>
        </Card>
        <Card className="anim-fade-up">
          <p className="mb-2 text-[13px] font-black text-ink-700">آمار قرارداد</p>
          <KeyValue k="گروه‌های کاری" v={faDigits(groups.length)} />
          <KeyValue k="آیتم‌های فهرست بها" v={faDigits(items.length)} />
          <KeyValue k="گزارش‌های ثبت‌شده" v={faDigits(reps.length)} />
          <KeyValue k="تایید نهایی‌شده" v={faDigits(reps.filter((r) => r.status === "approved" || r.status === "settled").length)} />
          <p className="mb-2 mt-4 text-[13px] font-black text-ink-700">گروه‌ها</p>
          <div className="flex flex-wrap gap-1.5">
            {groups.map((g) => <span key={g.id} className="rounded-full bg-primary-50 px-3 py-1 text-[11.5px] font-bold text-primary-700">{g.name}</span>)}
            {groups.length === 0 && <p className="text-[12px] font-bold text-ink-300">گروهی متصل نیست.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================ reports table ============================ */

const BUCKETS: { value: string; label: string }[] = [
  { value: "", label: "همه وضعیت‌ها" },
  { value: "queue", label: "در انتظار بررسی" },
  { value: "approved", label: "تایید نهایی" },
  { value: "rejected", label: "رد شده" },
  { value: "redo_requested", label: "انجام مجدد" },
  { value: "disputed", label: "اختلاف" },
  { value: "supervisor_review", label: "در انتظار سرپرست" },
  { value: "expert_review", label: "در انتظار کارشناس کارفرما" },
  { value: "employer_ceo_review", label: "در انتظار تایید نهایی" },
];

export function DeputyReports({ initialBucket }: { initialBucket?: string }) {
  const store = useStore();
  const { db, userName, companyName, groupName, reportTotal } = store;
  const [bucket, setBucket] = useState(initialBucket === "today" ? "" : initialBucket || "");
  const [companyF, setCompanyF] = useState("");
  const [contractF, setContractF] = useState("");
  const [groupF, setGroupF] = useState("");
  const [fromJ, setFromJ] = useState("");
  const [toJ, setToJ] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  React.useEffect(() => {
    if (initialBucket && initialBucket !== "today") setBucket(initialBucket);
  }, [initialBucket]);

  const list = useMemo(() => {
    let l = db.reports.filter((r) => r.reportType === "work_report");
    if (initialBucket === "today") l = l.filter((r) => r.reportDateJ === lastNDays(1)[0].key);
    if (bucket === "queue") l = l.filter((r) => PENDING.includes(r.status));
    else if (bucket) l = l.filter((r) => r.status === bucket);
    if (companyF) l = l.filter((r) => r.companyId === companyF);
    if (contractF) l = l.filter((r) => r.contractId === contractF);
    if (groupF) l = l.filter((r) => r.groupId === groupF);
    if (fromJ.length === 10) l = l.filter((r) => r.reportDateJ >= fromJ);
    if (toJ.length === 10) l = l.filter((r) => r.reportDateJ <= toJ);
    if (q.trim()) l = l.filter((r) => userName(r.userId).includes(q.trim()));
    return [...l].sort((a, b) => (b.submittedAt || b.createdAt).localeCompare(a.submittedAt || a.createdAt));
  }, [db.reports, bucket, companyF, contractF, groupF, fromJ, toJ, q, userName, initialBucket]);

  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  const pageItems = list.slice((page - 1) * pageSize, page * pageSize);

  const exportCsv = () => {
    downloadCSV(
      "گزارش‌های-سامانه.csv",
      ["تاریخ", "نیرو", "شرکت", "گروه", "وضعیت", "مبلغ (ریال)"],
      list.map((r) => [r.reportDateJ, userName(r.userId), companyName(r.companyId), groupName(r.groupId), REPORT_STATUS_META[r.status].label, reportTotal(r.id)])
    );
  };

  return (
    <div>
      <PageHeader title="گزارش‌های سامانه" subtitle={`${faDigits(list.length)} گزارش با فیلترهای جاری`}
        actions={
          <>
            <Button size="sm" variant="outline" icon={<Printer size={15} />} onClick={() => window.print()}>چاپ</Button>
            <Button size="sm" variant="soft" icon={<Download size={15} />} onClick={exportCsv}>خروجی CSV</Button>
          </>
        } />

      <Card className="mb-4">
        <div className="grid gap-2.5 md:grid-cols-3 lg:grid-cols-4">
          <SearchBar value={q} onChange={setQ} placeholder="جستجوی نام نیرو..." />
          <Select value={bucket} onChange={(v) => { setBucket(v); setPage(1); }} options={BUCKETS} />
          <Select value={companyF} onChange={(v) => { setCompanyF(v); setPage(1); }} placeholder="همه شرکت‌ها" options={db.companies.map((c) => ({ value: c.id, label: c.name }))} />
          <Select value={contractF} onChange={(v) => { setContractF(v); setPage(1); }} placeholder="همه قراردادها" options={db.contracts.map((c) => ({ value: c.id, label: c.title }))} />
          <Select value={groupF} onChange={(v) => { setGroupF(v); setPage(1); }} placeholder="همه گروه‌ها" options={db.groups.map((g) => ({ value: g.id, label: g.name }))} />
          <JalaliDateInput label="از تاریخ" value={fromJ} onChange={(v) => { setFromJ(v); setPage(1); }} />
          <JalaliDateInput label="تا تاریخ" value={toJ} onChange={(v) => { setToJ(v); setPage(1); }} />
        </div>
      </Card>

      {list.length === 0 ? (
        <Card><EmptyState icon={<FileText size={28} />} title="گزارشی با این فیلترها نیست" body="فیلترها را تغییر دهید یا بازه تاریخ راกว้าง‌تر کنید." /></Card>
      ) : (
        <div className="print-area">
          <Card pad={false} className="anim-fade-up hidden overflow-hidden md:block">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-line bg-slate-50/80 text-[11px] font-black text-ink-400">
                  <th className="px-4 py-3 text-start">تاریخ</th>
                  <th className="px-4 py-3 text-start">نیرو</th>
                  <th className="px-4 py-3 text-start">شرکت</th>
                  <th className="px-4 py-3 text-start">گروه</th>
                  <th className="px-4 py-3 text-start">مبلغ</th>
                  <th className="px-4 py-3 text-start">وضعیت</th>
                  <th className="w-10 px-2 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((r) => (
                  <tr key={r.id} onClick={() => nav(`/deputy/reports/${r.id}`)} className="cursor-pointer border-b border-line/60 transition-colors last:border-0 hover:bg-primary-50/40">
                    <td className="tnum px-4 py-3 font-bold text-ink-500">{jalaliKeyToDisplay(r.reportDateJ)}</td>
                    <td className="px-4 py-3 font-black text-ink-900">{userName(r.userId)}</td>
                    <td className="px-4 py-3 font-bold text-ink-500">{companyName(r.companyId)}</td>
                    <td className="px-4 py-3 font-bold text-ink-500">{groupName(r.groupId)}</td>
                    <td className="tnum px-4 py-3 font-black text-ink-900">{formatRial(reportTotal(r.id), false)}</td>
                    <td className="px-4 py-3"><StatusBadge meta={REPORT_STATUS_META[r.status]} /></td>
                    <td className="px-2 py-3 text-ink-300"><ChevronLeft size={16} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="stagger space-y-2.5 md:hidden">
            {pageItems.map((r) => (
              <Card key={r.id} onClick={() => nav(`/deputy/reports/${r.id}`)}>
                <div className="flex items-center gap-3">
                  <Avatar name={userName(r.userId)} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-black text-ink-900">{userName(r.userId)}</p>
                    <p className="mt-0.5 truncate text-[11px] font-bold text-ink-400">{groupName(r.groupId)} — {jalaliKeyToDisplay(r.reportDateJ)}</p>
                  </div>
                  <div className="shrink-0 text-left">
                    <StatusBadge meta={REPORT_STATUS_META[r.status]} />
                    <p className="tnum mt-1 text-[12px] font-black text-ink-700">{formatRial(reportTotal(r.id), false)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={page} pages={pages} onPage={setPage} />
        </div>
      )}
    </div>
  );
}

/* ============================ analytics ============================ */

export function AnalyticsPage() {
  const store = useStore();
  const { db, reportTotal, groupName } = store;
  const [range, setRange] = useState(14);
  const [statusF, setStatusF] = useState("");
  const [groupF, setGroupF] = useState("");

  const days = lastNDays(range);
  const keys = new Set(days.map((d) => d.key));
  const work = db.reports.filter((r) => r.reportType === "work_report" && keys.has(r.reportDateJ))
    .filter((r) => (statusF ? (statusF === "queue" ? PENDING.includes(r.status) : r.status === statusF) : true))
    .filter((r) => (groupF ? r.groupId === groupF : true));

  const trend = days.map((d) => ({
    label: d.label,
    count: work.filter((r) => r.reportDateJ === d.key).length,
    cost: work.filter((r) => r.reportDateJ === d.key && (r.status === "approved" || r.status === "settled")).reduce((s, r) => s + reportTotal(r.id), 0) / 1000000,
  }));

  const statusDist = (["supervisor_review", "expert_review", "employer_ceo_review", "approved", "rejected", "redo_requested", "disputed"] as const)
    .map((k, i) => ({ name: REPORT_STATUS_META[k].label, value: work.filter((r) => r.status === k).length, color: PIE_COLORS[i] }))
    .filter((x) => x.value > 0);

  const byGroup = db.groups.map((g) => ({ name: g.name.replace("گروه ", ""), count: work.filter((r) => r.groupId === g.id).length })).filter((x) => x.count > 0);
  const totalApproved = work.filter((r) => r.status === "approved" || r.status === "settled").reduce((s, r) => s + reportTotal(r.id), 0);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="تحلیل و گزارش‌گیری" subtitle="فیلترها را تغییر دهید؛ همه نمودارها زنده به‌روز می‌شوند" />
      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex gap-1.5">
            {[7, 14, 30].map((d) => (
              <button key={d} onClick={() => setRange(d)} className={cx("press h-9 rounded-full px-4 text-[12px] font-black", range === d ? "bg-ink-900 text-white" : "bg-slate-100 text-ink-500")}>{faDigits(d)} روز</button>
            ))}
          </div>
          <Select value={statusF} onChange={setStatusF} options={BUCKETS} className="w-52" />
          <Select value={groupF} onChange={setGroupF} placeholder="همه گروه‌ها" options={db.groups.map((g) => ({ value: g.id, label: g.name }))} className="w-52" />
          <button onClick={() => nav("/deputy/reports")} className="ms-auto text-[12px] font-black text-primary-600 hover:text-primary-700">مشاهده ریز گزارش‌ها</button>
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard delay={0} label="گزارش‌های بازه" value={faDigits(work.length)} icon={<FileText size={18} />} tone="primary" />
        <KpiCard delay={40} label="تایید نهایی" value={faDigits(work.filter((r) => r.status === "approved" || r.status === "settled").length)} icon={<CheckCircle2 size={18} />} tone="ok" />
        <KpiCard delay={80} label="رد / اختلاف" value={faDigits(work.filter((r) => ["rejected", "disputed"].includes(r.status)).length)} icon={<XCircle size={18} />} tone="bad" />
        <KpiCard delay={120} label="هزینه تاییدشده" value={compactRial(totalApproved)} sub="ریال" icon={<Wallet size={18} />} tone="teal" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="anim-fade-up">
          <p className="mb-3 text-[13px] font-black text-ink-700">روند تعداد گزارش و هزینه تاییدشده</p>
          <div dir="ltr" className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fontFamily: "Vazirmatn", fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={range > 14 ? 3 : 1} />
                <YAxis yAxisId="l" allowDecimals={false} tick={{ fontSize: 9, fontFamily: "Vazirmatn", fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 9, fontFamily: "Vazirmatn", fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontFamily: "Vazirmatn", fontSize: 12, borderRadius: 12, border: "1px solid #e2e8f0" }} />
                <Bar yAxisId="l" dataKey="count" name="گزارش" fill="#2563eb" radius={[5, 5, 0, 0]} maxBarSize={13} />
                <Bar yAxisId="r" dataKey="cost" name="هزینه (میلیون ریال)" fill="#14b8a6" radius={[5, 5, 0, 0]} maxBarSize={13} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="anim-fade-up">
          <p className="mb-3 text-[13px] font-black text-ink-700">توزیع وضعیت در بازه</p>
          <div dir="ltr" className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusDist} dataKey="value" nameKey="name" innerRadius={44} outerRadius={76} paddingAngle={3} strokeWidth={0}>
                  {statusDist.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: "Vazirmatn", fontSize: 12, borderRadius: 12, border: "1px solid #e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="anim-fade-up lg:col-span-2">
          <p className="mb-3 text-[13px] font-black text-ink-700">عملکرد گروه‌ها در بازه</p>
          {byGroup.length === 0 ? <p className="py-6 text-center text-[12px] font-bold text-ink-300">داده‌ای در این بازه نیست.</p> : (
            <div dir="ltr" className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byGroup} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fontFamily: "Vazirmatn", fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10.5, fontFamily: "Vazirmatn", fill: "#334155", fontWeight: 700 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontFamily: "Vazirmatn", fontSize: 12, borderRadius: 12, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="count" name="گزارش" fill="#3b82f6" radius={[0, 6, 6, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ============================ settings ============================ */

export function DeputySettings() {
  const { db, resetAll, user } = useStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const org = db.organizations.find((o) => o.type === "deputy");
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="تنظیمات سامانه" subtitle="پیکربندی و نگهداری" />
      <Card className="anim-fade-up mb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-primary-50 text-primary-600"><Landmark size={22} /></span>
          <div>
            <p className="text-[14.5px] font-black text-ink-900">{org?.name}</p>
            <p className="mt-0.5 text-[11.5px] font-bold text-ink-400">{org?.description}</p>
          </div>
        </div>
        <div className="mt-4">
          <KeyValue k="کاربران سامانه" v={faDigits(db.users.length)} />
          <KeyValue k="شرکت‌ها" v={faDigits(db.companies.length)} />
          <KeyValue k="قراردادها" v={faDigits(db.contracts.length)} />
          <KeyValue k="گزارش‌ها" v={faDigits(db.reports.length)} />
          <KeyValue k="رویدادهای ثبت‌شده" v={faDigits(db.auditLogs.length)} />
        </div>
      </Card>

      <Card className="anim-fade-up mb-4 border-red-200">
        <p className="flex items-center gap-1.5 text-[13.5px] font-black text-bad-700"><AlertTriangle size={16} /> منطقه خطر</p>
        <p className="mt-1.5 text-[12.5px] leading-6 text-ink-500">بازنشانی داده‌ها، همه تغییرات را پاک و داده‌های نمونه توسعه را دوباره بارگذاری می‌کند.</p>
        <Button variant="dangerSoft" className="mt-3" icon={<RotateCcw size={16} />} onClick={() => setConfirmReset(true)}>بازنشانی داده‌های سامانه</Button>
      </Card>

      <Card className="anim-fade-up">
        <p className="text-[13px] font-black text-ink-700">درباره توان‌بان</p>
        <p className="mt-2 text-[12.5px] leading-7 text-ink-500">
          سامانه یکپارچه مدیریت نیروی انسانی، گزارش کار، تایید کارها، فهرست آحاد بها، قراردادها و صورت‌وضعیت برای معاونت بهره‌برداری برق منطقه‌ای سیستان و بلوچستان، کارفرما و شرکت‌های پیمانکار. نسخه ۱٫۰٫۰
        </p>
      </Card>

      <Confirm open={confirmReset} onClose={() => setConfirmReset(false)} tone="danger" confirmLabel="بازنشانی شود"
        title="بازنشانی داده‌ها" body="همه تغییرات شما پاک می‌شود و داده‌های نمونه توسعه بازگردانده می‌شود. این عمل قابل بازگشت نیست."
        onConfirm={() => { resetAll(); setConfirmReset(false); }} />
    </div>
  );
}

/* ============================ module ============================ */

export function DeputyModule({ page, param, query }: { page: string; param?: string; query: URLSearchParams }) {
  switch (page) {
    case "home": return <DeputyHome />;
    case "companies": return <CompaniesPage param={param} />;
    case "contracts": return <ContractsPage param={param} />;
    case "employer-users": return <UserAdmin />;
    case "units": return <UnitsAdmin />;
    case "reports":
      if (param) return <ReviewDetail id={param} backPath="/deputy/reports" />;
      return <DeputyReports initialBucket={query.get("bucket") || ""} />;
    case "analytics": return <AnalyticsPage />;
    case "statements": return <StatementManager mode="deputy" />;
    case "activity": return <ActivityTimeline title="رویدادهای سامانه" />;
    case "settings": return <DeputySettings />;
    default: return null;
  }
}
