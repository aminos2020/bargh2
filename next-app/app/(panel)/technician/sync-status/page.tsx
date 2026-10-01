"use client";
import { CheckCircle2, RefreshCw, UploadCloud, XCircle } from "lucide-react";
import { PanelPage } from "@/components/layout/panel-page";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useSync } from "@/hooks/use-sync";
import { useOffline } from "@/hooks/use-offline";
import { useToast } from "@/components/ui/toast";
import { relativeTimeFa } from "@/lib/date-client";
import { faDigits } from "@/lib/amount";

const ENDPOINT_FA: Record<string, string> = {
  create_report: "گزارش کار",
  create_purchase_request: "درخواست خرید",
};

export default function SyncStatusPage() {
  const { queue, syncing, flush } = useSync();
  const { online } = useOffline();
  const toast = useToast();

  const syncNow = async () => {
    if (!online) { toast("اتصال برقرار نیست؛ بعد از اتصال، خودکار ارسال می‌شود.", "warn"); return; }
    const results = await flush();
    const okCount = results.filter((r) => r.ok).length;
    if (okCount > 0) toast(`${faDigits(okCount)} مورد با موفقیت همگام‌سازی شد.`, "success");
  };

  return (
    <PanelPage role="TECHNICIAN">
      <PageHeader
        title="همگام‌سازی"
        subtitle="وضعیت صف ارسال آفلاین — هر مورد با کلید یکتا دقیقا یک بار ثبت می‌شود"
        actions={<Button size="sm" variant="soft" icon={<RefreshCw size={15} className={syncing ? "animate-spin" : ""} />} onClick={syncNow} loading={syncing}>همگام‌سازی دستی</Button>}
      />
      <Card className="mb-4 flex items-center justify-between">
        <p className="text-[13px] font-black text-ink-700">موارد در صف</p>
        <span className="tnum rounded-full bg-primary-50 px-4 py-1.5 text-[14px] font-black text-primary-700">{faDigits(queue.length)}</span>
      </Card>
      {queue.length === 0 ? (
        <Card><EmptyState icon={<CheckCircle2 size={28} />} title="همه‌چیز همگام است" body="گزارشی در صف ارسال باقی نمانده است." /></Card>
      ) : (
        <div className="stagger space-y-2.5">
          {queue.map((op) => (
            <Card key={op.idempotencyKey}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-amber-50 text-warn-600"><UploadCloud size={18} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-black text-ink-900">{ENDPOINT_FA[op.endpoint] || op.endpoint}</p>
                  <p dir="ltr" className="tnum mt-0.5 truncate text-left text-[10.5px] font-bold text-ink-300">{op.idempotencyKey}</p>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-[10.5px] font-black text-warn-700">در انتظار ارسال</span>
              </div>
            </Card>
          ))}
        </div>
      )}
      {!online && (
        <p className="mt-4 flex items-center gap-2 rounded-input border border-amber-200 bg-warn-50 px-4 py-3 text-[12px] font-bold text-warn-700">
          <XCircle size={15} /> آفلاین هستید — به‌محض اتصال، صف به‌صورت خودکار ارسال می‌شود.
        </p>
      )}
    </PanelPage>
  );
}
