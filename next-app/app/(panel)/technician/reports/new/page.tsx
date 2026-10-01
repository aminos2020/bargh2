"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { ReportForm } from "@/components/forms/report-form";
import { PageHeader } from "@/components/ui/page-header";
import { SyncStatusIndicator } from "@/components/ui/sync-status-indicator";

export default function NewReportPage() {
  return (
    <PanelPage role="TECHNICIAN">
      <PageHeader
        title="ثبت گزارش کار"
        subtitle="با چند لمس — مناسب شرایط میدانی"
        actions={<SyncStatusIndicator />}
      />
      <ReportForm backHref="/technician/reports" />
    </PanelPage>
  );
}
