import { z } from "zod";
import { handler, ok, ApiError } from "@/lib/api-handler";
import { Task } from "@/models/task";
import { logAudit } from "@/lib/audit";

const patchSchema = z.object({
  status: z.enum(["open", "in_progress", "done", "cancelled"]).optional(),
  assignedUserIds: z.array(z.string()).optional(),
});

export const PATCH = handler({
  schema: patchSchema,
  run: async ({ actor, params, body }) => {
    const task = await Task.findById(params.id);
    if (!task) throw new ApiError("کار پیدا نشد.", "NOT_FOUND", 404);

    const involved =
      String(task.createdByUserId) === String(actor._id) ||
      task.assignedUserIds.some((u: unknown) => String(u) === String(actor._id)) ||
      ["EMPLOYER_EXPERT", "EMPLOYER_CEO", "DEPUTY", "CONTRACTOR_CEO"].includes(actor.role);
    if (!involved) throw new ApiError("دسترسی مجاز نیست.", "FORBIDDEN", 403);

    const changes: string[] = [];
    if (body.status && body.status !== task.status) {
      changes.push(`وضعیت: ${task.status} -> ${body.status}`);
      task.status = body.status;
    }
    if (body.assignedUserIds) {
      task.assignedUserIds = body.assignedUserIds;
      changes.push("تغییر تخصیص");
    }
    await task.save();
    await logAudit({ actorUserId: actor._id, actorRole: actor.role, action: "تغییر کار", entity: "task", entityId: String(task._id), detail: `${task.title} — ${changes.join("، ")}` });
    return ok({ id: String(task._id), status: task.status });
  },
});

export const dynamic = "force-dynamic";
