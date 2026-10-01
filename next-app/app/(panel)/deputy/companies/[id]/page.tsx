"use client";
import { use } from "react";
import { PanelPage } from "@/components/layout/panel-page";
import { CompanyDetail } from "@/components/companies/company-detail";

export default function DeputyCompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PanelPage role="DEPUTY">
      <CompanyDetail id={id} />
    </PanelPage>
  );
}
