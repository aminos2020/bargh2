"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { ReportList } from "@/components/reports/report-list";

export default function CeoReportsPage() {
  return (
    <PanelPage role="EMPLOYER_CEO">
      <ReportList
        title="گزارش‌های واحد"
        subtitle="همه‌ی گزارش‌های گروه‌های زیرمجموعه‌ی واحد"
        detailHref={(id) => `/employer-ceo/reviews/${id}`}
      />
    </PanelPage>
  );
}
