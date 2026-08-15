"use client";
import { use } from "react";
import { PanelPage } from "@/components/layout/panel-page";
import { ReportDetail } from "@/components/reports/report-detail";

export default function SupervisorReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PanelPage role="GROUP_SUPERVISOR">
      <ReportDetail id={id} backHref="/supervisor/reviews" />
    </PanelPage>
  );
}
