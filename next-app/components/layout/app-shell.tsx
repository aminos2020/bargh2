"use client";
import type { ReactNode } from "react";
import type { LucideIcon, Home, ClipboardCheck, ListTodo, Users, UserRound, Zap, FileText, ShoppingCart, BarChart3, Building2, Receipt, PenLine, Boxes, Star, RefreshCw, Activity } from "lucide-react";
import type { Role } from "@/types";
import { useMobile } from "@/hooks/use-mobile";
import { MobileLayout } from "./mobile-layout";
import { DesktopLayout } from "./desktop-layout";

export interface NavItem { key: string; label: string; href: string; icon: LucideIcon; }

export function navItemsFor(role: Role, icons: Record<string, LucideIcon>): NavItem[] {
  const I = icons;
  switch (role) {
    case "TECHNICIAN":
      return [
        { key: "home", label: "خانه", href: "/technician", icon: I.Home },
        { key: "reports/new", label: "گزارش سریع", href: "/technician/reports/new", icon: I.Zap },
        { key: "tasks", label: "کارهای من", href: "/technician/tasks", icon: I.ListTodo },
        { key: "reports", label: "گزارش‌های من", href: "/technician/reports", icon: I.FileText },
        { key: "profile", label: "پروفایل", href: "/technician/profile", icon: I.UserRound },
      ];
    case "GROUP_SUPERVISOR":
      return [
        { key: "home", label: "خانه", href: "/supervisor", icon: I.Home },
        { key: "reviews", label: "تاییدها", href: "/supervisor/reviews", icon: I.ClipboardCheck },
        { key: "tasks", label: "کارها", href: "/supervisor/tasks", icon: I.ListTodo },
        { key: "group", label: "گروه من", href: "/supervisor/group", icon: I.Users },
        { key: "profile", label: "پروفایل", href: "/supervisor/profile", icon: I.UserRound },
      ];
    case "EMPLOYER_EXPERT":
      return [
        { key: "home", label: "خانه", href: "/employer-expert", icon: I.Home },
        { key: "reviews", label: "بررسی‌ها", href: "/employer-expert/reviews", icon: I.ClipboardCheck },
        { key: "daily-report", label: "گزارش روزانه", href: "/employer-expert/daily-report", icon: I.PenLine },
        { key: "tasks", label: "کارها", href: "/employer-expert/tasks", icon: I.ListTodo },
        { key: "profile", label: "پروفایل", href: "/employer-expert/profile", icon: I.UserRound },
      ];
    case "EMPLOYER_CEO":
      return [
        { key: "home", label: "خانه", href: "/employer-ceo", icon: I.Home },
        { key: "reviews", label: "بررسی‌ها", href: "/employer-ceo/reviews", icon: I.ClipboardCheck },
        { key: "reports", label: "گزارش‌ها", href: "/employer-ceo/reports", icon: I.FileText },
        { key: "groups", label: "گروه‌ها", href: "/employer-ceo/groups", icon: I.Users },
        { key: "profile", label: "پروفایل", href: "/employer-ceo/profile", icon: I.UserRound },
      ];
    case "CONTRACTOR_CEO":
      return [
        { key: "home", label: "خانه", href: "/contractor-ceo", icon: I.Home },
        { key: "personnel", label: "نیروها", href: "/contractor-ceo/personnel", icon: I.Users },
        { key: "groups", label: "گروه‌ها", href: "/contractor-ceo/groups", icon: I.ClipboardCheck },
        { key: "price-list", label: "آحاد بها", href: "/contractor-ceo/price-list", icon: I.Boxes },
        { key: "more", label: "بیشتر", href: "/contractor-ceo/reports", icon: I.FileText },
      ];
    case "RESIDENT_REP":
      return [
        { key: "home", label: "خانه", href: "/resident", icon: I.Home },
        { key: "extra-items", label: "کارهای اضافی", href: "/resident/extra-items", icon: I.Boxes },
        { key: "purchase-requests", label: "خریدها", href: "/resident/purchase-requests", icon: I.ShoppingCart },
        { key: "activity", label: "فعالیت", href: "/resident/activity", icon: I.Activity },
        { key: "profile", label: "پروفایل", href: "/resident/profile", icon: I.UserRound },
      ];
    case "DEPUTY":
      return [
        { key: "home", label: "داشبورد", href: "/deputy", icon: I.BarChart3 },
        { key: "companies", label: "شرکت‌ها", href: "/deputy/companies", icon: I.Building2 },
        { key: "contracts", label: "قراردادها", href: "/deputy/contracts", icon: I.Receipt },
        { key: "reports", label: "گزارش‌ها", href: "/deputy/reports", icon: I.FileText },
        { key: "more", label: "بیشتر", href: "/deputy/analytics", icon: I.Star },
      ];
  }
}

interface Props {
  role: Role;
  activePath: string;
  children: ReactNode;
  fab?: { label: string; onClick: () => void };
  extraNav?: NavItem[];
}

export function AppShell({ role, activePath, children, fab, extraNav }: Props) {
  const mobile = useMobile();
  if (mobile) {
    return <MobileLayout role={role} activePath={activePath} fab={fab}>{children}</MobileLayout>;
  }
  return <DesktopLayout role={role} activePath={activePath} extraNav={extraNav}>{children}</DesktopLayout>;
}

export const SHELL_ICONS_KEYS = ["Home", "Zap", "ListTodo", "FileText", "UserRound", "ClipboardCheck", "Users", "PenLine", "Boxes", "ShoppingCart", "Activity", "BarChart3", "Building2", "Receipt", "Star", "RefreshCw"] as const;
