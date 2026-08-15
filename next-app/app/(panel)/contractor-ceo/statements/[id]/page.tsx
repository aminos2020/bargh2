"use client";
import { use } from "react";
import { PanelPage } from "@/components/layout/panel-page";
import { StatementDetail } from "@/components/statements/statement-detail";

export default function ContractorStatementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PanelPage role="CONTRACTOR_CEO">
      <StatementDetail id={id} backHref="/contractor-ceo/statements" canDecide={false} />
    </PanelPage>
  );
}
