"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { TaskList } from "@/components/tasks/task-list";

export default function SupervisorTasksPage() {
  return <PanelPage role="GROUP_SUPERVISOR"><TaskList /></PanelPage>;
}
