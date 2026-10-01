"use client";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell, type NavItem } from "./app-shell";
import type { Role } from "@/types";

interface Props {
  role: Role;
  children: ReactNode;
  fab?: { label: string; href: string };
  extraNav?: NavItem[];
}

/**
 * پوشش مشترک همه‌ی صفحات پنل:
 * AuthGuard (نقش) + AppShell (موبایل/دسکتاپ) + مسیر فعال از URL.
 */
export function PanelPage({ role, children, fab, extraNav }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <AuthGuard expected={role}>
      <AppShell
        role={role}
        activePath={pathname}
        fab={fab ? { label: fab.label, onClick: () => router.push(fab.href) } : undefined}
        extraNav={extraNav}
      >
        {children}
      </AppShell>
    </AuthGuard>
  );
}
