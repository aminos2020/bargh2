"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Zap, ListTodo, FileText, UserRound, ClipboardCheck, Users, PenLine, Boxes, ShoppingCart, Activity, BarChart3, Building2, Receipt, Star, LogOut, Bolt } from "lucide-react";
import type { PublicUser, Role } from "@/types";
import { ROLE_LABEL } from "@/types";
import { navItemsFor, type NavItem } from "./app-shell";
import { cn } from "@/lib/cn";
import { apiPost } from "@/lib/api-fetch";
import { useToast } from "@/components/ui/toast";
import { Avatar } from "@/components/ui/avatar";

const ICONS = { Home, Zap, ListTodo, FileText, UserRound, ClipboardCheck, Users, PenLine, Boxes, ShoppingCart, Activity, BarChart3, Building2, Receipt, Star };

const EXTRA: Record<Role, NavItem[]> = {
  TECHNICIAN: [
    { key: "scores", label: "امتیازها", href: "/technician/scores", icon: Star },
    { key: "purchase-requests", label: "درخواست‌های خرید", href: "/technician/purchase-requests", icon: ShoppingCart },
    { key: "sync-status", label: "همگام‌سازی", href: "/technician/sync-status", icon: Activity },
  ],
  GROUP_SUPERVISOR: [{ key: "reports", label: "گزارش‌های من", href: "/supervisor/reports", icon: FileText }],
  EMPLOYER_EXPERT: [],
  EMPLOYER_CEO: [
    { key: "tasks", label: "کارهای محوله", href: "/employer-ceo/tasks", icon: ListTodo },
    { key: "daily-reports", label: "گزارش‌های روزانه", href: "/employer-ceo/daily-reports", icon: PenLine },
    { key: "activity", label: "فعالیت‌ها", href: "/employer-ceo/activity", icon: Activity },
  ],
  CONTRACTOR_CEO: [
    { key: "reports", label: "گزارش‌ها", href: "/contractor-ceo/reports", icon: FileText },
    { key: "statements", label: "صورت‌وضعیت‌ها", href: "/contractor-ceo/statements", icon: Receipt },
    { key: "purchase-requests", label: "درخواست‌های خرید", href: "/contractor-ceo/purchase-requests", icon: ShoppingCart },
    { key: "activity", label: "فعالیت‌ها", href: "/contractor-ceo/activity", icon: Activity },
    { key: "profile", label: "پروفایل", href: "/contractor-ceo/profile", icon: UserRound },
  ],
  RESIDENT_REP: [],
  DEPUTY: [
    { key: "employer-users", label: "کاربران کارفرمایی", href: "/deputy/employer-users", icon: Users },
    { key: "units", label: "واحدها", href: "/deputy/units", icon: Building2 },
    { key: "analytics", label: "تحلیل‌ها", href: "/deputy/analytics", icon: BarChart3 },
    { key: "statements", label: "صورت‌وضعیت‌ها", href: "/deputy/statements", icon: Receipt },
    { key: "activity", label: "رویدادها", href: "/deputy/activity", icon: Activity },
    { key: "settings", label: "تنظیمات", href: "/deputy/settings", icon: Star },
  ],
};

export function DesktopSidebar({ role, activePath, me, extraNav }: { role: Role; activePath: string; me: PublicUser | null; extraNav?: NavItem[] }) {
  const router = useRouter();
  const toast = useToast();
  const items = [...navItemsFor(role, ICONS), ...(extraNav || EXTRA[role] || [])];

  const logout = async () => {
    try {
      await apiPost("/api/v1/auth/logout", {});
      router.push("/login");
    } catch {
      toast("خروج ناموفق بود؛ دوباره تلاش کنید.", "error");
    }
  };

  return (
    <aside className="fixed inset-y-0 start-0 z-30 hidden w-[280px] flex-col bg-ink-900 lg:flex">
      <div className="flex items-center gap-3 px-6 py-6">
        <span className="anim-bolt flex h-11 w-11 items-center justify-center rounded-[14px] bg-primary-600 text-white">
          <Bolt size={22} fill="currentColor" strokeWidth={1.5} />
        </span>
        <div>
          <p className="text-[16px] font-black text-white">توان‌بان</p>
          <p className="text-[10.5px] font-bold text-slate-400">بهره‌برداری شبکه برق</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3.5 py-2">
        {items.map((it) => {
          const Icon = it.icon;
          const on = activePath === it.href || (it.href !== `/${rolePanel(role)}` && activePath.startsWith(it.href + "/")) || (it.key === "home" && activePath === `/${rolePanel(role)}`);
          return (
            <Link
              key={it.key + it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 rounded-[13px] px-3.5 py-2.5 text-[13px] font-bold transition-all duration-200",
                on ? "bg-primary-600 text-white shadow-lg shadow-primary-900/30" : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={18} />
              {it.label}
            </Link>
          );
        })}
      </nav>

      {me && (
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <Avatar name={me.fullName} size={38} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-black text-white">{me.fullName}</p>
              <p className="text-[10.5px] font-bold text-slate-400">{ROLE_LABEL[me.role]}</p>
            </div>
            <button onClick={logout} aria-label="خروج" className="press flex h-9 w-9 items-center justify-center rounded-[10px] text-slate-400 transition-colors hover:bg-white/10 hover:text-white">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

function rolePanel(role: Role): string {
  const map: Record<Role, string> = {
    DEPUTY: "deputy", EMPLOYER_CEO: "employer-ceo", EMPLOYER_EXPERT: "employer-expert",
    CONTRACTOR_CEO: "contractor-ceo", RESIDENT_REP: "resident", GROUP_SUPERVISOR: "supervisor", TECHNICIAN: "technician",
  };
  return map[role];
}
