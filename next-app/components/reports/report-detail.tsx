"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Image as ImageIcon } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import type { ApprovalEvent, Attachment, ExtraWorkItem, ReportItem, WorkReport } from "@/types";
import { ReportSummary } from "./report-summary";
import { ReportItemList } from "./report-item-list";
import { ApprovalWorkflow } from "./approval-workflow";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { EXTRA_STATUS_FA } from "@/lib/labels";
import { formatRial } from "@/lib/amount";

interface FullReport extends WorkReport {
  items: ReportItem[];
  extras: ExtraWorkItem[];
  events: ApprovalEvent[];
  attachments: Attachment[];
}

export function ReportDetail({ id, backHref }: { id: string; backHref: string }) {
  const query = useQuery({
    queryKey: ["report", id],
    queryFn: () => apiFetch<FullReport>(`/api/v1/reports/${id}`),
  });

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <LoadingSkeleton className="h-40 rounded-card" />
        <LoadingSkeleton className="h-64 rounded-card" />
      </div>
    );
  }
  if (query.isError || !query.data) {
    return <Card><ErrorState message={query.error instanceof Error ? query.error.message : "گزارش پیدا نشد."} onRetry={() => query.refetch()} /></Card>;
  }

  const r = query.data;

  return (
    <div className="mx-auto max-w-2xl pb-28">
      <Link href={backHref} className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-black text-primary-600 hover:text-primary-700">
        <ArrowRight size={16} /> بازگشت به فهرست
      </Link>

      <ReportSummary report={r} />

      <Card className="mb-4">
        <p className="mb-3 text-[13px] font-black text-ink-700">آیتم‌های فهرست بها</p>
        <ReportItemList items={r.items} />
      </Card>

      {r.extras.length > 0 && (
        <Card className="mb-4">
          <p className="mb-3 text-[13px] font-black text-ink-700">کارهای اضافی</p>
          <div className="space-y-2.5">
            {r.extras.map((ex) => (
              <div key={ex._id} className="rounded-input border border-line bg-white p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 text-[13px] font-bold leading-6 text-ink-800">{ex.description}</p>
                  <StatusBadge status={ex.status} meta={EXTRA_STATUS_FA[ex.status]} />
                </div>
                {ex.status === "mapped" && ex.mappedAmount != null && (
                  <p className="tnum mt-2 rounded-[10px] bg-ok-50 px-3 py-2 text-[12px] font-black text-ok-700">
                    معادل‌سازی شده — مبلغ: {formatRial(ex.mappedAmount)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="mb-4">
        <p className="mb-3 flex items-center gap-2 text-[13px] font-black text-ink-700"><ImageIcon size={15} className="text-ink-300" /> مستندات و عکس‌ها</p>
        {r.attachments.length === 0 ? (
          <EmptyState title="مستندی پیوست نشده" />
        ) : (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {r.attachments.map((a) => (
              <a key={a._id} href={a.storagePath} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-[14px] border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.storagePath} alt={a.fileName} className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-105" />
              </a>
            ))}
          </div>
        )}
      </Card>

      <ApprovalWorkflow report={r} events={r.events} />
    </div>
  );
}
