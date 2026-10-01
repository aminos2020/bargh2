"use client";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarClock } from "lucide-react";
import type { Task } from "@/types";
import { TASK_STATUS_LABEL, PRIORITY_LABEL } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiPatch } from "@/lib/api-fetch";
import { useToast } from "@/components/ui/toast";

export function TaskCard({ task, canChangeStatus }: { task: Task; canChangeStatus?: boolean }) {
  const toast = useToast();
  const qc = useQueryClient();

  const setStatus = async (status: Task["status"]) => {
    try {
      await apiPatch(`/api/v1/tasks/${task._id}`, { status });
      toast("وضعیت کار به‌روزرسانی شد.", "success");
      qc.invalidateQueries({ queryKey: ["tasks"] });
    } catch (e) {
      toast(e instanceof Error ? e.message : "ناموفق بود.", "error");
    }
  };

  return (
    <Card className="anim-fade-up">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[14px] font-black text-ink-900">{task.title}</p>
            <StatusBadge status={task.priority} meta={undefined} />
          </div>
          {task.description && <p className="mt-1 line-clamp-2 text-[12px] font-bold leading-6 text-ink-400">{task.description}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-ink-300">
            <span>مبدا: {task.creatorName || "—"}</span>
            {(task.groupNames || []).length > 0 && <span>گروه: {task.groupNames?.join("، ")}</span>}
            {(task.assignedNames || []).length > 0 && <span>نیروها: {task.assignedNames?.join("، ")}</span>}
            {task.dueDate && <span className="flex items-center gap-1"><CalendarClock size={12} /> مهلت: {task.dueDate}</span>}
          </div>
        </div>
        <StatusBadge status={task.status} />
      </div>
      {canChangeStatus && task.status !== "done" && task.status !== "cancelled" && (
        <div className="mt-3 flex gap-2 border-t border-dashed border-line pt-3">
          {task.status === "open" && <Button size="sm" variant="soft" onClick={() => setStatus("in_progress")}>شروع کار</Button>}
          <Button size="sm" variant="success" onClick={() => setStatus("done")}>انجام شد</Button>
        </div>
      )}
      <span className="sr-only">{PRIORITY_LABEL[task.priority]} — {TASK_STATUS_LABEL[task.status]}</span>
    </Card>
  );
}
