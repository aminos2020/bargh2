"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { TaskList } from "@/components/tasks/task-list";

export default function ExpertTasksPage() {
  return <PanelPage role="EMPLOYER_EXPERT"><TaskList /></PanelPage>;
}
