"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { CompanyList } from "@/components/companies/company-list";
import { PageHeader } from "@/components/ui/page-header";

export default function DeputyCompaniesPage() {
  return (
    <PanelPage role="DEPUTY">
      <PageHeader title="شرکت‌های پیمانکار" subtitle="ایجاد و مدیریت شرکت‌ها و مسوولان آن‌ها" />
      <CompanyList />
    </PanelPage>
  );
}
