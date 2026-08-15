import { z } from "zod";
import { handler, ok, ApiError } from "@/lib/api-handler";
import { WorkGroup } from "@/models/work-group";
import { GroupMembership } from "@/models/group-membership";
import { User } from "@/models/user";
import { Company } from "@/models/company";
import { visibleGroupIds } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export const GET = handler({
  run: async ({ actor, query }) => {
    if (query.get("mine") === "1") {
      const vis = await visibleGroupIds(actor);
      if (vis === "ALL") return ok((await WorkGroup.find({}).sort({ createdAt: -1 }).lean()).map(serialize));
      return ok((await WorkGroup.find({ _id: { $in: vis } }).lean()).map(serialize));
    }
    const filter: Record<string, unknown> = {};
    if (actor.role === "CONTRACTOR_CEO" || actor.role === "RESIDENT_REP") filter.companyId = actor.companyId;
    const all = await WorkGroup.find(filter).sort({ createdAt: -1 }).lean();
    const enriched = await Promise.all(all.map(async (g) => ({
      ...serialize(g),
      memberCount: await GroupMembership.countDocuments({ groupId: g._id, isActive: true }),
      supervisorName: g.supervisorUserId ? (await User.findById(g.supervisorUserId).select("fullName").lean())?.fullName || null : null,
    })));
    return ok(enriched);
  },
});

function serialize(g: Record<string, any>) {
  return {
    _id: String(g._id), name: g.name, description: g.description,
    companyId: String(g.companyId), contractId: String(g.contractId),
    workUnitId: g.workUnitId ? String(g.workUnitId) : null,
    supervisorUserId: g.supervisorUserId ? String(g.supervisorUserId) : null,
    isActive: g.isActive, createdAt: new Date(g.createdAt).toISOString(),
  };
}

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  contractId: z.string().min(1),
  supervisorUserId: z.string().nullable().optional(),
  memberIds: z.array(z.string()).optional(),
});

export const POST = handler({
  roles: ["CONTRACTOR_CEO", "DEPUTY"],
  schema: createSchema,
  run: async ({ actor, body }) => {
    if (!actor.companyId && actor.role === "CONTRACTOR_CEO") throw new ApiError("کاربر به شرکتی متصل نیست.", "BAD_STATE");
    const doc = await WorkGroup.create({
      name: body.name.trim(),
      description: body.description,
      companyId: actor.companyId,
      contractId: body.contractId,
      supervisorUserId: body.supervisorUserId || null,
    });
    if (body.supervisorUserId) {
      await GroupMembership.findOneAndUpdate(
        { userId: body.supervisorUserId, groupId: doc._id, membershipType: "supervisor" },
        { isActive: true }, { upsert: true }
      );
    }
    if (body.memberIds?.length) {
      await GroupMembership.insertMany(body.memberIds.map((uid) => ({ userId: uid, groupId: doc._id, membershipType: "member", isActive: true })));
    }
    await logAudit({ actorUserId: actor._id, actorRole: actor.role, action: "ایجاد گروه", entity: "group", entityId: String(doc._id), detail: doc.name });
    return ok({ id: String(doc._id) });
  },
});

export const dynamic = "force-dynamic";
void Company;
