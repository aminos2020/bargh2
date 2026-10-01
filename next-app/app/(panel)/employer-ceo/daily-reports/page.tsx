"use client";
import { useQuery } from "@tanstack/react-query";
import { PenLine } from "lucide-react";
import { PanelPage } from "@/components/layout/panel-page";
import { apiFetch } from "@/lib/api-fetch";
import type { Paginated } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Avatar } from "@/components/ui/avatar";

interface Daily { _id: string; reportDateJ: string; description?: string; userName: string; }

export default function CeoDailyReportsPage() {
  const q = useQuery({ queryKey: ["daily-reports"], queryFn: () => apiFetch<Paginated<Daily>>("/api/v1/reports/daily?limit=30") });

  return (
    <PanelPage role="EMPLOYER_CEO">
      <PageHeader title="گزارش‌های روزانه کارشناسان" subtitle="فعالیت روزانه‌ی کارشناسان کارفرمای واحد" />
      {q.isLoading ? (
        <CardSkeleton rows={4} />
      ) : q.isError ? (
        <Card><ErrorState onRetry={() => q.refetch()} /></Card>
      ) : (q.data?.items || []).length === 0 ? (
        <Card><EmptyState icon={<PenLine size={28} />} title="گزارش روزانه‌ای ثبت نشده" /></Card>
      ) : (
        <div className="stagger space-y-2.5">
          {(q.data?.items || []).map((d) => (
            <Card key={d._id}>
              <div className="flex items-start gap-3">
                <Avatar name={d.userName} size={38} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[13.5px] font-black text-ink-900">{d.userName}</p>
                    <span className="tnum text-[11.5px] font-bold text-ink-300">{d.reportDateJ}</span>
                  </div>
                  {d.description && <p className="mt-1.5 whitespace-pre-line text-[12.5px] font-bold leading-7 text-ink-500">{d.description}</p>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PanelPage>
  );
}
