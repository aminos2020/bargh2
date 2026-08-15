"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { TaskList } from "@/components/tasks/task-list";

export default function TechTasksPage() {
  return (
    <PanelPage role="TECHNICIAN" fab={{ label: "گزارش سریع", href: "/technician/reports/new" }}>
      <TaskList />
    </PanelPage>
  );
}
