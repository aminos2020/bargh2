import React, { useMemo, useState } from "react";
import { BookOpen, CheckCheck, ClipboardCheck, Clock3, FileText, ListTodo, PenLine, Send, ShieldAlert, Users } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useStore } from "../store";
import { REPORT_STATUS_META } from "../types";
import { faDigits, formatRial, jalaliKeyToDisplay, lastNDays, nav, relativeTime, todayJalaliStr, todayJalali, jalaliLong } from "../lib/utils";
import { Avatar, Badge, Button, Card, EmptyState, Field, KpiCard, PageHeader, StatusBadge, Tabs, Textarea, cx, useToast } from "../components/ui";
import { ReviewsList, ReviewDetail } from "./workflows";

const PENDING = ["supervisor_review", "expert_review", "employer_ceo_review"];

/* ============================ expert home ============================ */

export function ExpertHome() {
  const { user, visibleReports, visibleTasks, db } = useStore();
  if (!user) return null;
  const reviews = visibleReports().filter((r) => r.reportType === "work_report" && r.status === "expert_review");
  const tasks = visibleTasks().filter((t) => t.status === "open" || t.status === "in_progress");
  const today = todayJalaliStr();
  const dailyDone = db.reports.some((r) => r.reportType === "daily_report" && r.userId === user.id && r.reportDateJ === today);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="anim-fade-up mb-4">
        <h1 className="text-[21px] font-black text-ink-900">{user.fullName}</h1>
        <p className="mt-1 text-[12.5px] font-bold text-ink-400">نماینده نظارتی کارفرما — {jalaliLong(todayJalali())}</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KpiCard delay={40} label="در انتظار بررسی من" value={faDigits(reviews.length)} icon={<ClipboardCheck size={19} />} tone={reviews.length ? "warn" : "ok"} sub={reviews.length ? "هم‌اکنون در نوبت شماست" : "صف بررسی خالی است"} onClick={() => nav("/employer-expert/reviews")} />
        <KpiCard delay={90} label="کارهای محول‌شده" value={faDigits(tasks.length)} icon={<ListTodo size={19} />} tone="cyan" onClick={() => nav("/employer-expert/tasks")} />
        <KpiCard delay={140} label="گزارش روزانه امروز" value={dailyDone ? "ثبت شد" : "ثبت نشده"} icon={<BookOpen size={19} />} tone={dailyDone ? "ok" : "orange"} onClick={() => nav("/employer-expert/daily-report")} />
      </div>

      <Card className="anim-fade-up mb-4 flex flex-wrap items-center justify-between gap-3 border-primary-200 bg-primary-50/50" style-ignore="">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-primary-600 text-white"><PenLine size={20} /></span>
          <div>
            <p className="text-[14px] font-black text-ink-900">گزارش روزانه فعالیت</p>
            <p className="mt-0.5 text-[12px] font-bold text-ink-400">فعالیت‌های نظارتی امروز خود را ثبت کنید</p>
          </div>
        </div>
        <Button onClick={() => nav("/employer-expert/daily-report")} icon={<Send size={16} />}>{dailyDone ? "مشاهده و ثبت مجدد" : "ثبت گزارش روزانه"}</Button>
      </Card>

      <Card pad={false} className="anim-fade-up">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-[13px] font-black text-ink-700">گزارش‌های در صف بررسی</p>
          <button onClick={() => nav("/employer-expert/reviews")} className="text-[11.5px] font-black text-primary-600 hover:text-primary-700">همه بررسی‌ها</button>
        </div>
        {reviews.length === 0 ? (
          <EmptyState icon={<CheckCheck size={28} />} title="صف بررسی خالی است" body="گزارش‌های تاییدشده توسط سرپرست گروه، اینجا به شما ارجاع می‌شوند." />
        ) : (
          <ReviewRows ids={reviews.map((r) => r.id)} path="/employer-expert/reviews" />
        )}
      </Card>
    </div>
  );
}

export function ReviewRows({ ids, path }: { ids: string[]; path: string }) {
  const { reportById, userName, groupName, reportItems, reportTotal } = useStore();
  return (
    <div className="divide-y divide-line/70">
      {ids.map((id) => {
        const r = reportById(id);
        if (!r) return null;
        return (
          <button key={id} onClick={() => nav(`${path}/${id}`)} className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-primary-50/40">
            <Avatar name={userName(r.userId)} size={38} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-black text-ink-900">{userName(r.userId)}</p>
              <p className="mt-0.5 truncate text-[11px] font-bold text-ink-400">{groupName(r.groupId)} — {jalaliKeyToDisplay(r.reportDateJ)} — {faDigits(reportItems(id).length)} آیتم</p>
            </div>
            <span className="tnum text-[12.5px] font-black text-ink-700">{formatRial(reportTotal(id), false)}</span>
            <StatusBadge meta={REPORT_STATUS_META[r.status]} />
          </button>
        );
      })}
    </div>
  );
}

/* ============================ daily report ============================ */

export function DailyReportPage() {
  const store = useStore();
  const { user, db, userGroups, submitDailyReport } = store;
  const [desc, setDesc] = useState("");
  const [notes, setNotes] = useState("");
  const [groups, setGroups] = useState<string[]>([]);
  const toast = useToast();
  if (!user) return null;

  /* expert's groups via membership */
  const gids = db.memberships.filter((m) => m.userId === user.id && m.isActive).map((m) => m.groupId);
  const myGroups = db.groups.filter((g) => gids.includes(g.id));
  const myDailies = db.reports.filter((r) => r.reportType === "daily_report" && r.userId === user.id).sort((a, b) => b.reportDateJ.localeCompare(a.reportDateJ));

  const submit = () => {
    const res = submitDailyReport({ dateJ: todayJalaliStr(), description: desc, groupIds: groups, notes: notes || undefined });
    if (res.ok) { setDesc(""); setNotes(""); setGroups([]); }
    else toast(res.message, "error");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="گزارش روزانه فعالیت" subtitle={`امروز — ${jalaliLong(todayJalali())}`} />
      <Card className="anim-fade-up mb-4">
        <Field label="شرح فعالیت‌های امروز" required>
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="بازدیدهای میدانی، بررسی گزارش‌ها، هماهنگی‌ها و..." className="min-h-[130px]" />
        </Field>
        <Field label="گروه‌های مرتبط">
          <div className="flex flex-wrap gap-1.5">
            {myGroups.map((g) => (
              <button key={g.id} onClick={() => setGroups((p) => (p.includes(g.id) ? p.filter((x) => x !== g.id) : [...p, g.id]))}
                className={cx("press rounded-full border px-3 py-1.5 text-[12px] font-bold", groups.includes(g.id) ? "border-primary-600 bg-primary-600 text-white" : "border-line bg-white text-ink-500")}>{g.name}</button>
            ))}
          </div>
        </Field>
        <Field label="نکات">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="نکات تکمیلی برای رییس واحد..." className="min-h-[70px]" />
        </Field>
        <Button full size="lg" icon={<Send size={18} />} onClick={submit}>ثبت گزارش روزانه</Button>
      </Card>

      <Card pad={false} className="anim-fade-up">
        <p className="border-b border-line px-4 py-3 text-[13px] font-black text-ink-700">گزارش‌های روزانه قبلی</p>
        {myDailies.length === 0 ? <EmptyState title="سابقه‌ای نیست" body="اولین گزارش روزانه خود را ثبت کنید." /> : (
          <div className="divide-y divide-line/70">
            {myDailies.map((r) => (
              <div key={r.id} className="px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <span className="tnum text-[12.5px] font-black text-primary-700">{jalaliKeyToDisplay(r.reportDateJ)}</span>
                  <span className="text-[10.5px] font-bold text-ink-300">{relativeTime(r.createdAt)}</span>
                </div>
                <p className="mt-1.5 whitespace-pre-line text-[12.5px] leading-7 text-ink-600">{r.description}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export function CEODailyReports() {
  const { db, userName, userById } = useStore();
  const dailies = db.reports.filter((r) => r.reportType === "daily_report").sort((a, b) => b.reportDateJ.localeCompare(a.reportDateJ));
  return (
    <div>
      <PageHeader title="گزارش‌های روزانه کارشناسان" subtitle="فعالیت روزانه کارشناسان کارفرما" />
      {dailies.length === 0 ? (
        <Card><EmptyState icon={<BookOpen size={28} />} title="گزارش روزانه‌ای ثبت نشده" /></Card>
      ) : (
        <div className="stagger space-y-2.5">
          {dailies.map((r) => (
            <Card key={r.id}>
              <div className="flex items-center gap-3">
                <Avatar name={userName(r.userId)} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-black text-ink-900">{userName(r.userId)}</p>
                  <p className="tnum mt-0.5 text-[11px] font-bold text-ink-400">{jalaliKeyToDisplay(r.reportDateJ)}</p>
                </div>
                <Badge className="border-green-200 bg-ok-50 text-ok-700">ثبت‌شده</Badge>
              </div>
              <p className="mt-3 whitespace-pre-line rounded-[14px] bg-slate-50 p-3.5 text-[12.5px] leading-7 text-ink-600">{r.description}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================ CEO home ============================ */

export function CEOHome() {
  const store = useStore();
  const { user, visibleReports, visibleTasks, reportTotal } = store;
  if (!user) return null;
  const work = visibleReports().filter((r) => r.reportType === "work_report");
  const queue = work.filter((r) => r.status === "employer_ceo_review");
  const approved = work.filter((r) => r.status === "approved" || r.status === "settled");
  const disputed = work.filter((r) => r.status === "disputed");
  const openTasks = visibleTasks().filter((t) => t.status === "open" || t.status === "in_progress");
  const approvedSum = approved.reduce((s, r) => s + reportTotal(r.id), 0);

  const trend = useMemo(() => {
    const days = lastNDays(7);
    return days.map((d) => ({ label: d.label, count: work.filter((r) => r.reportDateJ === d.key).length }));
  }, [work]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="anim-fade-up mb-4">
        <h1 className="text-[21px] font-black text-ink-900">{user.fullName}</h1>
        <p className="mt-1 text-[12.5px] font-bold text-ink-400">رییس کارفرما — تایید نهایی گزارش‌ها و راهبری واحد</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard delay={40} label="در انتظار تایید نهایی" value={faDigits(queue.length)} icon={<ClipboardCheck size={19} />} tone={queue.length ? "warn" : "ok"} onClick={() => nav("/employer-ceo/reviews")} />
        <KpiCard delay={90} label="تایید نهایی‌شده" value={faDigits(approved.length)} icon={<CheckCheck size={19} />} tone="ok" />
        <KpiCard delay={140} label="اختلاف‌ها" value={faDigits(disputed.length)} icon={<ShieldAlert size={19} />} tone={disputed.length ? "bad" : "ink"} />
        <KpiCard delay={190} label="جمع مبلغ تاییدشده" value={formatRial(approvedSum, false)} sub="ریال" icon={<FileText size={19} />} tone="primary" />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card className="anim-fade-up">
          <p className="mb-3 text-[13px] font-black text-ink-700">روند گزارش‌های ۷ روز اخیر</p>
          <div dir="ltr" className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 4, right: 4, left: -26, bottom: 0 }}>
                <defs>
                  <linearGradient id="ceoTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 10, fontFamily: "Vazirmatn", fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fontFamily: "Vazirmatn", fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontFamily: "Vazirmatn", fontSize: 12, borderRadius: 12, border: "1px solid #e2e8f0" }} labelStyle={{ fontFamily: "Vazirmatn" }} />
                <Area type="monotone" dataKey="count" name="گزارش" stroke="#2563eb" strokeWidth={2.5} fill="url(#ceoTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card pad={false} className="anim-fade-up">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-[13px] font-black text-ink-700">در انتظار تایید نهایی</p>
            <button onClick={() => nav("/employer-ceo/reviews")} className="text-[11.5px] font-black text-primary-600 hover:text-primary-700">همه</button>
          </div>
          {queue.length === 0 ? (
            <EmptyState icon={<CheckCheck size={26} />} title="موردی در نوبت نیست" body="همه گزارش‌ها تعیین تکلیف شده‌اند." />
          ) : (
            <ReviewRows ids={queue.map((r) => r.id)} path="/employer-ceo/reviews" />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <QuickAction delay={0} label="مشاهده گزارش‌ها" icon={<FileText size={19} />} onClick={() => nav("/employer-ceo/reports")} />
        <QuickAction delay={50} label="گروه‌های واحد" icon={<Users size={19} />} onClick={() => nav("/employer-ceo/groups")} />
        <QuickAction delay={100} label="کارهای محوله" icon={<ListTodo size={19} />} onClick={() => nav("/employer-ceo/tasks")} />
      </div>
    </div>
  );
}

export function QuickAction({ label, icon, onClick, delay = 0 }: { label: string; icon: React.ReactNode; onClick: () => void; delay?: number }) {
  return (
    <button onClick={onClick} style={{ animationDelay: `${delay}ms` }}
      className="anim-fade-up press flex items-center gap-3 rounded-[18px] border border-line bg-white p-4 text-start transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
      <span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-primary-50 text-primary-600">{icon}</span>
      <span className="text-[13px] font-black text-ink-800">{label}</span>
    </button>
  );
}

/* ============================ CEO groups ============================ */

export function CEOGroups() {
  const store = useStore();
  const { user, db, userName, groupMembers, toggleMembership } = store;
  const [openId, setOpenId] = useState<string | null>(null);
  if (!user) return null;

  const gids = db.memberships.filter((m) => m.userId === user.id && m.isActive && m.membershipType === "employer_ceo").map((m) => m.groupId);
  const groups = db.groups.filter((g) => gids.includes(g.id));
  const active = db.groups.find((g) => g.id === openId);

  const contractorMembers = active
    ? db.users.filter((u) => u.companyId === active.companyId && (u.role === "TECHNICIAN" || u.role === "GROUP_SUPERVISOR") && u.isActive)
    : [];

  return (
    <div>
      <PageHeader title="گروه‌های واحد" subtitle="تخصیص نیروهای شرکتی به گروه‌ها بدون تغییر مالکیت آن‌ها" />
      {groups.length === 0 ? (
        <Card><EmptyState icon={<Users size={28} />} title="گروهی مرتبط نیست" body="هنوز گروهی به واحد شما متصل نشده است." /></Card>
      ) : (
        <div className="stagger grid gap-3 md:grid-cols-2">
          {groups.map((g) => {
            const members = groupMembers(g.id);
            return (
              <Card key={g.id} onClick={() => setOpenId(g.id)}>
                <p className="text-[14.5px] font-black text-ink-900">{g.name}</p>
                {g.description && <p className="mt-1 line-clamp-2 text-[12px] leading-6 text-ink-400">{g.description}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] font-bold text-ink-400">
                  <span>{faDigits(members.length)} عضو</span>
                  <span>سرپرست: {g.supervisorUserId ? userName(g.supervisorUserId) : "تعیین نشده"}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {active && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center md:items-center md:p-6" onClick={() => setOpenId(null)}>
          <div className="anim-fade-in absolute inset-0 bg-ink-900/50 backdrop-blur-[2px]" />
          <div onClick={(e) => e.stopPropagation()} className="anim-scale-in relative max-h-[85vh] w-full overflow-y-auto rounded-t-[24px] bg-white p-5 md:max-w-lg md:rounded-[24px]">
            <h3 className="mb-1 text-[15.5px] font-black text-ink-900">{active.name}</h3>
            <p className="mb-4 text-[12px] font-bold text-ink-400">تغییر عضویت نیروها در این گروه — مالکیت نیروها با شرکت پیمانکار باقی می‌ماند.</p>
            <div className="space-y-2">
              {contractorMembers.map((p) => {
                const isMember = db.memberships.some((m) => m.groupId === active.id && m.userId === p.id && m.isActive);
                return (
                  <div key={p.id} className="flex items-center gap-3 rounded-[14px] border border-line px-3.5 py-2.5">
                    <Avatar name={p.fullName} size={34} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-black text-ink-800">{p.fullName}</p>
                      <p className="text-[10.5px] font-bold text-ink-300">{p.role === "GROUP_SUPERVISOR" ? "سرپرست گروه" : "کارشناس شرکت"}</p>
                    </div>
                    <button onClick={() => toggleMembership(p.id, active.id, "member")}
                      className={cx("press rounded-full px-3.5 py-1.5 text-[11.5px] font-black", isMember ? "bg-ok-50 text-ok-700" : "bg-slate-100 text-ink-400 hover:bg-primary-50 hover:text-primary-700")}>
                      {isMember ? "مرتبط است" : "ارتباط با گروه"}
                    </button>
                  </div>
                );
              })}
            </div>
            <Button full variant="outline" className="mt-4" onClick={() => setOpenId(null)}>بستن</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ExpertReviewDetail({ id }: { id: string }) {
  return <ReviewDetail id={id} backPath="/employer-expert/reviews" />;
}
export function CEOReviewDetail({ id }: { id: string }) {
  return <ReviewDetail id={id} backPath="/employer-ceo/reviews" />;
}
