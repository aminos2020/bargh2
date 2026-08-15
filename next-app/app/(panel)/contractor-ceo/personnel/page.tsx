"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { PersonnelList } from "@/components/personnel/personnel-list";
import { PageHeader } from "@/components/ui/page-header";

export default function PersonnelPage() {
  return (
    <PanelPage role="CONTRACTOR_CEO">
      <PageHeader title="نیروهای شرکت" subtitle="کارشناسان، سرپرستان و نماینده مقیم — ثبت‌نام فقط توسط شما" />
      <PersonnelList />
    </PanelPage>
  );
}
