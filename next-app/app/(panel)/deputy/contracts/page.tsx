"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { ContractList } from "@/components/contracts/contract-list";
import { PageHeader } from "@/components/ui/page-header";

export default function DeputyContractsPage() {
  return (
    <PanelPage role="DEPUTY">
      <PageHeader title="قراردادها" subtitle="فقط اطلاعات عمومی قراردادها در سامانه ذخیره می‌شود" />
      <ContractList />
    </PanelPage>
  );
}
