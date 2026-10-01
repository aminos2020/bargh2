"use client";
import { use } from "react";
import { PanelPage } from "@/components/layout/panel-page";
import { PurchaseRequestDetail } from "@/components/purchase/purchase-request-detail";

export default function ResidentPurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PanelPage role="RESIDENT_REP">
      <PurchaseRequestDetail id={id} backHref="/resident/purchase-requests" canDecide canMark />
    </PanelPage>
  );
}
