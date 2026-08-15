"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { ReportList } from "@/components/reports/report-list";

export default function ContractorReportsPage() {
  return (
    <PanelPage role="CONTRACTOR_CEO">
      <ReportList
        title="گزارش‌های شرکت"
        subtitle="همه‌ی گزارش‌های نیروهای شرکت در تمام گروه‌ها"
        detailHref={(id) => `/contractor-ceo/reports/${id}`}
        exportable
      />
    </PanelPage>
  );
}
