"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { PurchaseRequestForm } from "@/components/forms/purchase-request-form";
import { PageHeader } from "@/components/ui/page-header";

export default function TechNewPurchasePage() {
  return (
    <PanelPage role="TECHNICIAN">
      <PageHeader title="درخواست خرید جدید" subtitle="در حالت آفلاین ذخیره و بعد از اتصال ارسال می‌شود" />
      <PurchaseRequestForm backHref="/technician/purchase-requests" />
    </PanelPage>
  );
}
