"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { GroupList } from "@/components/groups/group-list";
import { PageHeader } from "@/components/ui/page-header";

export default function CeoGroupsPage() {
  return (
    <PanelPage role="EMPLOYER_CEO">
      <PageHeader title="گروه‌های مرتبط با واحد" subtitle="تخصیص ناظران کارفرما به گروه‌ها — بدون تغییر مالکیت نیروها" />
      <GroupList basePath="/employer-ceo/groups" />
    </PanelPage>
  );
}
