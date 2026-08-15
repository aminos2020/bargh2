"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/toast";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useSession } from "@/hooks/use-session";
import { useSync } from "@/hooks/use-sync";
import type { Role } from "@/types";

const ROLE_HOME: Record<Role, string> = {
  DEPUTY: "/deputy", EMPLOYER_CEO: "/employer-ceo", EMPLOYER_EXPERT: "/employer-expert",
  CONTRACTOR_CEO: "/contractor-ceo", RESIDENT_REP: "/resident", GROUP_SUPERVISOR: "/supervisor", TECHNICIAN: "/technician",
};

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

/**
 * گارد کلاینت: بدون نشست -> /login ، نقش متفاوت -> پنل خود کاربر.
 * (لایه‌ی اصلی امنیت همیشه middleware + APIهای سرور است.)
 */
export function AuthGuard({ expected, children }: { expected: Role; children: ReactNode }) {
  return (
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <Inner expected={expected}>{children}</Inner>
      </ToastProvider>
    </QueryClientProvider>
  );
}

function Inner({ expected, children }: { expected: Role; children: ReactNode }) {
  const { me, loading } = useSession();
  const router = useRouter();
  useSync();

  useEffect(() => {
    if (loading) return;
    if (!me) router.replace("/login");
    else if (me.role !== expected) router.replace(ROLE_HOME[me.role]);
  }, [me, loading, router, expected]);

  if (loading || !me || me.role !== expected) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        <LoadingSkeleton className="h-9 w-52" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} className="h-[104px] rounded-card" />)}
        </div>
        <LoadingSkeleton className="h-64 rounded-card" />
      </div>
    );
  }
  return <>{children}</>;
}
