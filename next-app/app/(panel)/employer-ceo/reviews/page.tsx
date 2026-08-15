"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { ReportList } from "@/components/reports/report-list";

export default function CeoReviewsPage() {
  return (
    <PanelPage role="EMPLOYER_CEO">
      <ReportList
        title="تایید نهایی گزارش‌ها"
        subtitle="گزارش‌های تاییدشده توسط کارشناس کارفرما"
        detailHref={(id) => `/employer-ceo/reviews/${id}`}
        queueStatuses={["employer_ceo_review"]}
        scopeParam="my-queue"
      />
    </PanelPage>
  );
}
