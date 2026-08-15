"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { ReportList } from "@/components/reports/report-list";

export default function ExpertReviewsPage() {
  return (
    <PanelPage role="EMPLOYER_EXPERT">
      <ReportList
        title="بررسی گزارش‌ها"
        subtitle="گزارش‌های تاییدشده توسط سرپرست گروه — فقط گروه‌های مجاز شما"
        detailHref={(id) => `/employer-expert/reviews/${id}`}
        queueStatuses={["expert_review"]}
        scopeParam="my-queue"
      />
    </PanelPage>
  );
}
