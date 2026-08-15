"use client";
import type { ReactNode } from "react";
import { Zap } from "lucide-react";
import type { Role } from "@/types";
import { MobileNav } from "./mobile-nav";
import { Header } from "./header";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { useRtl } from "@/hooks/use-rtl";

interface Props {
  role: Role;
  activePath: string;
  children: ReactNode;
  fab?: { label: string; onClick: () => void };
}

export function MobileLayout({ role, activePath, children, fab }: Props) {
  useRtl();
  return (
    <div className="min-h-screen">
      <OfflineBanner />
      <Header />
      <main className="px-4 pb-32 pt-4">
        <div className="mx-auto max-w-3xl">{children}</div>
      </main>
      {fab && (
        <button
          onClick={fab.onClick}
          className="press fixed bottom-[calc(88px+env(safe-area-inset-bottom))] end-4 z-40 flex h-14 items-center gap-2 rounded-full bg-ink-900 pe-5 ps-4 text-white shadow-[0_16px_36px_rgba(15,23,42,0.35)] lg:hidden"
        >
          <span className="anim-bolt flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
            <Zap size={18} fill="currentColor" strokeWidth={1.5} />
          </span>
          <span className="text-[13.5px] font-black">{fab.label}</span>
        </button>
      )}
      <MobileNav role={role} activePath={activePath} />
    </div>
  );
}
