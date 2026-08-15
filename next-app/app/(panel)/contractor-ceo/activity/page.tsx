"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { ActivityLogList } from "@/components/activity/activity-log-list";
import { PageHeader } from "@/components/ui/page-header";

export default function ContractorActivityPage() {
  return (
    <PanelPage role="CONTRACTOR_CEO">
      <PageHeader title="فعالیت‌های شرکت" subtitle="رویدادهای نیروها و عملیات شرکت" />
      <ActivityLogList />
    </PanelPage>
  );
}
