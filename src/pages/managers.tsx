import React, { useMemo, useState } from "react";
import { Building2, ChevronLeft, Coins, FileText, HardHat, Plus, Power, Receipt, ShieldOff, Users, Wallet } from "lucide-react";
import { useStore } from "../store";
import type { Role, Statement } from "../types";
import { MEMBERSHIP_LABEL, REPORT_STATUS_META, ROLE_LABEL, STATEMENT_STATUS_META, CONTRACT_TYPE_LABEL } from "../types";
import { faDigits, formatRial, jalaliKeyToDisplay, maskMobile, nav, relativeTime, enDigits } from "../lib/utils";
import { Avatar, Badge, Button, Card, Confirm, EmptyState, Field, Input, KeyValue, Modal, PageHeader, SearchBar, Select, StatusBadge, Textarea, cx, useToast } from "../components/ui";

/* ------------------------- Jalali date input ------------------------- */

export function JalaliDateInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [jy, jm, jd] = value ? value.split("-") : ["1404", "", ""];
  const num = (s: string) => enDigits(s).replace(/\D/g, "");
  const set = (part: 0 | 1 | 2, v: string) => {
    const arr = [jy, jm, jd];
    arr[part] = v;
    onChange(arr[0] && arr[1] && arr[2] ? `${arr[0].padStart(4, "0")}-${arr[1].padStart(2, "0")}-${arr[2].padStart(2, "0")}` : arr.join("-"));
  };
  return (
    <div>
      {label && <label className="mb-1.5 block text-[13px] font-bold text-ink-700">{label}</label>}
      <div dir="ltr" className="flex items-center gap-1.5">
        <Input ltr inputMode="numeric" placeholder="روز" maxLength={2} value={jd ? faDigits(jd) : ""} onChange={(e) => set(2, num(e.target.value).slice(0, 2))} className="h-12 w-full text-center" />
        <span className="font-black text-ink-300">/</span>
        <Input ltr inputMode="numeric" placeholder="ماه" maxLength={2} value={jm ? faDigits(jm) : ""} onChange={(e) => set(1, num(e.target.value).slice(0, 2))} className="h-12 w-full text-center" />
        <span className="font-black text-ink-300">/</span>
        <Input ltr inputMode="numeric" placeholder="سال" maxLength={4} value={jy ? faDigits(jy) : ""} onChange={(e) => set(0, num(e.target.value).slice(0, 4))} className="h-12 w-full text-center" />
      </div>
    </div>
  );
}

/* ------------------------- Personnel (contractor ceo) ------------------------- */

const PERSONNEL_ROLES: Role[] = ["TECHNICIAN", "GROUP_SUPERVISOR", "RESIDENT_REP"];

export function PersonnelManager({ page, param }: { page: string; param?: string }) {
  const store = useStore();
  const { user, db, userGroups, addUser, toggleUserActive, toggleMembership, userName, reportTotal, userScore } = store;
  const [q, setQ] = useState("");
  const [roleF, setRoleF] = useState("");
  const [open, setOpen] = useState(false);
  const [deactivate, setDeactivate] = useState<string | null>(null);
  const toast = useToast();

  const [fName, setFName] = useState("");
  const [fMobile, setFMobile] = useState("");
  const [fRole, setFRole] = useState<Role>("TECHNICIAN");
  const [fGroups, setFGroups] = useState<string[]>([]);

  if (!user) return null;

  if (page === "personnel" && param) return <PersonnelDetail id={param} />;

  const personnel = db.users
    .filter((u) => u.companyId === user.companyId && u.id !== user.id)
    .filter((u) => (roleF ? u.role === roleF : true))
    .filter((u) => (q.trim() ? u.fullName.includes(q.trim()) : true));
  const companyGroups = db.groups.filter((g) => g.companyId === user.companyId && g.isActive);

  const submit = () => {
    const res = addUser({ fullName: fName, mobile: fMobile, role: fRole, groupIds: fRole === "RESIDENT_REP" ? [] : fGroups });
    if (res.ok) { setOpen(false); setFName(""); setFMobile(""); setFGroups([]); }
    else toast(res.message, "error");
  };

  return (
    <div>
      <PageHeader title="نیروهای شرکت" subtitle={`${faDigits(personnel.length)} نیروی فعال و غیرفعال`}
        actions={<Button icon={<Plus size={17} />} onClick={() => setOpen(true)}>افزودن نیرو</Button>} />
      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row">
        <SearchBar value={q} onChange={setQ} placeholder="جستجوی نام نیرو..." className="flex-1" />
        <Select value={roleF} onChange={setRoleF} placeholder="همه نقش‌ها" options={PERSONNEL_ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))} className="sm:w-52" />
      </div>

      {personnel.length === 0 ? (
        <Card><EmptyState icon={<HardHat size={28} />} title="نیرویی یافت نشد" body="با دکمه «افزودن نیرو» اولین کارشناس یا سرپرست گروه را ثبت کنید." action={<Button variant="soft" icon={<Plus size={16} />} onClick={() => setOpen(true)}>افزودن نیرو</Button>} /></Card>
      ) : (
        <div className="stagger space-y-2.5">
          {personnel.map((p) => (
            <Card key={p.id} onClick={() => nav(`/contractor-ceo/personnel/${p.id}`)}>
              <div className="flex items-center gap-3">
                <Avatar name={p.fullName} size={46} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14px] font-black text-ink-900">{p.fullName}</p>
                    <Badge className="border-primary-200 bg-primary-50 text-primary-700">{ROLE_LABEL[p.role]}</Badge>
                    {!p.isActive && <Badge className="border-red-200 bg-bad-50 text-bad-700">غیرفعال</Badge>}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-ink-300">
                    {userGroups(p.id).map((g) => <span key={g.id} className="rounded-full bg-slate-100 px-2 py-0.5 text-ink-500">{g.name}</span>)}
                    {userGroups(p.id).length === 0 && <span>بدون گروه</span>}
                    <span className="ms-auto">آخرین فعالیت: {relativeTime(p.lastLoginAt)}</span>
                  </div>
                </div>
                <ChevronLeft size={18} className="shrink-0 text-ink-300" />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="افزودن نیروی جدید" footer={
        <>
          <Button full onClick={submit} icon={<UserPlusIcon />}>ایجاد نیرو</Button>
          <Button full variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
        </>
      }>
        <Field label="نام و نام خانوادگی" required><Input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="مثلا: عبدالله شهلی‌بر" /></Field>
        <Field label="شماره موبایل" required hint="این شماره تنها راه ورود نیرو به سامانه است.">
          <Input ltr inputMode="numeric" value={fMobile} onChange={(e) => setFMobile(enDigits(e.target.value))} placeholder="09xxxxxxxxx" maxLength={14} />
        </Field>
        <Field label="نقش" required>
          <Select value={fRole} onChange={(v) => setFRole(v as Role)} options={PERSONNEL_ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))} />
        </Field>
        {fRole !== "RESIDENT_REP" && (
          <Field label="عضویت در گروه‌ها">
            <div className="flex flex-wrap gap-1.5">
              {companyGroups.map((g) => (
                <button key={g.id} onClick={() => setFGroups((p) => (p.includes(g.id) ? p.filter((x) => x !== g.id) : [...p, g.id]))}
                  className={cx("press rounded-full border px-3 py-1.5 text-[12px] font-bold", fGroups.includes(g.id) ? "border-primary-600 bg-primary-600 text-white" : "border-line bg-white text-ink-500")}>{g.name}</button>
              ))}
            </div>
          </Field>
        )}
      </Modal>
    </div>
  );
}

function UserPlusIcon() { return <Plus size={17} />; }

function PersonnelDetail({ id }: { id: string }) {
  const store = useStore();
  const { user, db, userName, userGroups, toggleUserActive, toggleMembership, reportTotal, userScore, groupName } = store;
  const [confirmDeact, setConfirmDeact] = useState(false);
  if (!user) return null;
  const p = db.users.find((u) => u.id === id);
  if (!p) return <Card><EmptyState title="نیرو یافت نشد" action={<Button variant="soft" onClick={() => nav("/contractor-ceo/personnel")}>بازگشت</Button>} /></Card>;

  const reports = db.reports.filter((r) => r.userId === p.id && r.reportType === "work_report").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const groups = userGroups(p.id);
  const companyGroups = db.groups.filter((g) => g.companyId === user.companyId);
  const scores = db.scoreEvents.filter((s) => s.userId === p.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={p.fullName} subtitle={ROLE_LABEL[p.role]} onBack={() => nav("/contractor-ceo/personnel")}
        actions={
          p.isActive
            ? <Button size="sm" variant="dangerSoft" icon={<Power size={15} />} onClick={() => setConfirmDeact(true)}>غیرفعال کردن</Button>
            : <Button size="sm" variant="success" icon={<Power size={15} />} onClick={() => toggleUserActive(p.id)}>فعال‌سازی</Button>
        } />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="anim-fade-up">
          <div className="mb-3 flex items-center gap-3">
            <Avatar name={p.fullName} size={52} />
            <div>
              <p className="text-[15px] font-black text-ink-900">{p.fullName}</p>
              <div className="mt-1 flex gap-1.5">
                <Badge className="border-primary-200 bg-primary-50 text-primary-700">{ROLE_LABEL[p.role]}</Badge>
                <Badge className={p.isActive ? "border-green-200 bg-ok-50 text-ok-700" : "border-red-200 bg-bad-50 text-bad-700"}>{p.isActive ? "فعال" : "غیرفعال"}</Badge>
              </div>
            </div>
          </div>
          <KeyValue k="شماره موبایل" v={maskMobile(p.mobile)} ltr />
          <KeyValue k="امتیاز کاری" v={`${faDigits(userScore(p.id))} امتیاز`} />
          <KeyValue k="آخرین ورود" v={relativeTime(p.lastLoginAt)} />
          <KeyValue k="عضو سامانه از" v={relativeTime(p.createdAt)} />
        </Card>

        <Card className="anim-fade-up" style-ignore="">
          <p className="mb-3 text-[13px] font-black text-ink-700">عضویت در گروه‌ها</p>
          <div className="space-y-2">
            {companyGroups.map((g) => {
              const member = groups.some((x) => x.id === g.id);
              return (
                <div key={g.id} className="flex items-center justify-between rounded-[14px] border border-line px-3.5 py-2.5">
                  <span className="text-[13px] font-bold text-ink-800">{g.name}</span>
                  <button onClick={() => toggleMembership(p.id, g.id, "member")}
                    className={cx("press rounded-full px-3 py-1 text-[11.5px] font-black", member ? "bg-ok-50 text-ok-700" : "bg-slate-100 text-ink-400")}>
                    {member ? "عضو است" : "افزودن به گروه"}
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="anim-fade-up mt-4">
        <p className="mb-3 text-[13px] font-black text-ink-700">آخرین گزارش‌ها ({faDigits(reports.length)})</p>
        {reports.length === 0 ? <p className="text-[12.5px] font-bold text-ink-300">هنوز گزارشی ثبت نکرده است.</p> : (
          <div className="divide-y divide-line/70">
            {reports.slice(0, 5).map((r) => (
              <button key={r.id} onClick={() => nav(`/contractor-ceo/reports/${r.id}`)} className="flex w-full items-center gap-3 py-2.5 text-start transition-colors hover:bg-primary-50/40">
                <span className="tnum text-[12px] font-black text-ink-400">{jalaliKeyToDisplay(r.reportDateJ)}</span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-ink-800">{groupName(r.groupId)}</span>
                <span className="tnum text-[12.5px] font-black text-ink-700">{formatRial(reportTotal(r.id), false)}</span>
                <StatusBadge meta={REPORT_STATUS_META[r.status]} />
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className="anim-fade-up mt-4">
        <p className="mb-3 text-[13px] font-black text-ink-700">امتیازهای کاری</p>
        {scores.length === 0 ? <p className="text-[12.5px] font-bold text-ink-300">پس از تایید نهایی گزارش‌ها، امتیاز مثبت اینجا ثبت می‌شود.</p> : (
          <div className="divide-y divide-line/70">
            {scores.map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-[12px] font-black text-warn-700">+{faDigits(s.score)}</span>
                <span className="flex-1 text-[12.5px] font-bold text-ink-600">{s.reason}</span>
                <span className="text-[11px] font-bold text-ink-300">{relativeTime(s.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Confirm open={confirmDeact} onClose={() => setConfirmDeact(false)} tone="danger" confirmLabel="غیرفعال شود"
        title="غیرفعال کردن نیرو" body="کاربر غیرفعال نمی‌تواند وارد سامانه شود. این عمل در رویدادها ثبت می‌شود."
        onConfirm={() => { toggleUserActive(p.id); setConfirmDeact(false); }} />
    </div>
  );
}

/* ------------------------- Groups (contractor ceo) ------------------------- */

export function GroupManager({ page, param }: { page: string; param?: string }) {
  const store = useStore();
  const { user, db, userName, addGroup, updateGroup, toggleMembership } = store;
  const [open, setOpen] = useState(false);
  const [fName, setFName] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fSup, setFSup] = useState("");
  const [fMembers, setFMembers] = useState<string[]>([]);
  const toast = useToast();

  if (!user) return null;
  if (page === "groups" && param) return <GroupDetail id={param} />;

  const groups = db.groups.filter((g) => g.companyId === user.companyId);
  const contracts = db.contracts.filter((c) => c.isActive);
  const personnel = db.users.filter((u) => u.companyId === user.companyId && u.id !== user.id && u.isActive && (u.role === "TECHNICIAN" || u.role === "GROUP_SUPERVISOR"));
  const memberCount = (gid: string) => db.memberships.filter((m) => m.groupId === gid && m.isActive && (m.membershipType === "member" || m.membershipType === "supervisor")).length;

  const submit = () => {
    if (!fName.trim()) { toast("نام گروه را وارد کنید", "error"); return; }
    const res = addGroup({ name: fName, description: fDesc || undefined, contractId: contracts[0]?.id || "", supervisorUserId: fSup || null, memberIds: fMembers });
    if (res.ok) { setOpen(false); setFName(""); setFDesc(""); setFSup(""); setFMembers([]); }
    else toast(res.message, "error");
  };

  return (
    <div>
      <PageHeader title="گروه‌های کاری" subtitle="هر گروه ایزوله است و فقط اعضا و بالادستی‌های مجاز آن را می‌بینند"
        actions={<Button icon={<Plus size={17} />} onClick={() => setOpen(true)}>گروه جدید</Button>} />
      {groups.length === 0 ? (
        <Card><EmptyState icon={<Users size={28} />} title="گروهی تعریف نشده" body="گروه‌های کاری شرکت خود را بسازید و نیروها را تخصیص دهید." action={<Button variant="soft" icon={<Plus size={16} />} onClick={() => setOpen(true)}>گروه جدید</Button>} /></Card>
      ) : (
        <div className="stagger grid gap-3 md:grid-cols-2">
          {groups.map((g) => (
            <Card key={g.id} onClick={() => nav(`/contractor-ceo/groups/${g.id}`)}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[14.5px] font-black text-ink-900">{g.name}</p>
                  {g.description && <p className="mt-1 line-clamp-2 text-[12px] leading-6 text-ink-400">{g.description}</p>}
                </div>
                {!g.isActive && <Badge className="border-red-200 bg-bad-50 text-bad-700">غیرفعال</Badge>}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] font-bold text-ink-400">
                <span className="flex items-center gap-1"><Users size={13} />{faDigits(memberCount(g.id))} عضو</span>
                <span className="flex items-center gap-1"><HardHat size={13} />سرپرست: {g.supervisorUserId ? userName(g.supervisorUserId) : "تعیین نشده"}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="ایجاد گروه کاری" footer={
        <>
          <Button full onClick={submit}>ایجاد گروه</Button>
          <Button full variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
        </>
      }>
        <Field label="نام گروه" required><Input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="مثلا: گروه خط و شبکه" /></Field>
        <Field label="توضیحات"><Textarea value={fDesc} onChange={(e) => setFDesc(e.target.value)} className="min-h-[70px]" placeholder="حوزه فعالیت گروه..." /></Field>
        <Field label="سرپرست گروه" hint="هر گروه فقط یک سرپرست اصلی دارد.">
          <Select value={fSup} onChange={setFSup} placeholder="انتخاب سرپرست..." options={personnel.map((p) => ({ value: p.id, label: `${p.fullName} — ${ROLE_LABEL[p.role]}` }))} />
        </Field>
        <Field label="اعضای گروه">
          <div className="flex flex-wrap gap-1.5">
            {personnel.filter((p) => p.role === "TECHNICIAN").map((p) => (
              <button key={p.id} onClick={() => setFMembers((prev) => (prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]))}
                className={cx("press rounded-full border px-3 py-1.5 text-[12px] font-bold", fMembers.includes(p.id) ? "border-primary-600 bg-primary-600 text-white" : "border-line bg-white text-ink-500")}>{p.fullName}</button>
            ))}
          </div>
        </Field>
      </Modal>
    </div>
  );
}

function GroupDetail({ id }: { id: string }) {
  const store = useStore();
  const { user, db, userName, groupMembers, updateGroup, toggleMembership } = store;
  const [name, setName] = useState("");
  const [sup, setSup] = useState<string>("");
  const [init, setInit] = useState(false);
  const toast = useToast();
  const g = db.groups.find((x) => x.id === id);

  React.useEffect(() => {
    if (g && !init) { setName(g.name); setSup(g.supervisorUserId || ""); setInit(true); }
  }, [g, init]);

  if (!user || !g) return <Card><EmptyState title="گروه یافت نشد" action={<Button variant="soft" onClick={() => nav("/contractor-ceo/groups")}>بازگشت</Button>} /></Card>;

  const members = groupMembers(id);
  const personnel = db.users.filter((u) => u.companyId === user.companyId && u.isActive && (u.role === "TECHNICIAN" || u.role === "GROUP_SUPERVISOR"));
  const nonMembers = personnel.filter((p) => !members.some((m) => m.user.id === p.id));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={g.name} subtitle="مدیریت گروه کاری" onBack={() => nav("/contractor-ceo/groups")} />
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="anim-fade-up">
          <p className="mb-3 text-[13px] font-black text-ink-700">مشخصات گروه</p>
          <Field label="نام گروه"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="سرپرست گروه">
            <Select value={sup} onChange={setSup} placeholder="بدون سرپرست" options={personnel.map((p) => ({ value: p.id, label: p.fullName }))} />
          </Field>
          <Button onClick={() => updateGroup(id, { name, supervisorUserId: sup || null })}>ذخیره تغییرات</Button>
        </Card>
        <Card className="anim-fade-up">
          <p className="mb-3 text-[13px] font-black text-ink-700">اعضا ({faDigits(members.length)})</p>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.user.id} className="flex items-center gap-2.5 rounded-[14px] border border-line px-3 py-2">
                <Avatar name={m.user.fullName} size={32} />
                <span className="min-w-0 flex-1 truncate text-[13px] font-black text-ink-800">{m.user.fullName}</span>
                <Badge className="border-slate-200 bg-slate-50 text-ink-400">{MEMBERSHIP_LABEL[m.type as keyof typeof MEMBERSHIP_LABEL] || m.type}</Badge>
                {m.type === "member" && (
                  <button onClick={() => toggleMembership(m.user.id, id, "member")} className="press text-[11px] font-black text-bad-600 hover:text-bad-700">حذف</button>
                )}
              </div>
            ))}
            {nonMembers.map((p) => (
              <div key={p.id} className="flex items-center gap-2.5 rounded-[14px] border border-dashed border-line px-3 py-2">
                <Avatar name={p.fullName} size={32} className="opacity-60" />
                <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-ink-400">{p.fullName}</span>
                <button onClick={() => toggleMembership(p.id, id, "member")} className="press rounded-full bg-primary-50 px-3 py-1 text-[11px] font-black text-primary-700 hover:bg-primary-100">افزودن به گروه</button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------- Price list ------------------------- */

export function PriceListManager() {
  const store = useStore();
  const { user, db, groupName, addPriceItem, updatePriceItem, toggleEntity } = store;
  const [q, setQ] = useState("");
  const [groupF, setGroupF] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const toast = useToast();

  const [fCode, setFCode] = useState("");
  const [fTitle, setFTitle] = useState("");
  const [fUnit, setFUnit] = useState("");
  const [fPrice, setFPrice] = useState("");
  const [fGroups, setFGroups] = useState<string[]>([]);

  if (!user) return null;
  const companyGroups = db.groups.filter((g) => g.companyId === user.companyId && g.isActive);

  const list = db.priceItems
    .filter((p) => (groupF ? p.groupIds.includes(groupF) : true))
    .filter((p) => (q.trim() ? p.title.includes(q.trim()) || p.code.includes(q.trim()) : true));

  const startEdit = (id: string) => {
    const p = db.priceItems.find((x) => x.id === id);
    if (!p) return;
    setEditing(id); setFCode(p.code); setFTitle(p.title); setFUnit(p.unit); setFPrice(String(p.unitPrice)); setFGroups(p.groupIds);
    setOpen(true);
  };
  const startNew = () => {
    setEditing(null); setFCode(""); setFTitle(""); setFUnit(""); setFPrice(""); setFGroups([]);
    setOpen(true);
  };

  const submit = () => {
    const price = parseInt(enDigits(fPrice).replace(/\D/g, "")) || 0;
    if (editing) {
      updatePriceItem(editing, { title: fTitle, unit: fUnit, unitPrice: price, groupIds: fGroups });
      setOpen(false);
      return;
    }
    const res = addPriceItem({ code: fCode, title: fTitle, unit: fUnit, unitPrice: price, contractId: db.contracts[0]?.id || "", groupIds: fGroups });
    if (res.ok) setOpen(false);
    else toast(res.message, "error");
  };

  return (
    <div>
      <PageHeader title="فهرست آحاد بها" subtitle="قیمت‌ها به ریال؛ تغییر قیمت روی گزارش‌های قبلی اثر نمی‌گذارد"
        actions={<Button icon={<Plus size={17} />} onClick={startNew}>آیتم جدید</Button>} />
      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row">
        <SearchBar value={q} onChange={setQ} placeholder="جستجوی کد یا عنوان..." className="flex-1" />
        <Select value={groupF} onChange={setGroupF} placeholder="همه گروه‌ها" options={companyGroups.map((g) => ({ value: g.id, label: g.name }))} className="sm:w-52" />
      </div>

      {list.length === 0 ? (
        <Card><EmptyState icon={<Coins size={28} />} title="آیتمی یافت نشد" body="آیتم‌های فهرست بها را اضافه کنید تا نیروها بتوانند گزارش ثبت کنند." action={<Button variant="soft" icon={<Plus size={16} />} onClick={startNew}>آیتم جدید</Button>} /></Card>
      ) : (
        <>
          <Card pad={false} className="anim-fade-up hidden overflow-hidden md:block">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line bg-slate-50/80 text-[11.5px] font-black text-ink-400">
                  <th className="px-4 py-3 text-start">کد</th><th className="px-4 py-3 text-start">عنوان</th>
                  <th className="px-4 py-3 text-start">واحد</th><th className="px-4 py-3 text-start">قیمت (ریال)</th>
                  <th className="px-4 py-3 text-start">گروه‌ها</th><th className="px-4 py-3 text-start">وضعیت</th><th className="w-24 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="border-b border-line/60 last:border-0 hover:bg-primary-50/30">
                    <td className="tnum px-4 py-3 font-black text-ink-500" dir="ltr">{p.code}</td>
                    <td className="px-4 py-3 font-black text-ink-900">{p.title}</td>
                    <td className="px-4 py-3 font-bold text-ink-500">{p.unit}</td>
                    <td className="tnum px-4 py-3 font-black text-primary-700">{formatRial(p.unitPrice, false)}</td>
                    <td className="px-4 py-3">
                      <span className="flex flex-wrap gap-1">{p.groupIds.map((g) => <span key={g} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-ink-500">{groupName(g)}</span>)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={p.isActive ? "border-green-200 bg-ok-50 text-ok-700" : "border-red-200 bg-bad-50 text-bad-700"}>{p.isActive ? "فعال" : "غیرفعال"}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex gap-2">
                        <button onClick={() => startEdit(p.id)} className="press text-[11.5px] font-black text-primary-600 hover:text-primary-700">ویرایش</button>
                        <button onClick={() => toggleEntity("priceItems", p.id)} className="press text-[11.5px] font-black text-ink-300 hover:text-bad-600">{p.isActive ? "غیرفعال" : "فعال"}</button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <div className="stagger space-y-2.5 md:hidden">
            {list.map((p) => (
              <Card key={p.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-black text-ink-900">{p.title}</p>
                    <p className="tnum mt-0.5 text-[11px] font-bold text-ink-300" dir="ltr">{p.code} — {p.unit}</p>
                  </div>
                  {!p.isActive && <Badge className="border-red-200 bg-bad-50 text-bad-700">غیرفعال</Badge>}
                </div>
                <p className="tnum mt-2 text-[14px] font-black text-primary-700">{formatRial(p.unitPrice)}</p>
                <div className="mt-2 flex flex-wrap gap-1">{p.groupIds.map((g) => <span key={g} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-ink-500">{groupName(g)}</span>)}</div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="soft" onClick={() => startEdit(p.id)}>ویرایش</Button>
                  <Button size="sm" variant="outline" onClick={() => toggleEntity("priceItems", p.id)}>{p.isActive ? "غیرفعال کردن" : "فعال کردن"}</Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "ویرایش آیتم بها" : "آیتم جدید فهرست بها"} footer={
        <>
          <Button full onClick={submit}>{editing ? "ذخیره تغییرات" : "افزودن آیتم"}</Button>
          <Button full variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
        </>
      }>
        {!editing && <Field label="کد آیتم" required><Input ltr value={fCode} onChange={(e) => setFCode(enDigits(e.target.value))} placeholder="010103" /></Field>}
        <Field label="عنوان" required><Input value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="مثلا: تعویض کلید هوایی" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="واحد" required><Input value={fUnit} onChange={(e) => setFUnit(e.target.value)} placeholder="دستگاه / متر / کیلومتر" /></Field>
          <Field label="قیمت واحد (ریال)" required><Input ltr inputMode="numeric" value={fPrice} onChange={(e) => setFPrice(e.target.value)} placeholder="۸۵۰۰۰۰" /></Field>
        </div>
        <Field label="گروه‌های دارای دسترسی" required hint="تکنسین فقط آیتم‌های گروه‌های خودش را می‌بیند.">
          <div className="flex flex-wrap gap-1.5">
            {companyGroups.map((g) => (
              <button key={g.id} onClick={() => setFGroups((p) => (p.includes(g.id) ? p.filter((x) => x !== g.id) : [...p, g.id]))}
                className={cx("press rounded-full border px-3 py-1.5 text-[12px] font-bold", fGroups.includes(g.id) ? "border-primary-600 bg-primary-600 text-white" : "border-line bg-white text-ink-500")}>{g.name}</button>
            ))}
          </div>
        </Field>
        {editing && <p className="rounded-[12px] bg-amber-50 px-3 py-2 text-[11.5px] font-bold leading-6 text-warn-700">تغییر قیمت فقط روی گزارش‌های جدید اثر دارد؛ مبالغ گزارش‌های قبلی به‌صورت Snapshot حفظ می‌شوند.</p>}
      </Modal>
    </div>
  );
}

/* ------------------------- Statements ------------------------- */

export function StatementManager({ mode }: { mode: "contractor" | "deputy" }) {
  const store = useStore();
  const { user, db, userName, companyName, contractTitle, groupName, createStatement, decideStatement, reportTotal, reportById } = store;
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Statement | null>(null);
  const [deciding, setDeciding] = useState<{ id: string; approve: boolean } | null>(null);
  const [note, setNote] = useState("");
  const [contractId, setContractId] = useState(db.contracts[0]?.id || "");
  const [startJ, setStartJ] = useState("");
  const [endJ, setEndJ] = useState("");
  const toast = useToast();

  if (!user) return null;

  const statements = db.statements
    .filter((s) => (mode === "contractor" ? s.contractorCompanyId === user.companyId : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const used = new Set(db.statements.filter((s) => s.status !== "rejected").flatMap((s) => s.reportIds));
  const preview = useMemo(() => {
    if (!open || !user || mode !== "contractor") return [];
    const s = startJ.length === 10 ? startJ : "0000-00-00";
    const e = endJ.length === 10 ? endJ : "9999-99-99";
    return db.reports.filter((r) =>
      r.companyId === user.companyId && r.contractId === contractId && r.status === "approved" &&
      r.reportDateJ >= s && r.reportDateJ <= e && !used.has(r.id)
    );
  }, [open, db.reports, user, contractId, startJ, endJ]);

  const previewTotal = preview.reduce((s, r) => s + reportTotal(r.id), 0);

  const submit = () => {
    if (startJ.length !== 10 || endJ.length !== 10) { toast("بازه تاریخ را کامل مشخص کنید", "error"); return; }
    const res = createStatement({ contractId, periodStartJ: startJ, periodEndJ: endJ });
    if (res.ok) { setOpen(false); setStartJ(""); setEndJ(""); }
    else toast(res.message, "error");
  };

  return (
    <div>
      <PageHeader title="صورت‌وضعیت‌ها" subtitle={mode === "contractor" ? "ساخت صورت‌وضعیت از گزارش‌های تایید نهایی‌شده" : "بررسی و تایید صورت‌وضعیت پیمانکاران"}
        actions={mode === "contractor" ? <Button icon={<Plus size={17} />} onClick={() => setOpen(true)}>صورت‌وضعیت جدید</Button> : undefined} />

      {statements.length === 0 ? (
        <Card><EmptyState icon={<Receipt size={28} />} title="صورت‌وضعیتی ثبت نشده" body={mode === "contractor" ? "از گزارش‌های تایید نهایی‌شده، صورت‌وضعیت بسازید." : "هنوز صورت‌وضعیتی ارسال نشده است."} /></Card>
      ) : (
        <div className="stagger space-y-2.5">
          {statements.map((s) => (
            <Card key={s.id} onClick={() => setDetail(s)}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-teal-50 text-teal-600"><Receipt size={20} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-black text-ink-900">{contractTitle(s.contractId)}</p>
                  <p className="tnum mt-0.5 text-[11.5px] font-bold text-ink-400">
                    {companyName(s.contractorCompanyId)} — بازه {jalaliKeyToDisplay(s.periodStartJ)} تا {jalaliKeyToDisplay(s.periodEndJ)} — {faDigits(s.reportIds.length)} گزارش
                  </p>
                </div>
                <div className="text-left">
                  <StatusBadge meta={STATEMENT_STATUS_META[s.status]} />
                  <p className="tnum mt-1.5 text-[14px] font-black text-ink-900">{formatRial(s.totalAmount)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* create */}
      <Modal open={open} onClose={() => setOpen(false)} title="صورت‌وضعیت جدید" wide footer={
        <>
          <Button full onClick={submit} disabled={preview.length === 0} icon={<Receipt size={18} />}>ارسال برای معاونت ({faDigits(preview.length)} گزارش)</Button>
          <Button full variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
        </>
      }>
        <Field label="قرارداد"><Select value={contractId} onChange={setContractId} options={db.contracts.filter((c) => c.isActive).map((c) => ({ value: c.id, label: c.title }))} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <JalaliDateInput label="از تاریخ" value={startJ} onChange={setStartJ} />
          <JalaliDateInput label="تا تاریخ" value={endJ} onChange={setEndJ} />
        </div>
        <div className="mt-4 rounded-[16px] border border-line bg-slate-50/70 p-4">
          <p className="mb-2 text-[12px] font-black text-ink-500">پیش‌نمایش گزارش‌های واجد شرایط (تایید نهایی و استفاده‌نشده)</p>
          {preview.length === 0 ? <p className="text-[12px] font-bold text-ink-300">با این بازه گزارش تاییدشده‌ای یافت نشد.</p> : (
            <>
              <div className="max-h-44 space-y-1.5 overflow-y-auto">
                {preview.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-[12px] font-bold text-ink-600">
                    <span>{userName(r.userId)} — {groupName(r.groupId)} — <span className="tnum">{jalaliKeyToDisplay(r.reportDateJ)}</span></span>
                    <span className="tnum font-black text-ink-800">{formatRial(reportTotal(r.id), false)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <span className="text-[13px] font-black text-ink-700">جمع صورت‌وضعیت</span>
                <span className="tnum text-[15px] font-black text-primary-700">{formatRial(previewTotal)}</span>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* detail */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="جزئیات صورت‌وضعیت" wide footer={
        mode === "deputy" && detail && detail.status === "submitted" ? (
          <>
            <Button full variant="success" onClick={() => { setDeciding({ id: detail.id, approve: true }); setNote(""); }}>تایید صورت‌وضعیت</Button>
            <Button full variant="danger" onClick={() => { setDeciding({ id: detail.id, approve: false }); setNote(""); }}>رد</Button>
          </>
        ) : <Button full variant="outline" onClick={() => setDetail(null)}>بستن</Button>
      }>
        {detail && (
          <>
            <KeyValue k="شرکت پیمانکار" v={companyName(detail.contractorCompanyId)} />
            <KeyValue k="قرارداد" v={contractTitle(detail.contractId)} />
            <KeyValue k="بازه" v={`${jalaliKeyToDisplay(detail.periodStartJ)} تا ${jalaliKeyToDisplay(detail.periodEndJ)}`} />
            <KeyValue k="ایجادکننده" v={userName(detail.createdByUserId)} />
            <KeyValue k="جمع کل" v={formatRial(detail.totalAmount)} />
            {detail.decisionNote && <KeyValue k="یادداشت تصمیم" v={detail.decisionNote} />}
            <p className="mb-2 mt-4 text-[12px] font-black text-ink-500">گزارش‌های شامل‌شده</p>
            <div className="space-y-1.5">
              {detail.reportIds.map((rid) => {
                const r = reportById(rid);
                if (!r) return null;
                return (
                  <div key={rid} className="flex items-center justify-between rounded-[12px] bg-slate-50 px-3 py-2 text-[12px] font-bold">
                    <span>{userName(r.userId)} — {groupName(r.groupId)}</span>
                    <span className="tnum font-black">{formatRial(reportTotal(rid), false)}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Modal>

      {/* decide note */}
      <Modal open={!!deciding} onClose={() => setDeciding(null)} title={deciding?.approve ? "تایید صورت‌وضعیت" : "رد صورت‌وضعیت"} footer={
        <>
          <Button full variant={deciding?.approve ? "success" : "danger"} onClick={() => {
            if (deciding && !deciding.approve && note.trim().length < 3) { toast("ثبت دلیل رد الزامی است", "error"); return; }
            if (deciding) decideStatement(deciding.id, deciding.approve, note.trim() || undefined);
            setDeciding(null); setDetail(null);
          }}>{deciding?.approve ? "تایید" : "رد صورت‌وضعیت"}</Button>
          <Button full variant="outline" onClick={() => setDeciding(null)}>انصراف</Button>
        </>
      }>
        <Field label={deciding?.approve ? "یادداشت (اختیاری)" : "دلیل رد (الزامی)"}>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="یادداشت..." className="min-h-[90px]" />
        </Field>
      </Modal>
    </div>
  );
}

/* ------------------------- Users admin (deputy) ------------------------- */

const EMPLOYER_ROLES: Role[] = ["EMPLOYER_CEO", "EMPLOYER_EXPERT", "CONTRACTOR_CEO"];

export function UserAdmin() {
  const store = useStore();
  const { db, addUser, toggleUserActive } = store;
  const [q, setQ] = useState("");
  const [roleF, setRoleF] = useState("");
  const [open, setOpen] = useState(false);
  const [fName, setFName] = useState("");
  const [fMobile, setFMobile] = useState("");
  const [fRole, setFRole] = useState<Role>("EMPLOYER_EXPERT");
  const [fUnit, setFUnit] = useState(db.workUnits[0]?.id || "");
  const [fGroups, setFGroups] = useState<string[]>([]);
  const toast = useToast();

  const list = db.users
    .filter((u) => u.role !== "DEPUTY")
    .filter((u) => (roleF ? u.role === roleF : true))
    .filter((u) => (q.trim() ? u.fullName.includes(q.trim()) : true));

  const submit = () => {
    const res = addUser({ fullName: fName, mobile: fMobile, role: fRole, unitId: fRole === "CONTRACTOR_CEO" ? null : fUnit, companyId: null, groupIds: fGroups });
    if (res.ok) { setOpen(false); setFName(""); setFMobile(""); setFGroups([]); }
    else toast(res.message, "error");
  };

  return (
    <div>
      <PageHeader title="کاربران سامانه" subtitle="ورود فقط برای کاربرانی است که اینجا ثبت شده‌اند"
        actions={<Button icon={<Plus size={17} />} onClick={() => setOpen(true)}>کاربر جدید</Button>} />
      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row">
        <SearchBar value={q} onChange={setQ} placeholder="جستجوی نام..." className="flex-1" />
        <Select value={roleF} onChange={setRoleF} placeholder="همه نقش‌ها" options={Object.entries(ROLE_LABEL).filter(([k]) => k !== "DEPUTY").map(([k, v]) => ({ value: k, label: v }))} className="sm:w-56" />
      </div>
      <div className="stagger space-y-2.5">
        {list.map((u) => (
          <Card key={u.id}>
            <div className="flex items-center gap-3">
              <Avatar name={u.fullName} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14px] font-black text-ink-900">{u.fullName}</p>
                  <Badge className="border-primary-200 bg-primary-50 text-primary-700">{ROLE_LABEL[u.role]}</Badge>
                  {!u.isActive && <Badge className="border-red-200 bg-bad-50 text-bad-700">غیرفعال</Badge>}
                </div>
                <p className="tnum mt-1 text-[11.5px] font-bold text-ink-300" dir="ltr">{maskMobile(u.mobile)}</p>
              </div>
              <Button size="sm" variant={u.isActive ? "dangerSoft" : "success"} onClick={() => toggleUserActive(u.id)} icon={<Power size={14} />}>
                {u.isActive ? "غیرفعال" : "فعال"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="ایجاد کاربر جدید" footer={
        <>
          <Button full onClick={submit}>ایجاد کاربر</Button>
          <Button full variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
        </>
      }>
        <Field label="نام و نام خانوادگی" required><Input value={fName} onChange={(e) => setFName(e.target.value)} /></Field>
        <Field label="شماره موبایل" required hint="کاربر فقط با همین شماره می‌تواند وارد شود."><Input ltr inputMode="numeric" value={fMobile} onChange={(e) => setFMobile(enDigits(e.target.value))} placeholder="09xxxxxxxxx" maxLength={14} /></Field>
        <Field label="نقش"><Select value={fRole} onChange={(v) => setFRole(v as Role)} options={EMPLOYER_ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))} /></Field>
        {fRole !== "CONTRACTOR_CEO" && (
          <>
            <Field label="واحد کارفرمایی"><Select value={fUnit} onChange={setFUnit} options={db.workUnits.map((u) => ({ value: u.id, label: u.name }))} /></Field>
            {fRole === "EMPLOYER_EXPERT" && (
              <Field label="گروه‌های مجاز برای نظارت">
                <div className="flex flex-wrap gap-1.5">
                  {db.groups.filter((g) => g.isActive).map((g) => (
                    <button key={g.id} onClick={() => setFGroups((p) => (p.includes(g.id) ? p.filter((x) => x !== g.id) : [...p, g.id]))}
                      className={cx("press rounded-full border px-3 py-1.5 text-[12px] font-bold", fGroups.includes(g.id) ? "border-primary-600 bg-primary-600 text-white" : "border-line bg-white text-ink-500")}>{g.name}</button>
                  ))}
                </div>
              </Field>
            )}
          </>
        )}
        {fRole === "EMPLOYER_EXPERT" && <p className="rounded-[12px] bg-sky-50 px-3 py-2 text-[11.5px] font-bold leading-6 text-sky-700">کارشناس کارفرما فقط گزارش‌های گروه‌های انتخاب‌شده را می‌بیند و بررسی می‌کند.</p>}
      </Modal>
    </div>
  );
}

export function UnitsAdmin() {
  const store = useStore();
  const { db, addUnit } = store;
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const toast = useToast();
  return (
    <div>
      <PageHeader title="واحدهای کارفرمایی" subtitle="ساختار واحدهای زیرمجموعه معاونت"
        actions={<Button icon={<Plus size={17} />} onClick={() => setOpen(true)}>واحد جدید</Button>} />
      <div className="stagger grid gap-3 md:grid-cols-2">
        {db.workUnits.map((u) => {
          const groups = db.groups.filter((g) => g.workUnitId === u.id);
          return (
            <Card key={u.id}>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-primary-50 text-primary-600"><Building2 size={20} /></span>
                <div className="flex-1">
                  <p className="text-[14px] font-black text-ink-900">{u.name}</p>
                  <p className="mt-0.5 text-[11.5px] font-bold text-ink-400">{faDigits(groups.length)} گروه مرتبط</p>
                </div>
                {!u.isActive && <Badge className="border-red-200 bg-bad-50 text-bad-700">غیرفعال</Badge>}
              </div>
            </Card>
          );
        })}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="واحد کارفرمایی جدید" footer={
        <>
          <Button full onClick={() => { const r = addUnit(name); if (r.ok) { setOpen(false); setName(""); } else toast(r.message, "error"); }}>ایجاد واحد</Button>
          <Button full variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
        </>
      }>
        <Field label="نام واحد" required><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلا: واحد بهره‌برداری پست‌های فوق‌توزیع" /></Field>
      </Modal>
    </div>
  );
}
