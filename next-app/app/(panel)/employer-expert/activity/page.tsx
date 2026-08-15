"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { ActivityLogList } from "@/components/activity/activity-log-list";
import { PageHeader } from "@/components/ui/page-header";

export default function ExpertActivityPage() {
  return (
    <PanelPage role="EMPLOYER_EXPERT">
      <PageHeader title="فعالیت‌ها" subtitle="رویدادهای مرتبط با شما" />
      <ActivityLogList />
    </PanelPage>
  );
}
