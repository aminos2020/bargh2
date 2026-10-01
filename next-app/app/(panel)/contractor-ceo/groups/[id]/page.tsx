"use client";
import { use } from "react";
import { PanelPage } from "@/components/layout/panel-page";
import { GroupDetail } from "@/components/groups/group-detail";

export default function ContractorGroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PanelPage role="CONTRACTOR_CEO">
      <GroupDetail id={id} backHref="/contractor-ceo/groups" />
    </PanelPage>
  );
}
