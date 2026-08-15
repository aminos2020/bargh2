"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { ExtraItemList } from "@/components/extra-items/extra-item-list";
import { PageHeader } from "@/components/ui/page-header";

export default function ExtraItemsPage() {
  return (
    <PanelPage role="RESIDENT_REP">
      <PageHeader title="کارهای اضافی" subtitle="معادل‌سازی با فهرست بها — پس از معادل‌سازی در صورت‌وضعیت محاسبه می‌شود" />
      <ExtraItemList />
    </PanelPage>
  );
}
