"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { ReportForm } from "@/components/forms/report-form";
import { PageHeader } from "@/components/ui/page-header";

/** ثبت گزارش کار توسط سرپرست — مانند کارشناس، یا به نام یکی از نیروهای گروه */
export default function SupervisorNewReportPage() {
  return (
    <PanelPage role="GROUP_SUPERVISOR">
      <PageHeader title="ثبت گزارش کار" subtitle="کار را خودتان انجام داده‌اید؟ گزارش شما مستقیم به بررسی کارشناس کارفرما می‌رود." />
      <ReportForm backHref="/supervisor/reports" />
    </PanelPage>
  );
}
