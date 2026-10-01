"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import type { Company, Contract, PublicUser } from "@/types";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";

interface Detail extends Company { ceo: PublicUser | null; contracts: Contract[]; personnel: PublicUser[]; }

export function CompanyDetail({ id }: { id: string }) {
  const query = useQuery({ queryKey: ["company", id], queryFn: () => apiFetch<Detail>(`/api/v1/companies/${id}`) });
  if (query.isLoading) return <LoadingSkeleton className="h-96 rounded-card" />;
  if (query.isError || !query.data) return <Card><ErrorState onRetry={() => query.refetch()} /></Card>;
  const c = query.data;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/deputy/companies" className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-black text-primary-600"><ArrowRight size={16} /> بازگشت به شرکت‌ها</Link>

      <Card className="mb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[17px] font-black text-ink-900">{c.name}</p>
            <p className="mt-1 text-[12px] font-bold text-ink-400">کد: {c.code}{c.phone ? ` — تلفن: ${c.phone}` : ""}</p>
            {c.description && <p className="mt-2 text-[12.5px] font-bold leading-6 text-ink-500">{c.description}</p>}
          </div>
          <Badge className={c.isActive ? "border-green-200 bg-ok-50 text-ok-700" : "border-red-200 bg-bad-50 text-bad-700"}>{c.isActive ? "فعال" : "غیرفعال"}</Badge>
        </div>
        {c.ceo && (
          <div className="mt-4 flex items-center gap-3 rounded-input bg-slate-50 p-3.5">
            <Avatar name={c.ceo.fullName} size={40} />
            <div>
              <p className="text-[13px] font-black text-ink-900">{c.ceo.fullName}</p>
              <p className="text-[11px] font-bold text-ink-400">رییس شرکت — {c.ceo.mobileMasked}</p>
            </div>
          </div>
        )}
      </Card>

      <Card className="mb-4">
        <p className="mb-3 text-[13px] font-black text-ink-700">قراردادها</p>
        {c.contracts.length === 0 ? <EmptyState title="قراردادی ندارد" /> : (
          <div className="divide-y divide-line/70">
            {c.contracts.map((ct) => (
              <div key={ct._id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-black text-ink-900">{ct.title}</p>
                  <p className="tnum mt-0.5 text-[11px] font-bold text-ink-400">{ct.startDate} تا {ct.endDate}</p>
                </div>
                <StatusBadge status={ct.status} />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <p className="mb-3 text-[13px] font-black text-ink-700">نیروها</p>
        {c.personnel.length === 0 ? <EmptyState title="نیرویی ثبت نشده" /> : (
          <div className="grid gap-2 sm:grid-cols-2">
            {c.personnel.map((p) => (
              <div key={p._id} className="flex items-center gap-2.5 rounded-input border border-line px-3 py-2.5">
                <Avatar name={p.fullName} size={32} />
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-black text-ink-800">{p.fullName}</p>
                  <p className="text-[10.5px] font-bold text-ink-300">{p.role === "TECHNICIAN" ? "کارشناس" : p.role === "GROUP_SUPERVISOR" ? "سرپرست" : "نماینده مقیم"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
