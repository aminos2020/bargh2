"use client";
import { use } from "react";
import { PanelPage } from "@/components/layout/panel-page";
import { PurchaseRequestDetail } from "@/components/purchase/purchase-request-detail";

export default function ContractorPurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PanelPage role="CONTRACTOR_CEO">
      <PurchaseRequestDetail id={id} backHref="/contractor-ceo/purchase-requests" canDecide canMark />
    </PanelPage>
  );
}
