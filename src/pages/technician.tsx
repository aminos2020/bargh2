import React, { useMemo } from "react";
import { ArrowLeft, CheckCircle2, ClipboardList, Clock3, RefreshCw, Send, Star, Trophy, WifiOff, Zap } from "lucide-react";
import { useStore } from "../store";
import { REPORT_STATUS_META } from "../types";
import { faDigits, formatRial, jalaliKeyToDisplay, nav, relativeTime, todayJalaliStr, jalaliLong, todayJalali } from "../lib/utils";
import { Avatar, Badge, Button, Card, EmptyState, KpiCard, PageHeader, StatusBadge, cx } from "../components/ui";
import { ReviewDetail } from "./workflows";

const PENDING = ["supervisor_review", "expert_review", "employer_ceo_review"];

export function TechHome() {
  const store = useStore();
  const { user, visibleReports, visibleTasks, pendingSyncCount, online, userScore, userName, groupName, reportTotal } = store;
  if (!user) return null;
  const reports = visibleReports().filter((r) => r.reportType === "work_report");
  const pending = reports.filter((r) => PENDING.includes(r.status));
  const openTasks = visibleTasks().filter((t) => t.status === "open" || t.status === "in_progress");
  const today = todayJalaliStr();
  const todayTasks = openTasks.filter((t) => !t.dueDateJ || t.dueDateJ <= today);

  return (
    <div className="mx-auto max-w-3xl">
      {/* greeting */}
      <div className="anim-fade-up mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[21px] font-black text-ink-900">سلام، {user.fullName.split(" ")[0]} </h1>
          <p className="mt-1 text-[12.5px] font-bold text-ink-400">{jalaliLong(todayJalali())} — آماده ثبت گزارش میدانی</p>
        </div>
        <span className={cx("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-black", online ? "bg-ok-50 text-ok-700" : "bg-amber-50 text-warn-700")}>
          {online ? <CheckCircle2 size={13} /> : <WifiOff size={13} />}
          {online ? "آنلاین" : "آفلاین"}
        </span>
      </div>

      {/* main CTA */}
      <button onClick={() => nav("/technician/reports/new")}
        className="anim-fade-up press group relative mb-4 block w-full overflow-hidden rounded-[24px] bg-ink-900 p-6 text-start shadow-[0_18px_40px_rgba(15,23,42,0.25)] transition-transform" style={{ animationDelay: "40ms" }}>
        <div className="pointer-events-none absolute -start-16 -top-16 h-48 w-48 rounded-full bg-primary-600/30 blur-3xl transition-all group-hover:bg-primary-500/40" />
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.6) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
        <div className="relative flex items-center gap-4">
          <span className="anim-bolt flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-primary-600 text-white"><Zap size={28} fill="currentColor" strokeWidth={1.5} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[18px] font-black text-white">ثبت گزارش سریع</span>
            <span className="mt-1 block text-[12px] font-bold leading-6 text-slate-400">{online ? "با چند لمس، گزارش کار را ثبت و ارسال کن" : "آفلاین هستی؟ گزارش ذخیره و بعداً ارسال می‌شود"}</span>
          </span>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-transform group-hover:-translate-x-1"><ArrowLeft size={22} /></span>
        </div>
      </button>

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard delay={80} label="کارهای امروز" value={faDigits(todayTasks.length)} icon={<ClipboardList size={19} />} tone="warn" onClick={() => nav("/technician/tasks")} />
        <KpiCard delay={120} label="در انتظار بررسی" value={faDigits(pending.length)} icon={<Clock3 size={19} />} tone="cyan" onClick={() => nav("/technician/reports")} />
        <KpiCard delay={160} label="در صف ارسال آفلاین" value={faDigits(pendingSyncCount)} icon={<RefreshCw size={19} />} tone={pendingSyncCount ? "warn" : "ok"} onClick={() => nav("/technician/sync-status")} />
        <KpiCard delay={200} label="امتیاز کاری" value={faDigits(userScore(user.id))} icon={<Star size={19} />} tone="orange" onClick={() => nav("/technician/scores")} />
      </div>

      {/* urgent tasks */}
      {todayTasks.length > 0 && (
        <Card className="anim-fade-up mb-4" pad={false}>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-[13px] font-black text-ink-700">کارهای فوری</p>
            <button onClick={() => nav("/technician/tasks")} className="text-[11.5px] font-black text-primary-600 hover:text-primary-700">مشاهده همه</button>
          </div>
          <div className="divide-y divide-line/70">
            {todayTasks.slice(0, 3).map((t) => (
              <button key={t.id} onClick={() => nav("/technician/tasks")} className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-primary-50/40">
                <span className={cx("h-2 w-2 shrink-0 rounded-full", t.priority === "urgent" ? "bg-bad-600 pulse-dot" : "bg-warn-600")} />
                <span className="min-w-0 flex-1 truncate text-[13px] font-black text-ink-800">{t.title}</span>
                {t.dueDateJ && <span className="tnum shrink-0 text-[11px] font-bold text-ink-300">مهلت: {jalaliKeyToDisplay(t.dueDateJ)}</span>}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* recent reports */}
      <Card className="anim-fade-up" pad={false}>
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-[13px] font-black text-ink-700">آخرین گزارش‌های من</p>
          <button onClick={() => nav("/technician/reports")} className="text-[11.5px] font-black text-primary-600 hover:text-primary-700">همه گزارش‌ها</button>
        </div>
        {reports.length === 0 ? (
          <EmptyState title="هنوز گزارشی ثبت نکرده‌اید" body="اولین گزارش کار را با دکمه «ثبت گزارش سریع» بسازید." action={<Button variant="soft" icon={<Zap size={16} />} onClick={() => nav("/technician/reports/new")}>ثبت گزارش</Button>} />
        ) : (
          <div className="divide-y divide-line/70">
            {[...reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4).map((r) => (
              <button key={r.id} onClick={() => nav(`/technician/reports/${r.id}`)} className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-primary-50/40">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-black text-ink-900">{groupName(r.groupId)}</p>
                  <p className="tnum mt-0.5 text-[11px] font-bold text-ink-300">{jalaliKeyToDisplay(r.reportDateJ)} — {relativeTime(r.submittedAt || r.createdAt)}</p>
                </div>
                <span className="tnum text-[12.5px] font-black text-ink-700">{formatRial(reportTotal(r.id), false)}</span>
                <StatusBadge meta={REPORT_STATUS_META[r.status]} />
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export function TechReports() {
  const store = useStore();
  const { visibleReports, groupName, reportItems, reportTotal } = store;
  const [tab, setTab] = React.useState("all");
  const list = useMemo(() => {
    let l = visibleReports().filter((r) => r.reportType === "work_report");
    if (tab === "pending") l = l.filter((r) => PENDING.includes(r.status));
    if (tab === "approved") l = l.filter((r) => r.status === "approved" || r.status === "settled");
    if (tab === "failed") l = l.filter((r) => ["rejected", "redo_requested", "disputed"].includes(r.status));
    return [...l].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [visibleReports, tab]);

  const counts = useMemo(() => {
    const all = visibleReports().filter((r) => r.reportType === "work_report");
    return {
      pending: all.filter((r) => PENDING.includes(r.status)).length,
      approved: all.filter((r) => r.status === "approved" || r.status === "settled").length,
      failed: all.filter((r) => ["rejected", "redo_requested", "disputed"].includes(r.status)).length,
    };
  }, [visibleReports]);

  return (
    <div>
      <PageHeader title="گزارش‌های من" subtitle="وضعیت گردش تایید هر گزارش" />
      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
        {[["all", "همه"], ["pending", `در انتظار (${faDigits(counts.pending)})`], ["approved", `تایید شده (${faDigits(counts.approved)})`], ["failed", `رد / مجدد (${faDigits(counts.failed)})`]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={cx("press h-9 shrink-0 rounded-full px-4 text-[12px] font-black transition-colors", tab === k ? "bg-ink-900 text-white" : "bg-white border border-line text-ink-500")}>{l}</button>
        ))}
      </div>
      {list.length === 0 ? (
        <Card><EmptyState icon={<ClipboardList size={28} />} title="گزارشی نیست" body="گزارش جدیدی با دکمه زیر بسازید." action={<Button variant="soft" icon={<Zap size={16} />} onClick={() => nav("/technician/reports/new")}>ثبت گزارش سریع</Button>} /></Card>
      ) : (
        <div className="stagger space-y-2.5">
          {list.map((r) => (
            <Card key={r.id} onClick={() => nav(`/technician/reports/${r.id}`)}>
              <div className="flex items-center gap-3">
                <span className="tnum flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-primary-50 text-[13px] font-black text-primary-700">{faDigits(reportItems(r.id).length)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-black text-ink-900">{groupName(r.groupId)}</p>
                  <p className="tnum mt-0.5 text-[11.5px] font-bold text-ink-400">{jalaliKeyToDisplay(r.reportDateJ)} — {relativeTime(r.submittedAt || r.createdAt)}</p>
                  {r.description && <p className="mt-1 line-clamp-1 text-[12px] text-ink-400">{r.description}</p>}
                </div>
                <div className="shrink-0 text-left">
                  <StatusBadge meta={REPORT_STATUS_META[r.status]} />
                  <p className="tnum mt-1.5 text-[13px] font-black text-ink-800">{formatRial(reportTotal(r.id), false)} <span className="text-[10px] font-bold text-ink-300">ریال</span></p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function TechScores() {
  const { user, db, userScore, reportById, groupName } = useStore();
  if (!user) return null;
  const scores = db.scoreEvents.filter((s) => s.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const total = userScore(user.id);
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="امتیازها و رزومه کاری" subtitle="پس از تایید نهایی هر گزارش، امتیاز مثبت ثبت می‌شود" />
      <div className="anim-fade-up mb-4 overflow-hidden rounded-[24px] bg-ink-900 p-6 text-center shadow-[0_18px_40px_rgba(15,23,42,0.22)]">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[18px] bg-amber-400/15 text-amber-400"><Trophy size={28} /></span>
        <p className="tnum text-[42px] font-black leading-none text-white">{faDigits(total)}</p>
        <p className="mt-2 text-[13px] font-black text-amber-400">امتیاز کاری کسب‌شده</p>
        <p className="mt-1 text-[11.5px] font-bold text-slate-400">{faDigits(scores.length)} گزارش تایید نهایی‌شده</p>
      </div>
      {scores.length === 0 ? (
        <Card><EmptyState icon={<Star size={28} />} title="هنوز امتیازی ندارید" body="با تایید نهایی گزارش‌های کار، امتیاز مثبت در رزومه شما ثبت می‌شود." /></Card>
      ) : (
        <div className="stagger space-y-2.5">
          {scores.map((s) => {
            const r = reportById(s.reportId);
            return (
              <Card key={s.id}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-[13px] font-black text-warn-700">+{faDigits(s.score)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-black text-ink-900">{s.reason}</p>
                    <p className="mt-0.5 text-[11.5px] font-bold text-ink-400">{r ? `گروه ${groupName(r.groupId)} — ${jalaliKeyToDisplay(r.reportDateJ)}` : ""}</p>
                  </div>
                  <span className="text-[11px] font-bold text-ink-300">{relativeTime(s.createdAt)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

const SYNC_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "در انتظار ارسال", cls: "bg-amber-50 text-warn-700 border-amber-200" },
  sending: { label: "در حال ارسال", cls: "bg-sky-50 text-sky-700 border-sky-200" },
  synced: { label: "ارسال شد", cls: "bg-ok-50 text-ok-700 border-green-200" },
  failed: { label: "ناموفق", cls: "bg-bad-50 text-bad-700 border-red-200" },
};

export function SyncStatus() {
  const { syncQueue, online, syncBusy, processSyncQueue, groupName, db } = useStore();
  const list = [...syncQueue].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const pending = syncQueue.filter((i) => i.status === "pending" || i.status === "failed").length;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="همگام‌سازی آفلاین" subtitle="گزارش‌های ثبت‌شده بدون اینترنت اینجا مدیریت می‌شوند"
        actions={<Button size="sm" variant={online ? "primary" : "outline"} disabled={!online || syncBusy || pending === 0} loading={syncBusy} icon={<RefreshCw size={15} />} onClick={() => processSyncQueue()}>همگام‌سازی اکنون</Button>} />

      <div className={cx("anim-fade-up mb-4 flex items-center gap-3 rounded-[20px] border p-4", online ? "border-green-200 bg-ok-50/70" : "border-amber-200 bg-warn-50/70")}>
        {online ? <CheckCircle2 size={22} className="text-ok-600" /> : <WifiOff size={22} className="text-warn-600" />}
        <div>
          <p className="text-[13.5px] font-black text-ink-900">{online ? "اتصال اینترنت برقرار است" : "اتصال اینترنت برقرار نیست"}</p>
          <p className="mt-0.5 text-[12px] font-bold leading-6 text-ink-500">
            {pending > 0
              ? online ? `${faDigits(pending)} مورد آماده ارسال است — با «همگام‌سازی اکنون» ارسال کنید یا صبر کنید تا خودکار ارسال شود.` : "به‌محض اتصال، موارد به‌صورت خودکار ارسال می‌شوند."
              : "همه گزارش‌ها ارسال شده‌اند؛ موردی در صف نیست."}
          </p>
        </div>
      </div>

      {list.length === 0 ? (
        <Card><EmptyState icon={<Send size={28} />} title="صف ارسال خالی است" body="گزارش‌هایی که آفلاین ثبت شوند اینجا قرار می‌گیرند و بعد از اتصال ارسال می‌شوند." /></Card>
      ) : (
        <div className="stagger space-y-2.5">
          {list.map((i) => {
            const payload = i.payload as { groupId?: string | null; items?: unknown[]; extras?: unknown[] };
            const meta = SYNC_META[i.status];
            return (
              <Card key={i.id}>
                <div className="flex items-center gap-3">
                  <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]", i.status === "synced" ? "bg-ok-50 text-ok-600" : i.status === "sending" ? "bg-sky-50 text-sky-600" : i.status === "failed" ? "bg-bad-50 text-bad-600" : "bg-amber-50 text-warn-600")}>
                    {i.status === "sending" ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-black text-ink-900">گزارش کار — {payload.groupId ? groupName(payload.groupId) : "بدون گروه"}</p>
                    <p className="tnum mt-0.5 text-[11px] font-bold text-ink-300" dir="ltr">{i.endpoint} — idempotency: {i.idempotencyKey.slice(0, 14)}…</p>
                    <p className="mt-0.5 text-[11px] font-bold text-ink-400">{faDigits((payload.items || []).length)} آیتم، {faDigits((payload.extras || []).length)} کار اضافی — {relativeTime(i.createdAt)}</p>
                  </div>
                  <div className="shrink-0 text-left">
                    <Badge className={meta.cls}>{meta.label}</Badge>
                    {i.attempts > 0 && <p className="tnum mt-1 text-[10.5px] font-bold text-ink-300">{faDigits(i.attempts)} تلاش</p>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TechReportDetail({ id }: { id: string }) {
  return <ReviewDetail id={id} backPath="/technician/reports" />;
}

/* ============================ supervisor home ============================ */

export function SupervisorHome() {
  const store = useStore();
  const { user, db, visibleReports, visibleTasks, userGroups, groupMembers, groupName, userName, reportTotal } = store;
  if (!user) return null;
  const work = visibleReports().filter((r) => r.reportType === "work_report");
  const queue = work.filter((r) => r.status === "supervisor_review");
  const tasks = visibleTasks().filter((t) => t.status === "open" || t.status === "in_progress");
  const groups = userGroups(user.id);
  const membersCount = new Set(groups.flatMap((g) => groupMembers(g.id).map((m) => m.user.id))).size;
  const todayKey = todayJalaliStr();
  const todayCount = work.filter((r) => r.reportDateJ === todayKey).length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="anim-fade-up mb-4">
        <h1 className="text-[21px] font-black text-ink-900">{user.fullName}</h1>
        <p className="mt-1 text-[12.5px] font-bold text-ink-400">سرپرست گروه — بررسی گزارش‌ها و راهبری اکیپ‌ها</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard delay={0} label="در انتظار بررسی" value={faDigits(queue.length)} icon={<Clock3 size={19} />} tone={queue.length ? "warn" : "ok"} sub={queue.length ? "هم‌اکنون در نوبت شما" : "صف خالی است"} onClick={() => nav("/supervisor/reviews")} />
        <KpiCard delay={50} label="کارهای گروه" value={faDigits(tasks.length)} icon={<ClipboardList size={19} />} tone="cyan" onClick={() => nav("/supervisor/tasks")} />
        <KpiCard delay={100} label="اعضای گروه‌ها" value={faDigits(membersCount)} icon={<Trophy size={19} />} tone="primary" onClick={() => nav("/supervisor/group")} />
        <KpiCard delay={150} label="گزارش‌های امروز" value={faDigits(todayCount)} icon={<CheckCircle2 size={19} />} tone="teal" onClick={() => nav("/supervisor/reviews")} />
      </div>

      <Card className="anim-fade-up mb-4 flex flex-wrap items-center justify-between gap-3 border-primary-200 bg-primary-50/50">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-primary-600 text-white"><CheckCircle2 size={20} /></span>
          <div>
            <p className="text-[14px] font-black text-ink-900">بررسی گزارش‌های اکیپ</p>
            <p className="mt-0.5 text-[12px] font-bold text-ink-400">تایید، رد یا درخواست انجام مجدد با ثبت دلیل</p>
          </div>
        </div>
        <Button onClick={() => nav("/supervisor/reviews")}>شروع بررسی</Button>
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        {groups.map((g) => (
          <span key={g.id} className="anim-fade-up rounded-full border border-line bg-white px-4 py-2 text-[12.5px] font-black text-ink-700">{g.name}</span>
        ))}
      </div>

      <Card pad={false} className="anim-fade-up">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-[13px] font-black text-ink-700">آخرین گزارش‌های گروه</p>
          <button onClick={() => nav("/supervisor/reviews")} className="text-[11.5px] font-black text-primary-600 hover:text-primary-700">همه</button>
        </div>
        {work.length === 0 ? (
          <EmptyState title="گزارشی در گروه نیست" body="گزارش‌های نیروهای گروه اینجا نمایش داده می‌شوند." />
        ) : (
          <div className="divide-y divide-line/70">
            {[...work].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map((r) => (
              <button key={r.id} onClick={() => nav(`/supervisor/reviews/${r.id}`)} className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-primary-50/40">
                <Avatar name={userName(r.userId)} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-black text-ink-900">{userName(r.userId)}</p>
                  <p className="mt-0.5 truncate text-[11px] font-bold text-ink-400">{groupName(r.groupId)} — {jalaliKeyToDisplay(r.reportDateJ)}</p>
                </div>
                <span className="tnum text-[12px] font-black text-ink-700">{formatRial(reportTotal(r.id), false)}</span>
                <StatusBadge meta={REPORT_STATUS_META[r.status]} />
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
