export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "open" | "in_progress" | "done" | "cancelled";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  createdByUserId: string;
  assignedUserIds: string[];
  assignedGroupIds: string[];
  contractId?: string | null;
  groupId?: string | null;
  priority: TaskPriority;
  dueDate?: string | null; // کلید شمسی
  status: TaskStatus;
  sourceRole: string;
  createdAt: string;
  creatorName?: string;
  assignedNames?: string[];
  groupNames?: string[];
}

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  open: "باز",
  in_progress: "در حال انجام",
  done: "انجام شده",
  cancelled: "لغو شده",
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "کم",
  medium: "متوسط",
  high: "زیاد",
  urgent: "فوری",
};
