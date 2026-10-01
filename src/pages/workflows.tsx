import React, { useMemo, useState } from "react";
import {
  ArrowLeft, CheckCircle2, ChevronLeft, ClipboardCheck, Clock3, Coins, FileImage, MapPin, Paperclip, Plus,
  RotateCcw, SearchX, ShieldAlert, ShoppingCart, XCircle, AlertTriangle, UserPlus, Layers,
} from "lucide-react";
import { useStore } from "../store";
import type { Role, Task, TaskPriority, TaskStatus, WorkReport } from "../types";
import { PRIORITY_META, REPORT_STATUS_META, ROLE_LABEL, ROLE_PANEL, TASK_STATUS_META, PURCHASE_STATUS_META, EXTRA_STATUS_META } from "../types";
import { faDigits, formatRial, jalaliKeyToDisplay, nav, relativeTime, todayJalaliStr, jalaliKey, daysAgoJalali } from "../lib/utils";
import { Avatar, Badge, Button, Card, Confirm, EmptyState, Field, Input, Modal, PageHeader, SearchBar, Select, StatusBadge, Tabs, Textarea, cx, useToast } from "../components/ui";

type Scope = "supervisor" | "expert" | "ceo" | "contractor" | "deputy";

const scopeQueueStatus: Record<Scope, string[]> = {
  supervisor: ["supervisor_review"],
  expert: ["expert_review"],
  ceo: ["employer_ceo_review"],
  contractor: [],
  deputy: [],
};

export function reportDetailPath(role: Role, id: string): string {
  if (role === "TECHNICIAN") return `/technician/reports/${id}`;
  if (role === "CONTRACTOR_CEO") return `/contractor-ceo/reports/${id}`;
  if (role === "DEPUTY") return `/deputy/reports/${id}`;
  return `/${ROLE_PANEL[role]}/reviews/${id}`;
}

/* ============================= Reviews list ============================= */

export function ReviewsList({ scope, title, subtitle }: { scope: Scope; title: string; subtitle?: string }) {
  const store = useStore();
  const { user, visibleReports, userName, groupName, reportItems, reportTotal } = store;
  const [tab, setTab] = useState(scope === "contractor" || scope === "deputy" ? "all" : "queue");
  const [groupF, setGroupF] = useState("");
  const [q, setQ] = useState("");

  const groups = useMemo(() => {
    if (!user) return [];
    const ids = new Set(visibleReports().map((r) => r.groupId).filter(Boolean) as string[]);
    return store.db.groups.filter((g) => ids.has(g.id));
  }, [store.db.groups, visibleReports, user]);

  const list = useMemo(() => {
    let l = visibleReports().filter((r) => r.reportType === "work_report");
    if (scope === "supervisor") l = l.filter((r) => r.userId !== user?.id);
    if (tab === "queue") l = l.filter((r) => scopeQueueStatus[scope].includes(r.status));
    if (tab === "approved") l = l.filter((r) => r.status === "approved" || r.status === "settled");
    if (tab === "failed") l = l.filter((r) => ["rejected", "redo_requested", "disputed"].includes(r.status));
    if (groupF) l = l.filter((r) => r.groupId === groupF);
    if (q.trim()) l = l.filter((r) => userName(r.userId).includes(q.trim()) || groupName(r.groupId).includes(q.trim()));
    return l.sort((a, b) => (b.submittedAt || b.createdAt).localeCompare(a.submittedAt || a.createdAt));
  }, [visibleReports, tab, groupF, q, userName, groupName, scope, user]);

  const queueCount = useMemo(() => visibleReports().filter((r) => r.reportType === "work_report" && scopeQueueStatus[scope].includes(r.status) && !(scope === "supervisor" && r.userId === user?.id)).length, [visibleReports, scope, user]);

  if (!user) return null;

  const open = (id: string) => nav(reportDetailPath(user.role, id));

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <Tabs className="md:w-auto" value={tab} onChange={setTab} tabs={[
          ...(scopeQueueStatus[scope].length ? [{ key: "queue", label: "در انتظار من", count: queueCount }] : []),
          { key: "all", label: "همه" },
          { key: "approved", label: "تایید نهایی" },
          { key: "failed", label: "رد / مجدد / اختلاف" },
        ]} />
        <div className="flex flex-1 gap-2">
          <SearchBar value={q} onChange={setQ} placeholder="جستجوی نیرو یا گروه..." className="flex-1" />
          <Select value={groupF} onChange={setGroupF} placeholder="همه گروه‌ها" options={groups.map((g) => ({ value: g.id, label: g.name }))} className="w-44 shrink-0" />
        </div>
      </div>

      {list.length === 0 ? (
        <Card><EmptyState icon={<ClipboardCheck size={28} />} title="گزارشی یافت نشد" body={tab === "queue" ? "در حال حاضر گزارشی در نوبت بررسی شما نیست." : "با این فیلترها گزارشی وجود ندارد."} /></Card>
      ) : (
        <>
          {/* desktop table */}
          <Card pad={false} className="anim-fade-up hidden overflow-hidden md:block">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line bg-slate-50/80 text-[11.5px] font-black text-ink-400">
                  <th className="px-4 py-3 text-start">نیرو</th>
                  <th className="px-4 py-3 text-start">گروه</th>
                  <th className="px-4 py-3 text-start">تاریخ</th>
                  <th className="px-4 py-3 text-start">آیتم‌ها</th>
                  <th className="px-4 py-3 text-start">مبلغ</th>
                  <th className="px-4 py-3 text-start">وضعیت</th>
                  <th className="w-10 px-2 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id} onClick={() => open(r.id)} className="cursor-pointer border-b border-line/60 transition-colors last:border-0 hover:bg-primary-50/40">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2.5 font-black text-ink-900"><Avatar name={userName(r.userId)} size={32} />{userName(r.userId)}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-ink-500">{groupName(r.groupId)}</td>
                    <td className="tnum px-4 py-3 font-bold text-ink-500">{jalaliKeyToDisplay(r.reportDateJ)}</td>
                    <td className="tnum px-4 py-3 font-bold text-ink-500">{faDigits(reportItems(r.id).length)}</td>
                    <td className="tnum px-4 py-3 font-black text-ink-900">{formatRial(reportTotal(r.id), false)}</td>
                    <td className="px-4 py-3"><StatusBadge meta={REPORT_STATUS_META[r.status]} /></td>
                    <td className="px-2 py-3 text-ink-300"><ChevronLeft size={17} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          {/* mobile cards */}
          <div className="stagger space-y-2.5 md:hidden">
            {list.map((r) => (
              <Card key={r.id} onClick={() => open(r.id)}>
                <div className="flex items-center gap-3">
                  <Avatar name={userName(r.userId)} size={42} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-black text-ink-900">{userName(r.userId)}</p>
                    <p className="mt-0.5 truncate text-[11.5px] font-bold text-ink-400">{groupName(r.groupId)} — {jalaliKeyToDisplay(r.reportDateJ)}</p>
                  </div>
                  <div className="text-left">
                    <StatusBadge meta={REPORT_STATUS_META[r.status]} />
                    <p className="tnum mt-1.5 text-[12.5px] font-black text-ink-700">{formatRial(reportTotal(r.id), false)} <span className="text-[10px] text-ink-300">ریال</span></p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ============================= Reviews detail ============================= */

const ACTION_META: Record<string, { label: string; cls: string }> = {
  submit: { label: "ارسال گزارش", cls: "bg-sky-50 text-sky-700 border-sky-200" },
  resubmit: { label: "ارسال مجدد", cls: "bg-sky-50 text-sky-700 border-sky-200" },
  approve: { label: "تایید", cls: "bg-ok-50 text-ok-700 border-green-200" },
  reject: { label: "رد", cls: "bg-bad-50 text-bad-700 border-red-200" },
  redo: { label: "درخواست انجام مجدد", cls: "bg-orange-50 text-orange-700 border-orange-200" },
  dispute: { label: "ایجاد اختلاف", cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

function ReasonModal({ open, onClose, title, onSubmit, submitLabel, tone }: { open: boolean; onClose: () => void; title: string; onSubmit: (reason: string) => void; submitLabel: string; tone: "danger" | "warn" }) {
  const [reason, setReason] = useState("");
  const toast = useToast();
  return (
    <Modal open={open} onClose={() => { setReason(""); onClose(); }} title={title} footer={
      <>
        <Button full variant={tone === "danger" ? "danger" : "warnSoft"} onClick={() => {
          if (reason.trim().length < 5) { toast("ثبت دلیل الزامی است (حداقل ۵ حرف)", "error"); return; }
          onSubmit(reason.trim()); setReason(""); onClose();
        }}>{submitLabel}</Button>
        <Button full variant="outline" onClick={() => { setReason(""); onClose(); }}>انصراف</Button>
      </>
    }>
      <Field label="دلیل (الزامی)" required>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="دلیل خود را به‌صورت شفاف بنویسید؛ این دلیل برای ثبت‌کننده گزارش نمایش داده می‌شود." />
      </Field>
    </Modal>
  );
}

export function ReviewDetail({ id, backPath }: { id: string; backPath: string }) {
  const store = useStore();
  const { user, reportById, userName, groupName, contractTitle, reportItems, reportExtras, reportAttachments, reportTotal, reportEvents, approvalAction, resubmitReport, userById } = store;
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [reasonFor, setReasonFor] = useState<"reject" | "redo" | "dispute" | null>(null);
  const [acting, setActing] = useState(false);
  const toast = useToast();

  const r = reportById(id);
  if (!user || !r) {
    return <Card><EmptyState icon={<SearchX size={28} />} title="گزارش یافت نشد" action={<Button variant="soft" onClick={() => nav(backPath)}>بازگشت</Button>} /></Card>;
  }

  const items = reportItems(id);
  const extras = reportExtras(id);
  const atts = reportAttachments(id);
  const events = reportEvents(id);
  const total = reportTotal(id);
  const isReporter = r.userId === user.id;
  const canAct =
    !isReporter &&
    ((user.role === "GROUP_SUPERVISOR" && r.status === "supervisor_review") ||
    (user.role === "EMPLOYER_EXPERT" && r.status === "expert_review") ||
    (user.role === "EMPLOYER_CEO" && r.status === "employer_ceo_review"));

  const act = (action: "approve" | "reject" | "redo" | "dispute", reason?: string) => {
    setActing(true);
    setTimeout(() => {
      const res = approvalAction(id, action, reason);
      setActing(false);
      if (!res.ok) toast(res.message, "error");
    }, 450);
  };

  const approverLabel = user.role === "EMPLOYER_CEO" ? "تایید نهایی" : "تایید گزارش";

  return (
    <div className="mx-auto max-w-3xl pb-32 lg:pb-8">
      <PageHeader title="جزئیات گزارش کار" subtitle={`${userName(r.userId)} — ${groupName(r.groupId)}`} onBack={() => nav(backPath)}
        actions={<StatusBadge meta={REPORT_STATUS_META[r.status]} />} />

      {/* summary */}
      <Card className="anim-fade-up mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <Avatar name={userName(r.userId)} size={48} />
            <div>
              <p className="text-[15px] font-black text-ink-900">{userName(r.userId)}</p>
              <p className="text-[11.5px] font-bold text-ink-400">{ROLE_LABEL[userById(r.userId)?.role || "TECHNICIAN"]}</p>
            </div>
          </div>
          <div className="ms-auto rounded-[16px] bg-primary-50 px-4 py-2.5 text-center">
            <p className="text-[10.5px] font-black text-primary-600">جمع گزارش</p>
            <p className="tnum text-[17px] font-black text-primary-700">{formatRial(total)}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-line/70 pt-4 text-[12.5px] md:grid-cols-4">
          <div><p className="font-bold text-ink-300">تاریخ گزارش</p><p className="tnum mt-0.5 font-black text-ink-800">{jalaliKeyToDisplay(r.reportDateJ)}</p></div>
          <div><p className="font-bold text-ink-300">گروه</p><p className="mt-0.5 font-black text-ink-800">{groupName(r.groupId)}</p></div>
          <div><p className="font-bold text-ink-300">ارسال</p><p className="mt-0.5 font-black text-ink-800">{relativeTime(r.submittedAt || r.createdAt)}</p></div>
          <div><p className="font-bold text-ink-300">قرارداد</p><p className="mt-0.5 truncate font-black text-ink-800">{contractTitle(r.contractId)}</p></div>
        </div>
        {r.description && <p className="mt-4 rounded-[14px] bg-slate-50 p-3.5 text-[13px] leading-7 text-ink-700">{r.description}</p>}
      </Card>

      {/* items */}
      <Card className="anim-fade-up mb-4" pad={false}>
        <p className="border-b border-line px-4 py-3 text-[13px] font-black text-ink-700">آیتم‌های فهرست بها</p>
        <div className="divide-y divide-line/70">
          {items.map((i) => (
            <div key={i.id} className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-primary-50 text-primary-600"><Coins size={17} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-black text-ink-900">{i.titleSnapshot}</p>
                <p className="tnum mt-0.5 text-[11px] font-bold text-ink-300">{formatRial(i.unitPriceSnapshot, false)} ریال / {i.unitSnapshot}</p>
              </div>
              <div className="text-left">
                <p className="tnum text-[13px] font-black text-ink-900">{faDigits(i.quantity)} × {i.unitSnapshot}</p>
                <p className="tnum mt-0.5 text-[12px] font-black text-primary-700">{formatRial(i.totalAmount, false)}</p>
              </div>
            </div>
          ))}
          {extras.map((e) => (
            <div key={e.id} className="flex items-center gap-3 bg-amber-50/40 px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-amber-100 text-warn-600"><Layers size={17} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-black leading-6 text-ink-900">{e.description}</p>
                <p className="mt-0.5 text-[11px] font-bold text-ink-400">کار اضافی {e.status === "mapped" ? `— معادل‌سازی‌شده: ${e.mappedQuantity} واحد، ${formatRial(e.mappedAmount || 0)}` : "— در انتظار معادل‌سازی توسط نماینده مقیم"}</p>
              </div>
              <StatusBadge meta={EXTRA_STATUS_META[e.status]} />
            </div>
          ))}
        </div>
      </Card>

      {/* attachments */}
      {atts.length > 0 && (
        <Card className="anim-fade-up mb-4">
          <p className="mb-3 flex items-center gap-1.5 text-[13px] font-black text-ink-700"><Paperclip size={15} /> مستندات ({faDigits(atts.length)})</p>
          <div className="grid grid-cols-3 gap-2.5 md:grid-cols-4">
            {atts.map((a) => a.dataUrl ? (
              <img key={a.id} src={a.dataUrl} alt={a.fileName} className="aspect-square w-full rounded-[14px] border border-line object-cover" />
            ) : (
              <div key={a.id} className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-[14px] border border-dashed border-line bg-slate-50 text-ink-300">
                <FileImage size={22} />
                <span className="max-w-full truncate px-2 text-[10px] font-bold">{a.fileName}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* timeline */}
      <Card className="anim-fade-up mb-4">
        <p className="mb-4 text-[13px] font-black text-ink-700">گردش تایید گزارش</p>
        <div className="relative space-y-4 before:absolute before:inset-y-1 before:start-[15px] before:w-px before:bg-line">
          {events.map((e) => (
            <div key={e.id} className="anim-fade-up relative flex gap-3.5">
              <span className={cx("relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-white", ACTION_META[e.action]?.cls)}>
                {e.action === "approve" ? <CheckCircle2 size={15} /> : e.action === "reject" ? <XCircle size={15} /> : e.action === "redo" ? <RotateCcw size={14} /> : e.action === "dispute" ? <ShieldAlert size={14} /> : <Clock3 size={14} />}
              </span>
              <div className="min-w-0 flex-1 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={ACTION_META[e.action]?.cls}>{ACTION_META[e.action]?.label}</Badge>
                  <span className="text-[12.5px] font-black text-ink-800">{userName(e.actorUserId)}</span>
                  <span className="text-[11px] font-bold text-ink-300">{ROLE_LABEL[e.actorRole]}</span>
                  <span className="ms-auto text-[10.5px] font-bold text-ink-300">{relativeTime(e.createdAt)}</span>
                </div>
                {e.reason && <p className="mt-1.5 rounded-[12px] bg-slate-50 px-3 py-2 text-[12px] leading-6 text-ink-500">{e.reason}</p>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* reporter resubmit */}
      {isReporter && r.status === "redo_requested" && (
        <Card className="anim-fade-up mb-4 border-orange-200 bg-orange-50/50">
          <p className="text-[13px] font-black leading-7 text-ink-800">سرپرست برای این گزارش درخواست انجام مجدد داده است. پس از اصلاح کار در میدان، گزارش را دوباره ارسال کنید.</p>
          <Button className="mt-3" variant="warnSoft" icon={<RotateCcw size={17} />} onClick={() => resubmitReport(id)}>ارسال مجدد گزارش</Button>
        </Card>
      )}

      {/* sticky action bar */}
      {canAct && (
        <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur-lg lg:static lg:mt-2 lg:rounded-[20px] lg:border lg:px-5 lg:py-4">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2.5">
            <Button variant="success" size="lg" className="flex-1" loading={acting} icon={<CheckCircle2 size={19} />} onClick={() => setConfirmApprove(true)}>{approverLabel}</Button>
            {user.role === "EMPLOYER_CEO" ? (
              <>
                <Button variant="dangerSoft" size="lg" icon={<XCircle size={18} />} onClick={() => setReasonFor("reject")}>رد نهایی</Button>
                <Button variant="outline" size="lg" className="text-rose-600" icon={<ShieldAlert size={18} />} onClick={() => setReasonFor("dispute")}>اختلاف</Button>
              </>
            ) : (
              <>
                <Button variant="warnSoft" size="lg" icon={<RotateCcw size={18} />} onClick={() => setReasonFor("redo")}>انجام مجدد</Button>
                <Button variant="dangerSoft" size="lg" icon={<XCircle size={18} />} onClick={() => setReasonFor("reject")}>رد</Button>
              </>
            )}
          </div>
        </div>
      )}

      <Confirm open={confirmApprove} onClose={() => setConfirmApprove(false)} tone="success" confirmLabel={approverLabel} loading={acting}
        title={approverLabel}
        body={user.role === "EMPLOYER_CEO"
          ? `با تایید نهایی، مبلغ ${formatRial(total)} قابل درج در صورت‌وضعیت می‌شود و امتیاز کاری برای نیرو ثبت خواهد شد.`
          : "گزارش پس از تایید شما به مرحله بعدی گردش بررسی ارسال می‌شود."}
        onConfirm={() => { setConfirmApprove(false); act("approve"); }} />

      <ReasonModal open={reasonFor === "reject"} onClose={() => setReasonFor(null)} title="رد گزارش" submitLabel="رد گزارش" tone="danger" onSubmit={(reason) => act("reject", reason)} />
      <ReasonModal open={reasonFor === "redo"} onClose={() => setReasonFor(null)} title="درخواست انجام مجدد" submitLabel="ثبت درخواست" tone="warn" onSubmit={(reason) => act("redo", reason)} />
      <ReasonModal open={reasonFor === "dispute"} onClose={() => setReasonFor(null)} title="ثبت اختلاف" submitLabel="ثبت اختلاف" tone="danger" onSubmit={(reason) => act("dispute", reason)} />
    </div>
  );
}

/* ============================= Tasks board ============================= */

const dueOptions = [
  { value: "", label: "بدون مهلت" },
  { value: "0", label: "امروز" },
  { value: "-1", label: "فردا" },
  { value: "-3", label: "۳ روز دیگر" },
  { value: "-7", label: "هفته دیگر" },
];

export function TasksBoard({ createRoles, forTech }: { createRoles: Role[]; forTech?: boolean }) {
  const store = useStore();
  const { user, visibleTasks, userName, groupName, setTaskStatus, createTask, userGroups, db } = store;
  const [tab, setTab] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const toast = useToast();

  const [fTitle, setFTitle] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fGroups, setFGroups] = useState<string[]>([]);
  const [fUsers, setFUsers] = useState<string[]>([]);
  const [fPriority, setFPriority] = useState<TaskPriority>("medium");
  const [fDue, setFDue] = useState("");

  const list = useMemo(() => {
    let l = visibleTasks();
    if (tab !== "all") l = l.filter((t) => t.status === tab);
    return l.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [visibleTasks, tab]);

  if (!user) return null;
  const canCreate = createRoles.includes(user.role);

  /* assignable pool */
  const myGroups = userGroups(user.id);
  let poolGroups = myGroups;
  if (user.role === "EMPLOYER_EXPERT" || user.role === "EMPLOYER_CEO") {
    const gids = db.memberships.filter((m) => m.userId === user.id && m.isActive && (m.membershipType === "employer_expert" || m.membershipType === "employer_ceo")).map((m) => m.groupId);
    poolGroups = db.groups.filter((g) => gids.includes(g.id));
  }
  const poolGroupIds = poolGroups.map((g) => g.id);
  const poolUsers = db.users.filter((u) => u.isActive && u.id !== user.id &&
    db.memberships.some((m) => m.userId === u.id && m.isActive && poolGroupIds.includes(m.groupId) && (m.membershipType === "member" || m.membershipType === "supervisor")));

  const toggle = (arr: string[], set: (v: string[]) => void, id: string) =>
    set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  const submit = () => {
    const res = createTask({
      title: fTitle, description: fDesc || undefined, groupIds: fGroups, userIds: fUsers,
      priority: fPriority, dueDateJ: fDue ? jalaliKey(daysAgoJalali(parseInt(fDue))) : null, contractId: db.contracts[0]?.id || null,
    });
    if (res.ok) {
      setCreateOpen(false);
      setFTitle(""); setFDesc(""); setFGroups([]); setFUsers([]); setFPriority("medium"); setFDue("");
    } else toast(res.message, "error");
  };

  const canChangeStatus = (t: Task) =>
    user.role === "CONTRACTOR_CEO" || user.role === "GROUP_SUPERVISOR" || t.createdByUserId === user.id || t.assignedUserIds.includes(user.id);

  return (
    <div>
      <PageHeader title={forTech ? "کارهای محوله من" : "کارهای محوله"} subtitle="پیگیری و مدیریت کارهای واگذارشده"
        actions={canCreate ? <Button size="md" icon={<Plus size={17} />} onClick={() => setCreateOpen(true)}>سپردن کار</Button> : undefined} />

      <Tabs className="mb-4" value={tab} onChange={setTab} tabs={[
        { key: "all", label: "همه", count: visibleTasks().length },
        { key: "open", label: "باز", count: visibleTasks().filter((t) => t.status === "open").length },
        { key: "in_progress", label: "در حال انجام", count: visibleTasks().filter((t) => t.status === "in_progress").length },
        { key: "done", label: "انجام شده", count: visibleTasks().filter((t) => t.status === "done").length },
      ]} />

      {list.length === 0 ? (
        <Card><EmptyState icon={<ClipboardCheck size={28} />} title="کاری یافت نشد" body={canCreate ? "با دکمه «سپردن کار» اولین کار را ایجاد کنید." : "در حال حاضر کار محوله‌ای ندارید."} /></Card>
      ) : (
        <div className="stagger space-y-2.5">
          {list.map((t) => (
            <Card key={t.id}>
              <div className="flex flex-wrap items-start gap-3">
                <span className={cx("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]", PRIORITY_META[t.priority].badge.replace("border", "bg-opacity-0 border"))}>
                  <AlertTriangle size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14px] font-black text-ink-900">{t.title}</p>
                    <StatusBadge meta={PRIORITY_META[t.priority]} />
                  </div>
                  {t.description && <p className="mt-1 text-[12.5px] leading-6 text-ink-500">{t.description}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] font-bold text-ink-400">
                    {t.assignedGroupIds.map((g) => <span key={g} className="flex items-center gap-1"><MapPin size={12} />{groupName(g)}</span>)}
                    {t.dueDateJ && <span className="tnum flex items-center gap-1"><Clock3 size={12} />مهلت: {jalaliKeyToDisplay(t.dueDateJ)}</span>}
                    <span>محول‌کننده: {userName(t.createdByUserId)}</span>
                  </div>
                  {t.assignedUserIds.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-1.5">
                      {t.assignedUserIds.map((u) => (
                        <span key={u} title={userName(u)}><Avatar name={userName(u)} size={26} /></span>
                      ))}
                      <span className="ms-1 text-[11px] font-bold text-ink-300">{t.assignedUserIds.map((u) => userName(u)).join("، ")}</span>
                    </div>
                  )}
                </div>
                <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
                  <StatusBadge meta={TASK_STATUS_META[t.status]} />
                  {canChangeStatus(t) && t.status !== "done" && t.status !== "cancelled" && (
                    <div className="flex gap-1.5">
                      {t.status === "open" && <Button size="sm" variant="soft" onClick={() => setTaskStatus(t.id, "in_progress")}>شروع کار</Button>}
                      <Button size="sm" variant="success" onClick={() => setTaskStatus(t.id, "done")}>انجام شد</Button>
                    </div>
                  )}
                  {forTech && user.role === "TECHNICIAN" && t.status !== "done" && t.status !== "cancelled" && (
                    <Button size="sm" variant="outline" onClick={() => nav(`/technician/reports/new?task=${t.id}`)}>گزارش از روی این کار</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="سپردن کار جدید" wide footer={
        <>
          <Button full onClick={submit} icon={<UserPlus size={18} />}>سپردن کار</Button>
          <Button full variant="outline" onClick={() => setCreateOpen(false)}>انصراف</Button>
        </>
      }>
        <Field label="عنوان کار" required><Input value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="مثلا: رفع اتصالی فیدر ۱۲" /></Field>
        <Field label="شرح"><Textarea value={fDesc} onChange={(e) => setFDesc(e.target.value)} placeholder="توضیحات تکمیلی..." className="min-h-[80px]" /></Field>
        <Field label="گروه‌ها">
          <div className="flex flex-wrap gap-1.5">
            {poolGroups.map((g) => (
              <button key={g.id} onClick={() => toggle(fGroups, setFGroups, g.id)}
                className={cx("press rounded-full border px-3 py-1.5 text-[12px] font-bold", fGroups.includes(g.id) ? "border-primary-600 bg-primary-600 text-white" : "border-line bg-white text-ink-500")}>{g.name}</button>
            ))}
          </div>
        </Field>
        <Field label="نیروها">
          <div className="flex flex-wrap gap-1.5">
            {poolUsers.length === 0 && <p className="text-[12px] font-bold text-ink-300">نیرویی در گروه‌های انتخابی نیست.</p>}
            {poolUsers.map((u) => (
              <button key={u.id} onClick={() => toggle(fUsers, setFUsers, u.id)}
                className={cx("press rounded-full border px-3 py-1.5 text-[12px] font-bold", fUsers.includes(u.id) ? "border-primary-600 bg-primary-600 text-white" : "border-line bg-white text-ink-500")}>{u.fullName}</button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="اولویت">
            <Select value={fPriority} onChange={(v) => setFPriority(v as TaskPriority)} options={(Object.keys(PRIORITY_META) as TaskPriority[]).map((k) => ({ value: k, label: PRIORITY_META[k].label }))} />
          </Field>
          <Field label="مهلت انجام">
            <Select value={fDue} onChange={setFDue} options={dueOptions} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

/* ============================= Purchase board ============================= */

export function PurchaseBoard({ decideRoles, markRole, createRoles }: { decideRoles: Role[]; markRole: Role | null; createRoles: Role[] }) {
  const store = useStore();
  const { user, db, userName, createPurchaseRequest, decidePurchaseRequest, markPurchased } = store;
  const [tab, setTab] = useState("all");
  const [open, setOpen] = useState(false);
  const [decide, setDecide] = useState<{ id: string; approve: boolean } | null>(null);
  const [note, setNote] = useState("");
  const [confirmBuy, setConfirmBuy] = useState<string | null>(null);
  const toast = useToast();

  const [fTitle, setFTitle] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fQty, setFQty] = useState(1);
  const [fPrice, setFPrice] = useState("");
  const [fReason, setFReason] = useState("");
  const [fPriority, setFPriority] = useState<TaskPriority>("medium");

  const list = useMemo(() => {
    if (!user) return [];
    let l = db.purchaseRequests;
    if (user.role === "TECHNICIAN" || user.role === "GROUP_SUPERVISOR") l = l.filter((p) => p.requesterUserId === user.id);
    else if (user.role === "RESIDENT_REP" || user.role === "CONTRACTOR_CEO") l = l.filter((p) => p.companyId === user.companyId);
    if (tab !== "all") l = l.filter((p) => (tab === "pending" ? p.status === "submitted" : p.status === tab));
    return [...l].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [db.purchaseRequests, user, tab]);

  if (!user) return null;
  const canDecide = decideRoles.includes(user.role);
  const canCreate = createRoles.includes(user.role);

  const submit = () => {
    const price = parseInt(fPrice.replace(/[^\d]/g, "")) || 0;
    const res = createPurchaseRequest({ title: fTitle, itemDescription: fDesc, quantity: fQty, estimatedPrice: price, reason: fReason || undefined, priority: fPriority, contractId: db.contracts[0]?.id || null });
    if (res.ok) { setOpen(false); setFTitle(""); setFDesc(""); setFQty(1); setFPrice(""); setFReason(""); }
    else toast(res.message, "error");
  };

  return (
    <div>
      <PageHeader title="درخواست‌های خرید و تجهیز" subtitle="مدیریت خرید اقلام و تجهیزات مورد نیاز"
        actions={canCreate ? <Button size="md" icon={<Plus size={17} />} onClick={() => setOpen(true)}>درخواست خرید</Button> : undefined} />
      <Tabs className="mb-4" value={tab} onChange={setTab} tabs={[
        { key: "all", label: "همه" },
        { key: "pending", label: "در انتظار تصمیم" },
        { key: "approved", label: "تایید شده" },
        { key: "purchased", label: "خریداری‌شده" },
        { key: "rejected", label: "رد شده" },
      ]} />

      {list.length === 0 ? (
        <Card><EmptyState icon={<ShoppingCart size={28} />} title="درخواست خریدی نیست" body={canCreate ? "اولین درخواست خرید را ثبت کنید." : "هنوز درخواستی ثبت نشده است."}
          action={canCreate ? <Button variant="soft" icon={<Plus size={16} />} onClick={() => setOpen(true)}>درخواست خرید</Button> : undefined} /></Card>
      ) : (
        <div className="stagger space-y-2.5">
          {list.map((p) => (
            <Card key={p.id}>
              <div className="flex flex-wrap items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-sky-50 text-sky-600"><ShoppingCart size={18} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14px] font-black text-ink-900">{p.title}</p>
                    <StatusBadge meta={PURCHASE_STATUS_META[p.status]} />
                    <StatusBadge meta={PRIORITY_META[p.priority]} />
                  </div>
                  <p className="mt-1 text-[12.5px] leading-6 text-ink-500">{p.itemDescription}</p>
                  <div className="tnum mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] font-bold text-ink-400">
                    <span>تعداد: {faDigits(p.quantity)}</span>
                    <span>برآورد: {formatRial(p.estimatedPrice)}</span>
                    <span>درخواست‌کننده: {userName(p.requesterUserId)}</span>
                    <span>{relativeTime(p.createdAt)}</span>
                  </div>
                  {p.decisionNote && <p className="mt-2 rounded-[12px] bg-slate-50 px-3 py-2 text-[12px] leading-6 text-ink-500">یادداشت تصمیم: {p.decisionNote}</p>}
                </div>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                  {canDecide && p.status === "submitted" && (
                    <>
                      <Button size="sm" variant="success" onClick={() => { setDecide({ id: p.id, approve: true }); setNote(""); }}>تایید</Button>
                      <Button size="sm" variant="dangerSoft" onClick={() => { setDecide({ id: p.id, approve: false }); setNote(""); }}>رد</Button>
                    </>
                  )}
                  {markRole === user.role && p.status === "approved" && (
                    <Button size="sm" variant="soft" onClick={() => setConfirmBuy(p.id)}>ثبت نتیجه خرید</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="درخواست خرید جدید" wide footer={
        <>
          <Button full onClick={submit}>ثبت درخواست</Button>
          <Button full variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
        </>
      }>
        <Field label="عنوان خرید" required><Input value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="مثلا: ماژول RTU پست دانشگاه" /></Field>
        <Field label="شرح کالا یا تجهیز" required><Textarea value={fDesc} onChange={(e) => setFDesc(e.target.value)} placeholder="مشخصات فنی و تعداد دقیق..." className="min-h-[80px]" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="تعداد" required><Input ltr inputMode="numeric" value={faDigits(fQty)} onChange={(e) => setFQty(parseInt(e.target.value.replace(/[^\d۰-۹]/g, "").replace(/[۰-۹]/g, (c) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(c)))) || 0)} /></Field>
          <Field label="برآورد قیمت (ریال)"><Input ltr inputMode="numeric" value={fPrice} onChange={(e) => setFPrice(e.target.value)} placeholder="۱۸۵٬۰۰۰٬۰۰۰" /></Field>
        </div>
        <Field label="دلیل خرید"><Textarea value={fReason} onChange={(e) => setFReason(e.target.value)} placeholder="چرا این خرید لازم است؟" className="min-h-[70px]" /></Field>
        <Field label="اولویت">
          <Select value={fPriority} onChange={(v) => setFPriority(v as TaskPriority)} options={(Object.keys(PRIORITY_META) as TaskPriority[]).map((k) => ({ value: k, label: PRIORITY_META[k].label }))} />
        </Field>
      </Modal>

      <Modal open={!!decide} onClose={() => setDecide(null)} title={decide?.approve ? "تایید درخواست خرید" : "رد درخواست خرید"} footer={
        <>
          <Button full variant={decide?.approve ? "success" : "danger"} onClick={() => {
            if (decide && !decide.approve && note.trim().length < 3) { toast("ثبت دلیل رد الزامی است", "error"); return; }
            if (decide) decidePurchaseRequest(decide.id, decide.approve, note.trim() || undefined);
            setDecide(null);
          }}>{decide?.approve ? "تایید درخواست" : "رد درخواست"}</Button>
          <Button full variant="outline" onClick={() => setDecide(null)}>انصراف</Button>
        </>
      }>
        <Field label={decide?.approve ? "یادداشت (اختیاری)" : "دلیل رد (الزامی)"} required={!decide?.approve}>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="یادداشت تصمیم..." className="min-h-[90px]" />
        </Field>
      </Modal>

      <Confirm open={!!confirmBuy} onClose={() => setConfirmBuy(null)} onConfirm={() => { if (confirmBuy) markPurchased(confirmBuy); setConfirmBuy(null); }}
        title="ثبت نتیجه خرید" body="تایید کنید که خرید انجام و کالا تحویل شده است." confirmLabel="خرید انجام شد" tone="success" />
    </div>
  );
}

/* ============================= Activity timeline ============================= */

const ENTITY_LABEL: Record<string, string> = {
  report: "گزارش", task: "کار", user: "کاربر", group: "گروه", priceItem: "آیتم بها", company: "شرکت",
  contract: "قرارداد", statement: "صورت‌وضعیت", purchase: "خرید", extraItem: "کار اضافی", membership: "عضویت",
  auth: "احراز هویت", unit: "واحد", companies: "شرکت‌ها", groups: "گروه‌ها", priceItems: "آیتم بها", contracts: "قراردادها",
};

export function ActivityTimeline({ title = "فعالیت‌های سامانه" }: { title?: string }) {
  const { visibleAudits, userName } = useStore();
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    let l = [...visibleAudits()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (q.trim()) l = l.filter((a) => a.action.includes(q) || userName(a.actorUserId).includes(q) || (a.detail || "").includes(q));
    return l.slice(0, 60);
  }, [visibleAudits, q, userName]);

  return (
    <div>
      <PageHeader title={title} subtitle="ثبت کامل رویدادها و تغییرات مهم (Audit Log)" />
      <SearchBar value={q} onChange={setQ} placeholder="جستجو در رویدادها..." className="mb-4 max-w-md" />
      {list.length === 0 ? (
        <Card><EmptyState title="رویدادی یافت نشد" body="فعالیت‌های مهم سامانه اینجا ثبت می‌شوند." /></Card>
      ) : (
        <Card>
          <div className="relative space-y-4 before:absolute before:inset-y-1 before:start-[15px] before:w-px before:bg-line">
            {list.map((a) => (
              <div key={a.id} className="anim-fade-up relative flex gap-3.5">
                <span className="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-slate-50 text-[10px] font-black text-ink-400">
                  {(ENTITY_LABEL[a.entity] || a.entity).slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1 border-b border-line/50 pb-4 last:border-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-black text-ink-900">{a.action}</span>
                    <Badge className="border-slate-200 bg-slate-50 text-ink-400">{ENTITY_LABEL[a.entity] || a.entity}</Badge>
                    <span className="ms-auto text-[10.5px] font-bold text-ink-300">{relativeTime(a.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-[12px] font-bold text-ink-400">
                    {userName(a.actorUserId)} — {ROLE_LABEL[a.actorRole]}
                    {a.detail && <span className="font-semibold text-ink-300"> — {a.detail}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
