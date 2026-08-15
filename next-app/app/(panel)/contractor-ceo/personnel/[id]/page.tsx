"use client";
import { use } from "react";
import { PanelPage } from "@/components/layout/panel-page";
import { PersonnelProfile } from "@/components/personnel/personnel-profile";

export default function PersonnelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PanelPage role="CONTRACTOR_CEO">
      <PersonnelProfile id={id} />
    </PanelPage>
  );
}
