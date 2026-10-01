import { z } from "zod";
import { handler, ok, paginate } from "@/lib/api-handler";
import { Task } from "@/models/task";
import { User } from "@/models/user";
import { WorkGroup } from "@/models/work-group";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notification";
import { jalaliDateSchema, prioritySchema } from "@/lib/validators";

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  groupId: z.string().min(1),
  userIds: z.array(z.string()).optional(),
  priority: prioritySchema,
  dueDate: jalaliDateSchema.nullable().optional(),
});

export const GET = handler({
  run: async ({ actor, query }) => {
    const status = query.get("status");
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    switch (actor.role) {
      case "DEPUTY":
        break;
      case "TECHNICIAN":
        filter.$or = [{ assignedUserIds: actor._id }, { assignedGroupIds: { $in: await myGroupIds(actor) } }, { createdByUserId: actor._id }];
        break;
      case "GROUP_SUPERVISOR": {
        const gids = await myGroupIds(actor);
        filter.$or = [{ assignedGroupIds: { $in: gids } }, { assignedUserIds: actor._id }, { createdByUserId: actor._id }];
        break;
      }
      case "EMPLOYER_EXPERT":
      case "EMPLOYER_CEO":
        filter.$or = [{ createdByUserId: actor._id }, { assignedUserIds: actor._id }, { sourceRole: { $in: ["EMPLOYER_EXPERT", "EMPLOYER_CEO"] } }];
        break;
      default: {
        const companyGroups = await WorkGroup.find({ companyId: actor.companyId }).select("_id").lean();
        filter.$or = [{ assignedGroupIds: { $in: companyGroups.map((g) => g._id) } }, { createdByUserId: actor._id }];
      }
    }

    const all = await Task.find(filter).sort({ createdAt: -1 }).lean();
    const userIds = [...new Set(all.flatMap((t) => [...t.assignedUserIds.map(String), String(t.createdByUserId)]))];
    const users = await User.find({ _id: { $in: userIds } }).select("fullName").lean();
    const groups = await WorkGroup.find({}).select("name").lean();
    const uName = (id: unknown) => users.find((u) => String(u._id) === String(id))?.fullName || "—";
    const gName = (id: unknown) => groups.find((g) => String(g._id) === String(id))?.name || "—";

    return ok(paginate(all.map((t) => ({
      ...t, _id: String(t._id),
      createdByUserId: String(t.createdByUserId),
      assignedUserIds: t.assignedUserIds.map(String),
      assignedGroupIds: t.assignedGroupIds.map(String),
      contractId: t.contractId ? String(t.contractId) : null,
      groupId: t.groupId ? String(t.groupId) : null,
      creatorName: uName(t.createdByUserId),
      assignedNames: t.assignedUserIds.map(uName),
      groupNames: t.assignedGroupIds.map(gName),
      createdAt: new Date(t.createdAt).toISOString(),
    })), query));
  },
});

async function myGroupIds(actor: InstanceType<typeof User>): Promise<string[]> {
  const { GroupMembership } = await import("@/models/group-membership");
  const ms = await GroupMembership.find({ userId: actor._id, isActive: true }).lean();
  return ms.map((m) => m.groupId);
}

export const POST = handler({
  roles: ["EMPLOYER_EXPERT", "EMPLOYER_CEO", "GROUP_SUPERVISOR", "CONTRACTOR_CEO"],
  schema: createSchema,
  run: async ({ actor, body }) => {
    const doc = await Task.create({
      title: body.title.trim(),
      description: body.description,
      createdByUserId: actor._id,
      assignedUserIds: body.userIds || [],
      assignedGroupIds: [body.groupId],
      groupId: body.groupId,
      priority: body.priority,
      dueDate: body.dueDate || null,
      status: "open",
      sourceRole: actor.role,
    });
    await logAudit({ actorUserId: actor._id, actorRole: actor.role, action: "ایجاد کار", entity: "task", entityId: String(doc._id), detail: doc.title });
    for (const uid of body.userIds || []) {
      await notify(uid, "کار جدید محول شد", `${actor.fullName} کار «${doc.title}» را به شما محول کرد.`, "task", String(doc._id));
    }
    return ok({ id: String(doc._id) });
  },
});

export const dynamic = "force-dynamic";
