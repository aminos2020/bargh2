"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { PriceItemList } from "@/components/price-list/price-item-list";
import { PageHeader } from "@/components/ui/page-header";

export default function PriceListPage() {
  return (
    <PanelPage role="CONTRACTOR_CEO">
      <PageHeader title="فهرست آحاد بها" subtitle="تغییر قیمت، گزارش‌های قبلی را تغییر نمی‌دهد (Snapshot)" />
      <PriceItemList />
    </PanelPage>
  );
}
