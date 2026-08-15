"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { ReportList } from "@/components/reports/report-list";

export default function TechReportsPage() {
  return (
    <PanelPage role="TECHNICIAN" fab={{ label: "گزارش سریع", href: "/technician/reports/new" }}>
      <ReportList
        title="گزارش‌های من"
        subtitle="وضعیت گردش تایید هر گزارش"
        detailHref={(id) => `/technician/reports/${id}`}
        scopeParam="mine"
      />
    </PanelPage>
  );
}
