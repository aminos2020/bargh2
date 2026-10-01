"use client";
import { use } from "react";
import { PanelPage } from "@/components/layout/panel-page";
import { GroupDetail } from "@/components/groups/group-detail";

export default function CeoGroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PanelPage role="EMPLOYER_CEO">
      <GroupDetail id={id} backHref="/employer-ceo/groups" />
    </PanelPage>
  );
}
