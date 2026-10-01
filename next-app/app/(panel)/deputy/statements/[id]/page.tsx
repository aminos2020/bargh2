"use client";
import { use } from "react";
import { PanelPage } from "@/components/layout/panel-page";
import { StatementDetail } from "@/components/statements/statement-detail";

export default function DeputyStatementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PanelPage role="DEPUTY">
      <StatementDetail id={id} backHref="/deputy/statements" canDecide />
    </PanelPage>
  );
}
