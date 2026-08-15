"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { PurchaseRequestList } from "@/components/purchase/purchase-request-list";
import { PageHeader } from "@/components/ui/page-header";

export default function TechPurchasesPage() {
  return (
    <PanelPage role="TECHNICIAN">
      <PageHeader title="درخواست‌های خرید من" subtitle="ثبت درخواست خرید و تجهیز مورد نیاز در میدان" />
      <PurchaseRequestList basePath="/technician/purchase-requests" canCreate detailBase="/technician/purchase-requests" />
    </PanelPage>
  );
}
