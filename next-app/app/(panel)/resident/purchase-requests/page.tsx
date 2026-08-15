"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { PurchaseRequestList } from "@/components/purchase/purchase-request-list";
import { PageHeader } from "@/components/ui/page-header";

export default function ResidentPurchasesPage() {
  return (
    <PanelPage role="RESIDENT_REP">
      <PageHeader title="درخواست‌های خرید و تجهیز" subtitle="تایید، رد و ثبت نتیجه‌ی خرید" />
      <PurchaseRequestList basePath="/resident/purchase-requests" canCreate detailBase="/resident/purchase-requests" />
    </PanelPage>
  );
}
