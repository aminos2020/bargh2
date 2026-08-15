"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { GroupList } from "@/components/groups/group-list";
import { PageHeader } from "@/components/ui/page-header";

export default function ContractorGroupsPage() {
  return (
    <PanelPage role="CONTRACTOR_CEO">
      <PageHeader title="گروه‌های کاری" subtitle="تعریف گروه، تعیین سرپرست و تخصیص اعضا" />
      <GroupList basePath="/contractor-ceo/groups" />
    </PanelPage>
  );
}
