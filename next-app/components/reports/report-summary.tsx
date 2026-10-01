"use client";
import type { WorkReport } from "@/types";
import { formatRial } from "@/lib/amount";
import { ROLE_LABEL } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

export function ReportSummary({ report }: { report: WorkReport }) {
  return (
    <Card className="mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={report.userName} size={46} />
          <div>
            <p className="text-[15px] font-black text-ink-900">{report.userName}</p>
            <p className="mt-0.5 text-[12px] font-bold text-ink-400">{report.groupName} — تاریخ: {report.reportDateJ}</p>
          </div>
        </div>
        <StatusBadge status={report.status} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-dashed border-line pt-4 sm:grid-cols-3">
        <div>
          <p className="text-[10.5px] font-black text-ink-300">جمع مبلغ</p>
          <p className="tnum mt-1 text-[16px] font-black text-ink-900">{formatRial(report.totalAmount || 0)}</p>
        </div>
        <div>
          <p className="text-[10.5px] font-black text-ink-300">تعداد آیتم</p>
          <p className="tnum mt-1 text-[16px] font-black text-ink-900">{report.itemCount ?? "—"}</p>
        </div>
        <div>
          <p className="text-[10.5px] font-black text-ink-300">بررسی‌کننده فعلی</p>
          <p className="mt-1 text-[13px] font-black text-ink-700">{report.currentReviewerRole ? ROLE_LABEL[report.currentReviewerRole as keyof typeof ROLE_LABEL] : "—"}</p>
        </div>
      </div>
      {report.description && (
        <p className="mt-4 rounded-input bg-slate-50 px-4 py-3 text-[13px] font-bold leading-7 text-ink-500">{report.description}</p>
      )}
    </Card>
  );
}
