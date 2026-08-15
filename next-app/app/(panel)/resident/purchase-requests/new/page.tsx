"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { PurchaseRequestForm } from "@/components/forms/purchase-request-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NewPurchasePage() {
  return (
    <PanelPage role="RESIDENT_REP">
      <PageHeader title="درخواست خرید جدید" subtitle="حتی در حالت آفلاین ذخیره و بعدا ارسال می‌شود" />
      <PurchaseRequestForm backHref="/resident/purchase-requests" />
    </PanelPage>
  );
}
