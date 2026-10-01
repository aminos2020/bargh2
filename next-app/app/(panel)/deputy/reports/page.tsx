"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { ReportList } from "@/components/reports/report-list";

export default function DeputyReportsPage() {
  return (
    <PanelPage role="DEPUTY">
      <ReportList
        title="گزارش‌های سامانه"
        subtitle="همه‌ی گزارش‌های کار به تفکیک شرکت، قرارداد و گروه — با خروجی CSV"
        detailHref={(id) => `/deputy/reports/${id}`}
        exportable
      />
    </PanelPage>
  );
}
