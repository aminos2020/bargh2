import React, { useEffect, useState } from "react";
import { ShieldOff, Zap, SearchX, Users } from "lucide-react";
import { ToastProvider, Button, Card, EmptyState, Avatar, Badge, cx } from "./components/ui";
import { StoreProvider, useStore } from "./store";
import { ROLE_LABEL, ROLE_PANEL } from "./types";
import { nav, relativeTime, faDigits } from "./lib/utils";
import { AppShell, ProfilePage } from "./components/shell";
import LoginPage from "./pages/login";
import ReportNewPage from "./pages/reports-new";
import { ReviewsList, ReviewDetail, TasksBoard, PurchaseBoard, ActivityTimeline } from "./pages/workflows";
import { TechHome, TechReports, TechScores, SyncStatus, TechReportDetail, SupervisorHome } from "./pages/technician";
import { ExpertHome, ExpertReviewDetail, DailyReportPage, CEOHome, CEOGroups, CEODailyReports, CEOReviewDetail } from "./pages/employer";
import { ContractorModule, ResidentModule } from "./pages/contractor";
import { DeputyModule } from "./pages/deputy";

const CREATE_TASK_ROLES = ["EMPLOYER_EXPERT", "EMPLOYER_CEO", "GROUP_SUPERVISOR", "CONTRACTOR_CEO"] as const;
const CREATE_PURCHASE_ROLES = ["TECHNICIAN", "GROUP_SUPERVISOR", "RESIDENT_REP"] as const;

function useHashLocation() {
  const [hash, setHash] = useState(window.location.hash || "");
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || "");
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const raw = hash.replace(/^#/, "");
  const [pathPart, queryPart] = raw.split("?");
  const parts = pathPart.split("/").filter(Boolean);
  return { parts, path: "/" + parts.join("/"), query: new URLSearchParams(queryPart || "") };
}

function UnauthorizedPage() {
  const { logout } = useStore();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="anim-scale-in w-full max-w-md text-center">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-bad-50 text-bad-600"><ShieldOff size={30} /></span>
        <h1 className="text-lg font-black text-ink-900">دسترسی مجاز نیست</h1>
        <p className="mt-2 text-[13px] leading-7 text-ink-400">نقش شما اجازه مشاهده این بخش را ندارد. اگر فکر می‌کنید اشتباهی رخ داده، با مدیر سامانه تماس بگیرید.</p>
        <Button className="mt-5" onClick={() => nav("/login")}>بازگشت به صفحه ورود</Button>
      </Card>
    </div>
  );
}

function NotFoundPage({ panel }: { panel: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="anim-scale-in w-full max-w-md text-center">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-slate-100 text-ink-300"><SearchX size={30} /></span>
        <h1 className="text-lg font-black text-ink-900">صفحه پیدا نشد</h1>
        <p className="mt-2 text-[13px] text-ink-400">نشانی واردشده وجود ندارد.</p>
        <Button variant="soft" className="mt-5" onClick={() => nav(`/${panel}/home`)}>بازگشت به خانه</Button>
      </Card>
    </div>
  );
}

function SupervisorGroupPage() {
  const store = useStore();
  const { user, db, userGroups, groupMembers, userName, visibleReports } = store;
  if (!user) return null;
  const groups = userGroups(user.id).filter((g) =>
    db.memberships.some((m) => m.groupId === g.id && m.userId === user.id && m.membershipType === "supervisor" && m.isActive)
  );
  const work = visibleReports().filter((r) => r.reportType === "work_report");

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-black text-ink-900 md:text-[21px]">گروه من</h1>
        <p className="mt-0.5 text-[12.5px] font-semibold text-ink-400">اعضا و وضعیت فعالیت گروه‌های تحت سرپرستی</p>
      </div>
      {groups.length === 0 ? (
        <Card><EmptyState icon={<Users size={28} />} title="گروهی تحت سرپرستی شما نیست" body="رییس شرکت می‌تواند شما را به عنوان سرپرست گروه تعیین کند." /></Card>
      ) : (
        <div className="stagger space-y-4">
          {groups.map((g) => {
            const members = groupMembers(g.id).filter((m) => m.type === "member" || m.type === "supervisor");
            const groupReports = work.filter((r) => r.groupId === g.id);
            return (
              <Card key={g.id}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[15px] font-black text-ink-900">{g.name}</p>
                    {g.description && <p className="mt-0.5 text-[12px] text-ink-400">{g.description}</p>}
                  </div>
                  <Badge className="border-primary-200 bg-primary-50 text-primary-700">{faDigits(groupReports.length)} گزارش</Badge>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {members.map((m) => {
                    const memberReports = groupReports.filter((r) => r.userId === m.user.id);
                    const last = memberReports.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
                    return (
                      <div key={m.user.id} className="flex items-center gap-3 rounded-[14px] border border-line px-3 py-2.5">
                        <Avatar name={m.user.fullName} size={36} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-black text-ink-800">{m.user.fullName}</p>
                          <p className="mt-0.5 text-[10.5px] font-bold text-ink-300">
                            {m.type === "supervisor" ? "سرپرست گروه" : `${faDigits(memberReports.length)} گزارش — آخرین: ${last ? relativeTime(last.createdAt) : "ندارد"}`}
                          </p>
                        </div>
                        <span className={cx("h-2 w-2 rounded-full", m.user.isActive ? "bg-ok-600" : "bg-slate-300")} />
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RoleRouter() {
  const { session, user } = useStore();
  const { parts, path, query } = useHashLocation();
  const panel = parts[0] || "";
  const page = parts[1] || "home";
  const param = parts[2];

  useEffect(() => {
    if (session && (parts.length === 0 || path === "/login")) nav(`/${ROLE_PANEL[session.role]}/home`);
    if (!session && parts.length > 0 && path !== "/login") nav("/login");
  }, [session, path, parts.length]);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [path]);

  if (!session || !user) return <LoginPage />;
  if (path === "/login" || parts.length === 0) return <LoginPage />;

  const expectedPanel = ROLE_PANEL[session.role];
  if (panel !== expectedPanel) return <UnauthorizedPage />;

  let content: React.ReactNode = null;
  let showFab = false;

  switch (session.role) {
    case "TECHNICIAN": {
      showFab = ["home", "reports", "tasks", "scores"].includes(page);
      if (page === "home") content = <TechHome />;
      else if (page === "reports" && param === "new") content = <ReportNewPage taskParam={query.get("task")} />;
      else if (page === "reports" && param) content = <TechReportDetail id={param} />;
      else if (page === "reports") content = <TechReports />;
      else if (page === "tasks") content = <TasksBoard createRoles={[...CREATE_TASK_ROLES]} forTech />;
      else if (page === "scores") content = <TechScores />;
      else if (page === "purchase-requests") content = <PurchaseBoard decideRoles={[]} markRole={null} createRoles={[...CREATE_PURCHASE_ROLES]} />;
      else if (page === "sync-status") content = <SyncStatus />;
      else if (page === "profile") content = <ProfilePage />;
      break;
    }
    case "GROUP_SUPERVISOR": {
      if (page === "home") content = <SupervisorHome />;
      else if (page === "reviews" && param) content = <ReviewDetail id={param} backPath="/supervisor/reviews" />;
      else if (page === "reviews") content = <ReviewsList scope="supervisor" title="تایید گزارش‌ها" subtitle="گزارش‌های گروه‌های تحت سرپرستی شما" />;
      else if (page === "tasks") content = <TasksBoard createRoles={[...CREATE_TASK_ROLES]} />;
      else if (page === "group") content = <SupervisorGroupPage />;
      else if (page === "profile") content = <ProfilePage />;
      break;
    }
    case "EMPLOYER_EXPERT": {
      if (page === "home") content = <ExpertHome />;
      else if (page === "reviews" && param) content = <ExpertReviewDetail id={param} />;
      else if (page === "reviews") content = <ReviewsList scope="expert" title="بررسی گزارش‌ها" subtitle="گزارش‌های تاییدشده توسط سرپرست گروه" />;
      else if (page === "daily-report") content = <DailyReportPage />;
      else if (page === "tasks") content = <TasksBoard createRoles={[...CREATE_TASK_ROLES]} />;
      else if (page === "profile") content = <ProfilePage />;
      break;
    }
    case "EMPLOYER_CEO": {
      if (page === "home") content = <CEOHome />;
      else if (page === "reviews" && param) content = <CEOReviewDetail id={param} />;
      else if (page === "reviews") content = <ReviewsList scope="ceo" title="تایید نهایی گزارش‌ها" subtitle="گزارش‌های تاییدشده توسط کارشناس کارفرما" />;
      else if (page === "reports") content = <ReviewsList scope="ceo" title="گزارش‌های واحد" subtitle="همه گزارش‌های گروه‌های زیرمجموعه" />;
      else if (page === "groups") content = <CEOGroups />;
      else if (page === "tasks") content = <TasksBoard createRoles={[...CREATE_TASK_ROLES]} />;
      else if (page === "daily-reports") content = <CEODailyReports />;
      else if (page === "activity") content = <ActivityTimeline title="فعالیت‌های واحد" />;
      else if (page === "profile") content = <ProfilePage />;
      break;
    }
    case "CONTRACTOR_CEO": {
      if (page === "profile") content = <ProfilePage />;
      else content = <ContractorModule page={page} param={param} />;
      break;
    }
    case "RESIDENT_REP": {
      if (page === "profile") content = <ProfilePage />;
      else content = <ResidentModule page={page} />;
      break;
    }
    case "DEPUTY": {
      content = <DeputyModule page={page} param={param} query={query} />;
      break;
    }
  }

  if (content === null) return <NotFoundPage panel={expectedPanel} />;

  return (
    <AppShell
      page={parts.slice(1).join("/") || "home"}
      fab={showFab ? { label: "گزارش سریع", icon: <Zap size={20} fill="currentColor" strokeWidth={1.5} />, onClick: () => nav("/technician/reports/new") } : undefined}
    >
      {content}
    </AppShell>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <StoreProvider>
        <RoleRouter />
      </StoreProvider>
    </ToastProvider>
  );
}
