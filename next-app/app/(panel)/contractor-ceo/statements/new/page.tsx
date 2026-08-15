"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { StatementForm } from "@/components/forms/statement-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NewStatementPage() {
  return (
    <PanelPage role="CONTRACTOR_CEO">
      <PageHeader title="صورت‌وضعیت جدید" subtitle="انتخاب قرارداد و بازه‌ی شمسی — پیش‌نمایش مبالغ قبل از ارسال" />
      <StatementForm />
    </PanelPage>
  );
}
