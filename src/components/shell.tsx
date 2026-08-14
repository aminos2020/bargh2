import React, { useMemo, useState } from "react";
import {
  Activity, BarChart3, Building2, CheckCheck, ChevronLeft, ClipboardCheck, ClipboardList, Coins, FileSignature,
  FileText, HardHat, Home, Landmark, LayoutDashboard, ListTodo, LogOut, MoreHorizontal, PenLine,
  PackageSearch, Receipt, RefreshCw, Settings, ShoppingCart, Trophy, User as UserIcon, Users, Wifi, WifiOff, Zap,
} from "lucide-react";
import { useStore } from "../store";
import type { Role } from "../types";
import { ROLE_LABEL, ROLE_PANEL } from "../types";
import { nav, relativeTime } from "../lib/utils";
import { Avatar, Badge, Button, EmptyState, IconBtn, Input, KeyValue, Modal, cx, useToast } from "./ui";

interface NavItem { key: string; label: string; icon: React.ReactNode; }

export const ROLE_NAV: Record<Role, NavItem[]> = {
  TECHNICIAN: [
    { key: "home", label: "خانه", icon: <Home size={21} /> },
    { key: "reports/new", label: "گزارش سریع", icon: <Zap size={21} /> },
    { key: "tasks", label: "کارهای من", icon: <ClipboardList size={21} /> },
    { key: "reports", label: "گزارش‌های من", icon: <FileText size={21} /> },
    { key: "profile", label: "پروفایل", icon: <UserIcon size={21} /> },
  ],
  GROUP_SUPERVISOR: [
    { key: "home", label: "خانه", icon: <Home size={21} /> },
    { key: "reviews", label: "تاییدها", icon: <ClipboardCheck size={21} /> },
    { key: "tasks", label: "کارها", icon: <ListTodo size={21} /> },
    { key: "group", label: "گروه من", icon: <Users size={21} /> },
    { key: "profile", label: "پروفایل", icon: <UserIcon size={21} /> },
  ],
  EMPLOYER_EXPERT: [
    { key: "home", label: "خانه", icon: <Home size={21} /> },
    { key: "reviews", label: "بررسی‌ها", icon: <ClipboardCheck size={21} /> },
    { key: "daily-report", label: "گزارش روزانه", icon: <PenLine size={21} /> },
    { key: "tasks", label: "کارها", icon: <ListTodo size={21} /> },
    { key: "profile", label: "پروفایل", icon: <UserIcon size={21} /> },
  ],
  EMPLOYER_CEO: [
    { key: "home", label: "خانه", icon: <Home size={21} /> },
    { key: "reviews", label: "بررسی‌ها", icon: <ClipboardCheck size={21} /> },
    { key: "reports", label: "گزارش‌ها", icon: <FileText size={21} /> },
    { key: "groups", label: "گروه‌ها", icon: <Users size={21} /> },
    { key: "profile", label: "پروفایل", icon: <UserIcon size={21} /> },
  ],
  CONTRACTOR_CEO: [
    { key: "home", label: "داشبورد", icon: <LayoutDashboard size={21} /> },
    { key: "personnel", label: "نیروها", icon: <HardHat size={21} /> },
    { key: "groups", label: "گروه‌ها", icon: <Users size={21} /> },
    { key: "price-list", label: "آحاد بها", icon: <Coins size={21} /> },
    { key: "__more", label: "بیشتر", icon: <MoreHorizontal size={21} /> },
  ],
  RESIDENT_REP: [
    { key: "home", label: "خانه", icon: <Home size={21} /> },
    { key: "extra-items", label: "کارهای اضافی", icon: <PackageSearch size={21} /> },
    { key: "purchase-requests", label: "خریدها", icon: <ShoppingCart size={21} /> },
    { key: "activity", label: "فعالیت", icon: <Activity size={21} /> },
    { key: "profile", label: "پروفایل", icon: <UserIcon size={21} /> },
  ],
  DEPUTY: [
    { key: "home", label: "داشبورد", icon: <LayoutDashboard size={21} /> },
    { key: "companies", label: "شرکت‌ها", icon: <Building2 size={21} /> },
    { key: "contracts", label: "قراردادها", icon: <FileSignature size={21} /> },
    { key: "reports", label: "گزارش‌ها", icon: <FileText size={21} /> },
    { key: "__more", label: "بیشتر", icon: <MoreHorizontal size={21} /> },
  ],
};

export const ROLE_MORE: Record<Role, NavItem[]> = {
  TECHNICIAN: [
    { key: "scores", label: "امتیازها و رزومه", icon: <Trophy size={19} /> },
    { key: "purchase-requests", label: "درخواست‌های خرید", icon: <ShoppingCart size={19} /> },
    { key: "sync-status", label: "همگام‌سازی آفلاین", icon: <RefreshCw size={19} /> },
  ],
  GROUP_SUPERVISOR: [],
  EMPLOYER_EXPERT: [],
  EMPLOYER_CEO: [
    { key: "tasks", label: "کارهای محوله", icon: <ListTodo size={19} /> },
    { key: "daily-reports", label: "گزارش‌های روزانه", icon: <PenLine size={19} /> },
    { key: "activity", label: "فعالیت‌ها", icon: <Activity size={19} /> },
  ],
  CONTRACTOR_CEO: [
    { key: "reports", label: "گزارش‌ها", icon: <FileText size={19} /> },
    { key: "statements", label: "صورت‌وضعیت‌ها", icon: <Receipt size={19} /> },
    { key: "purchase-requests", label: "درخواست‌های خرید", icon: <ShoppingCart size={19} /> },
    { key: "activity", label: "فعالیت‌ها", icon: <Activity size={19} /> },
    { key: "profile", label: "پروفایل", icon: <UserIcon size={19} /> },
  ],
  RESIDENT_REP: [],
  DEPUTY: [
    { key: "employer-users", label: "کاربران", icon: <Users size={19} /> },
    { key: "units", label: "واحدها", icon: <Landmark size={19} /> },
    { key: "analytics", label: "تحلیل‌ها", icon: <BarChart3 size={19} /> },
    { key: "statements", label: "صورت‌وضعیت‌ها", icon: <Receipt size={19} /> },
    { key: "activity", label: "رویدادها", icon: <Activity size={19} /> },
    { key: "settings", label: "تنظیمات", icon: <Settings size={19} /> },
  ],
};

export function entityPath(entity: string | null | undefined, entityId: string | null | undefined, role: Role): string {
  const panel = ROLE_PANEL[role];
  const id = entityId || "";
  switch (entity) {
    case "report": {
      if (role === "TECHNICIAN") return `/technician/reports/${id}`;
      if (role === "GROUP_SUPERVISOR" || role === "EMPLOYER_EXPERT" || role === "EMPLOYER_CEO") return `/${panel}/reviews/${id}`;
      if (role === "CONTRACTOR_CEO") return `/contractor-ceo/reports/${id}`;
      if (role === "DEPUTY") return `/deputy/reports/${id}`;
      return `/${panel}/home`;
    }
    case "task": return `/${panel}/tasks`;
    case "statement": return role === "DEPUTY" ? "/deputy/statements" : "/contractor-ceo/statements";
    case "purchase": return `/${panel}/purchase-requests`;
    case "extra": return role === "RESIDENT_REP" ? "/resident/extra-items" : `/${panel}/home`;
    default: return `/${panel}/home`;
  }
}

export function Logo({ dark, small }: { dark?: boolean; small?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={cx("anim-bolt flex items-center justify-center rounded-[12px] bg-primary-600 text-white", small ? "h-9 w-9" : "h-10 w-10")}>
        <Zap size={small ? 18 : 21} fill="currentColor" strokeWidth={1.5} />
      </span>
      <span>
        <span className={cx("block leading-5 font-black", small ? "text-[15px]" : "text-[17px]", dark ? "text-white" : "text-ink-900")}>توان‌بان</span>
        {!small && <span className={cx("block text-[10.5px] font-semibold", dark ? "text-slate-400" : "text-ink-300")}>معاونت بهره‌برداری برق سیستان و بلوچستان</span>}
      </span>
    </div>
  );
}

function MoreSheet({ open, onClose, role }: { open: boolean; onClose: () => void; role: Role }) {
  const items = ROLE_MORE[role];
  return (
    <Modal open={open} onClose={onClose} title="منوی بیشتر">
      <div className="grid grid-cols-1 gap-2">
        {items.map((it) => (
          <button key={it.key} onClick={() => { nav(`/${ROLE_PANEL[role]}/${it.key}`); onClose(); }}
            className="press flex items-center gap-3 rounded-[16px] border border-line bg-white px-4 py-3.5 text-start transition-colors hover:border-primary-200 hover:bg-primary-50/40">
            <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary-50 text-primary-600">{it.icon}</span>
            <span className="text-[14px] font-bold text-ink-800">{it.label}</span>
            <ChevronLeft size={18} className="ms-auto text-ink-300" />
          </button>
        ))}
      </div>
    </Modal>
  );
}

function NotificationsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { db, user, markRead, markAllRead } = useStore();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const list = useMemo(() => {
    if (!user) return [];
    return db.notifications
      .filter((n) => n.userId === user.id)
      .filter((n) => (filter === "unread" ? !n.readAt : true))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [db.notifications, user, filter]);

  return (
    <Modal open={open} onClose={onClose} title="اعلان‌ها" footer={
      <Button full variant="soft" icon={<CheckCheck size={17} />} onClick={() => { markAllRead(); }}>خواندن همه</Button>
    }>
      <div className="mb-3 flex gap-1.5">
        {([["all", "همه"], ["unread", "خوانده‌نشده"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={cx("press h-8 rounded-full px-3.5 text-[12px] font-bold", filter === k ? "bg-primary-600 text-white" : "bg-slate-100 text-ink-500")}>{l}</button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState title="اعلانی ندارید" body="هر رویداد مهم سامانه اینجا اطلاع داده می‌شود." />
      ) : (
        <div className="space-y-2">
          {list.map((n) => (
            <button key={n.id} onClick={() => { markRead(n.id); if (user) { nav(entityPath(n.entity, n.entityId, user.role)); } onClose(); }}
              className={cx("press w-full rounded-[16px] border p-3.5 text-start transition-colors", n.readAt ? "border-line bg-white" : "border-primary-200 bg-primary-50/50 hover:bg-primary-50")}>
              <div className="flex items-start gap-3">
                <span className={cx("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.readAt ? "bg-slate-300" : "bg-primary-600 pulse-dot")} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-black text-ink-900">{n.title}</span>
                  <span className="mt-0.5 block text-[12.5px] leading-6 text-ink-500">{n.body}</span>
                  <span className="mt-1 block text-[11px] font-semibold text-ink-300">{relativeTime(n.createdAt)}</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

export function AppShell({ page, children, fab }: { page: string; children: React.ReactNode; fab?: { label: string; icon: React.ReactNode; onClick: () => void } }) {
  const { user, unreadCount, online, pendingSyncCount, logout } = useStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  if (!user) return null;
  const role = user.role;
  const panel = ROLE_PANEL[role];
  const items = ROLE_NAV[role];

  const activeKey =
    items.find((i) => i.key === page)?.key ||
    items.find((i) => i.key !== "home" && i.key !== "__more" && page.startsWith(i.key))?.key ||
    (page === "home" ? "home" : "");

  const title = items.find((i) => i.key === activeKey)?.label ||
    [...items, ...ROLE_MORE[role]].find((i) => page.startsWith(i.key))?.label ||
    "سامانه توان‌بان";

  const go = (key: string) => {
    if (key === "__more") setMoreOpen(true);
    else nav(`/${panel}/${key}`);
  };

  return (
    <div className="min-h-screen">
      {/* ---------- desktop sidebar ---------- */}
      <aside className="no-print fixed inset-y-0 start-0 z-50 hidden w-[268px] flex-col border-e border-ink-800 bg-ink-900 lg:flex">
        <div className="border-b border-white/10 px-5 py-5"><Logo dark /></div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3.5 py-4">
          {items.map((it) => (
            <button key={it.key} onClick={() => go(it.key)}
              className={cx("press flex w-full items-center gap-3 rounded-[14px] px-3.5 py-3 text-[13.5px] font-bold transition-all duration-150",
                activeKey === it.key ? "bg-primary-600 text-white shadow-[0_6px_18px_rgba(37,99,235,0.35)]" : "text-slate-400 hover:bg-white/5 hover:text-white")}>
              {it.icon}{it.label}
            </button>
          ))}
          {ROLE_MORE[role].length > 0 && (
            <button onClick={() => setMoreOpen(true)} className="press flex w-full items-center gap-3 rounded-[14px] px-3.5 py-3 text-[13.5px] font-bold text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
              <MoreHorizontal size={21} />بیشتر
            </button>
          )}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-[16px] bg-white/5 p-3">
            <Avatar name={user.fullName} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-black text-white">{user.fullName}</p>
              <p className="truncate text-[11px] font-semibold text-slate-400">{ROLE_LABEL[role]}</p>
            </div>
            <button onClick={() => { logout(); nav("/login"); }} title="خروج" className="press flex h-9 w-9 items-center justify-center rounded-[11px] text-slate-400 transition-colors hover:bg-bad-600/20 hover:text-red-400">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* ---------- mobile header ---------- */}
      <header className="no-print sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-lg lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <span className="anim-bolt flex h-9 w-9 items-center justify-center rounded-[11px] bg-primary-600 text-white"><Zap size={18} fill="currentColor" strokeWidth={1.5} /></span>
            <div>
              <p className="text-[14.5px] font-black leading-5 text-ink-900">{title}</p>
              <p className="text-[10px] font-bold text-ink-300">{ROLE_LABEL[role]}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {role === "TECHNICIAN" && (
              <button onClick={() => nav("/technician/sync-status")} className={cx("press me-1 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black", pendingSyncCount > 0 ? "bg-amber-50 text-warn-700" : "bg-slate-100 text-ink-400")}>
                <RefreshCw size={13} className={pendingSyncCount > 0 ? "animate-spin" : ""} />
                {pendingSyncCount > 0 ? `${pendingSyncCount} در صف` : online ? "آنلاین" : "آفلاین"}
              </button>
            )}
            <span className={cx("me-1 h-2 w-2 rounded-full", online ? "bg-ok-600" : "bg-warn-600 pulse-dot")} title={online ? "آنلاین" : "آفلاین"} />
            {ROLE_MORE[role].length > 0 && (
              <IconBtn icon={<MoreHorizontal size={20} />} label="منوی بیشتر" onClick={() => setMoreOpen(true)} />
            )}
            <IconBtn icon={<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>} label="اعلان‌ها" onClick={() => setNotifOpen(true)} badge={unreadCount} />
          </div>
        </div>
        {!online && (
          <div className="flex items-center gap-2 bg-warn-600 px-4 py-1.5 text-[11.5px] font-black text-white">
            <WifiOff size={14} />
            اتصال اینترنت برقرار نیست — گزارش‌ها آفلاین ذخیره و بعداً ارسال می‌شوند
          </div>
        )}
      </header>

      {/* ---------- desktop topbar ---------- */}
      <div className="no-print sticky top-0 z-40 hidden h-16 items-center justify-between border-b border-line bg-white/85 px-8 backdrop-blur-lg lg:flex lg:ps-[268px]">
        <div className="flex items-center gap-2 text-[12.5px] font-bold text-ink-300">
          <span>{ROLE_LABEL[role]}</span>
          <ChevronLeft size={14} />
          <span className="text-ink-800">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {!online && (
            <span className="flex items-center gap-1.5 rounded-full bg-warn-50 px-3 py-1 text-[11.5px] font-black text-warn-700">
              <WifiOff size={13} /> حالت آفلاین
            </span>
          )}
          {online && (
            <span className="flex items-center gap-1.5 rounded-full bg-ok-50 px-3 py-1 text-[11.5px] font-black text-ok-700">
              <Wifi size={13} /> آنلاین
            </span>
          )}
          <IconBtn icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>} label="اعلان‌ها" onClick={() => setNotifOpen(true)} badge={unreadCount} />
        </div>
      </div>

      {/* ---------- content ---------- */}
      <main className="mx-auto w-full max-w-[1180px] px-4 pb-28 pt-5 md:px-6 lg:px-8 lg:pb-12 lg:ps-[calc(268px+2rem)] lg:pt-7 xl:mx-auto xl:max-w-[1400px] xl:px-10 xl:ps-[calc(268px+2.5rem)]">
        {children}
      </main>

      {/* ---------- FAB ---------- */}
      {fab && (
        <button onClick={fab.onClick}
          className="no-print press fixed bottom-[calc(88px+env(safe-area-inset-bottom))] end-4 z-40 flex h-14 items-center gap-2 rounded-full bg-primary-600 pe-5 ps-4 text-[14px] font-black text-white shadow-[0_14px_34px_rgba(37,99,235,0.45)] transition-colors hover:bg-primary-700 lg:bottom-8 lg:end-8">
          {fab.icon}{fab.label}
        </button>
      )}

      {/* ---------- mobile bottom nav ---------- */}
      <nav className="no-print fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden">
        <div className="grid h-16 grid-cols-5">
          {items.map((it) => {
            const active = activeKey === it.key;
            return (
              <button key={it.key} onClick={() => go(it.key)} className="press relative flex flex-col items-center justify-center gap-1">
                <span className={cx("flex h-8 w-14 items-center justify-center rounded-full transition-all duration-200", active ? "bg-primary-50 text-primary-700" : "text-ink-300")}>
                  {it.icon}
                </span>
                <span className={cx("text-[10px] font-black transition-colors", active ? "text-primary-700" : "text-ink-300")}>{it.label}</span>
                {active && <span className="absolute top-0 h-[3px] w-8 rounded-b-full bg-primary-600" />}
              </button>
            );
          })}
        </div>
      </nav>

      <NotificationsSheet open={notifOpen} onClose={() => setNotifOpen(false)} />
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} role={role} />
    </div>
  );
}

/* ------------------------------- Profile page ------------------------------- */

export function ProfilePage() {
  const { user, userById, userGroups, companyName, unitName, logout, updateProfile, userScore } = useStore();
  const toast = useToast();
  const [name, setName] = useState(user?.fullName || "");
  if (!user) return null;
  const groups = userGroups(user.id);
  const masked = `••••${user.mobile.slice(7)}`;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="anim-fade-up rounded-[24px] border border-line bg-white p-6 text-center shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
        <div className="mx-auto mb-3 flex justify-center"><Avatar name={user.fullName} size={84} /></div>
        <h2 className="text-lg font-black text-ink-900">{user.fullName}</h2>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Badge className="bg-primary-50 text-primary-700 border-primary-200">{ROLE_LABEL[user.role]}</Badge>
          {user.role === "TECHNICIAN" && <Badge className="bg-amber-50 text-warn-700 border-amber-200">امتیاز کاری: {userScore(user.id)}</Badge>}
        </div>
        <div className="mx-auto mt-5 max-w-sm text-start">
          <KeyValue k="شماره موبایل" v={masked} ltr />
          <KeyValue k="سازمان" v={userById(user.id) ? (user.role === "DEPUTY" ? "معاونت بهره‌برداری" : user.companyId ? companyName(user.companyId) : unitName(user.unitId)) : "—"} />
          <KeyValue k="آخرین ورود" v={relativeTime(user.lastLoginAt)} />
        </div>
      </div>

      {groups.length > 0 && (
        <div className="anim-fade-up rounded-[20px] border border-line bg-white p-5" style={{ animationDelay: "60ms" }}>
          <h3 className="mb-3 text-[14px] font-black text-ink-800">گروه‌های کاری</h3>
          <div className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <span key={g.id} className="rounded-full bg-primary-50 px-3.5 py-1.5 text-[12.5px] font-bold text-primary-700">{g.name}</span>
            ))}
          </div>
        </div>
      )}

      <div className="anim-fade-up rounded-[20px] border border-line bg-white p-5" style={{ animationDelay: "120ms" }}>
        <h3 className="mb-3 text-[14px] font-black text-ink-800">ویرایش نام نمایشی</h3>
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12" />
          <Button onClick={() => { if (name.trim().length < 3) { toast("نام باید حداقل ۳ حرف باشد", "error"); return; } updateProfile(name.trim()); }}>ذخیره</Button>
        </div>
      </div>

      <Button full variant="dangerSoft" size="lg" icon={<LogOut size={19} />} onClick={() => { logout(); nav("/login"); }} className="anim-fade-up">
        خروج از سامانه
      </Button>
      <p className="pb-2 text-center text-[11px] font-semibold text-ink-300">توان‌بان — نسخه ۱٫۰٫۰</p>
    </div>
  );
}
