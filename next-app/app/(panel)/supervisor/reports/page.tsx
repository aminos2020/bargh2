"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { ReportList } from "@/components/reports/report-list";

/** گزارش‌های شخصی خودِ سرپرست (ثبت‌شده به نام خودش) */
export default function SupervisorOwnReportsPage() {
  return (
    <PanelPage role="GROUP_SUPERVISOR" fab={{ label: "گزارش سریع", href: "/supervisor/reports/new" }}>
      <ReportList
        title="گزارش‌های من"
        subtitle="گزارش‌هایی که خودتان ثبت کرده‌اید — مستقیم در گردش کارشناس کارفرما"
        detailHref={(id) => `/supervisor/reviews/${id}`}
        scopeParam="mine"
      />
    </PanelPage>
  );
}
