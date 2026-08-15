"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { ActivityLogList } from "@/components/activity/activity-log-list";
import { PageHeader } from "@/components/ui/page-header";

export default function DeputyActivityPage() {
  return (
    <PanelPage role="DEPUTY">
      <PageHeader title="رویدادهای سامانه" subtitle="Audit Log — همه‌ی تغییرات مهم با جزییات" />
      <ActivityLogList />
    </PanelPage>
  );
}
