"use client";
import Link from "next/link";
import { Home, Zap, ListTodo, FileText, UserRound, ClipboardCheck, Users, PenLine, Boxes, ShoppingCart, Activity, BarChart3, Building2, Receipt, Star } from "lucide-react";
import type { Role } from "@/types";
import { navItemsFor } from "./app-shell";
import { cn } from "@/lib/cn";

const ICONS = { Home, Zap, ListTodo, FileText, UserRound, ClipboardCheck, Users, PenLine, Boxes, ShoppingCart, Activity, BarChart3, Building2, Receipt, Star };

export function MobileNav({ role, activePath }: { role: Role; activePath: string }) {
  const items = navItemsFor(role, ICONS);
  const isActive = (href: string) => {
    if (href.endsWith("/reports/new")) return activePath === href;
    if (activePath === href) return true;
    return href !== `/${role === "DEPUTY" ? "deputy" : ""}` && activePath.startsWith(href + "/");
  };
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="ناوبری پایین"
    >
      <div className="grid h-16 grid-cols-5">
        {items.map((it) => {
          const Icon = it.icon;
          const on = isActive(it.href);
          return (
            <Link key={it.key} href={it.href} className="press flex flex-col items-center justify-center gap-1">
              <span className={cn("flex h-8 w-14 items-center justify-center rounded-full transition-all duration-200", on ? "bg-primary-600 text-white shadow-sm shadow-primary-600/30" : "text-ink-400")}>
                <Icon size={19} />
              </span>
              <span className={cn("text-[10px] font-black", on ? "text-primary-700" : "text-ink-400")}>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
