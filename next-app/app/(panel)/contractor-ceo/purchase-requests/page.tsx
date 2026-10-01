"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { PurchaseRequestList } from "@/components/purchase/purchase-request-list";
import { PageHeader } from "@/components/ui/page-header";

export default function ContractorPurchasesPage() {
  return (
    <PanelPage role="CONTRACTOR_CEO">
      <PageHeader title="درخواست‌های خرید و تجهیز" subtitle="همه‌ی درخواست‌های شرکت" />
      <PurchaseRequestList basePath="/contractor-ceo/purchase-requests" canCreate={false} detailBase="/contractor-ceo/purchase-requests" />
    </PanelPage>
  );
}
