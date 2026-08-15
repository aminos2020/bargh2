"use client";
import { use } from "react";
import { PanelPage } from "@/components/layout/panel-page";
import { ContractDetail } from "@/components/contracts/contract-detail";

export default function DeputyContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PanelPage role="DEPUTY">
      <ContractDetail id={id} />
    </PanelPage>
  );
}
