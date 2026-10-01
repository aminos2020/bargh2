"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { GroupList } from "@/components/groups/group-list";
import { PageHeader } from "@/components/ui/page-header";

export default function SupervisorGroupPage() {
  return (
    <PanelPage role="GROUP_SUPERVISOR">
      <PageHeader title="گروه من" subtitle="اعضا و وضعیت گروه‌های تحت سرپرستی" />
      <GroupList basePath="/supervisor/group" />
    </PanelPage>
  );
}
