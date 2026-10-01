"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { StatementList } from "@/components/statements/statement-list";
import { PageHeader } from "@/components/ui/page-header";

export default function DeputyStatementsPage() {
  return (
    <PanelPage role="DEPUTY">
      <PageHeader title="صورت‌وضعیت‌ها" subtitle="بررسی، تایید یا رد صورت‌وضعیت‌های پیمانکاران" />
      <StatementList basePath="/deputy/statements" canCreate={false} />
    </PanelPage>
  );
}
