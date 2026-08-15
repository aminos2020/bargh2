"use client";
import { use } from "react";
import { PanelPage } from "@/components/layout/panel-page";
import { ReportDetail } from "@/components/reports/report-detail";

export default function DeputyReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PanelPage role="DEPUTY">
      <ReportDetail id={id} backHref="/deputy/reports" />
    </PanelPage>
  );
}
