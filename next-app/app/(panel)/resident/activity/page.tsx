"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { ActivityLogList } from "@/components/activity/activity-log-list";
import { PageHeader } from "@/components/ui/page-header";

export default function ResidentActivityPage() {
  return (
    <PanelPage role="RESIDENT_REP">
      <PageHeader title="فعالیت‌ها" subtitle="معادل‌سازی‌ها و خریدهای ثبت‌شده" />
      <ActivityLogList />
    </PanelPage>
  );
}
