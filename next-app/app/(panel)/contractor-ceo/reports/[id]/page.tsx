"use client";
import { use } from "react";
import { PanelPage } from "@/components/layout/panel-page";
import { ReportDetail } from "@/components/reports/report-detail";

export default function ContractorReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PanelPage role="CONTRACTOR_CEO">
      <ReportDetail id={id} backHref="/contractor-ceo/reports" />
    </PanelPage>
  );
}
