"use client";
import type { ReactNode } from "react";
import type { Role } from "@/types";
import { DesktopSidebar } from "./desktop-sidebar";
import { Header } from "./header";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { useSession } from "@/hooks/use-session";
import { useRtl } from "@/hooks/use-rtl";
import type { NavItem } from "./app-shell";
import type { Crumb } from "@/components/ui/breadcrumb";

interface Props {
  role: Role;
  activePath: string;
  children: ReactNode;
  crumbs?: Crumb[];
  extraNav?: NavItem[];
}

export function DesktopLayout({ role, activePath, children, crumbs, extraNav }: Props) {
  const { me } = useSession();
  useRtl();
  return (
    <div className="min-h-screen">
      <OfflineBanner />
      <DesktopSidebar role={role} activePath={activePath} me={me} extraNav={extraNav} />
      <div className="lg:ps-[280px]">
        <Header crumbs={crumbs} />
        <main className="px-6 py-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
