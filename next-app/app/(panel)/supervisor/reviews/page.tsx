"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { ReportList } from "@/components/reports/report-list";

export default function SupervisorReviewsPage() {
  return (
    <PanelPage role="GROUP_SUPERVISOR">
      <ReportList
        title="تایید گزارش‌ها"
        subtitle="گزارش‌های گروه‌های تحت سرپرستی شما"
        detailHref={(id) => `/supervisor/reviews/${id}`}
        queueStatuses={["supervisor_review"]}
        scopeParam="my-queue"
      />
    </PanelPage>
  );
}
