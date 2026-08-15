"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { ActivityLogList } from "@/components/activity/activity-log-list";
import { PageHeader } from "@/components/ui/page-header";

export default function CeoActivityPage() {
  return (
    <PanelPage role="EMPLOYER_CEO">
      <PageHeader title="فعالیت‌های واحد" subtitle="رویدادهای ثبت‌شده در حوزه‌ی واحد شما" />
      <ActivityLogList />
    </PanelPage>
  );
}
