"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { StatementList } from "@/components/statements/statement-list";
import { PageHeader } from "@/components/ui/page-header";

export default function ContractorStatementsPage() {
  return (
    <PanelPage role="CONTRACTOR_CEO">
      <PageHeader title="صورت‌وضعیت‌ها" subtitle="ساخت صورت‌وضعیت از گزارش‌های تایید نهایی‌شده" />
      <StatementList basePath="/contractor-ceo/statements" canCreate />
    </PanelPage>
  );
}
