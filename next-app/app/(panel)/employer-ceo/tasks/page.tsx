"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { TaskList } from "@/components/tasks/task-list";

export default function CeoTasksPage() {
  return (
    <PanelPage role="EMPLOYER_CEO">
      <TaskList />
    </PanelPage>
  );
}
