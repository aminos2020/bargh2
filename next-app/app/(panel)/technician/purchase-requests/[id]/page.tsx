"use client";
import { use } from "react";
import { PanelPage } from "@/components/layout/panel-page";
import { PurchaseRequestDetail } from "@/components/purchase/purchase-request-detail";

export default function TechPurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PanelPage role="TECHNICIAN">
      <PurchaseRequestDetail id={id} backHref="/technician/purchase-requests" canDecide={false} canMark={false} />
    </PanelPage>
  );
}
