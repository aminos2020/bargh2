import { z } from "zod";
import { handler, ok } from "@/lib/api-handler";
import { PriceItem } from "@/models/price-item";
import { WorkGroup } from "@/models/work-group";
import { visibleGroupIds, assertGroupVisible } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export const GET = handler({
  run: async ({ actor, query }) => {
    const groupId = query.get("groupId");
    const search = query.get("search") || "";
    const filter: Record<string, unknown> = {};
    if (search) filter.$or = [{ title: { $regex: search, $options: "i" } }, { code: { $regex: search, $options: "i" } }];

    if (groupId) {
      await assertGroupVisible(actor, groupId);
      filter.groupIds = groupId;
    } else {
      const vis = await visibleGroupIds(actor);
      if (vis !== "ALL") filter.groupIds = { $in: vis };
    }
    // تکنسین/سرپرست فقط آیتم‌های فعال و گروه‌های خودشان
    if (actor.role === "TECHNICIAN" || actor.role === "GROUP_SUPERVISOR") filter.isActive = true;

    const items = await PriceItem.find(filter).sort({ code: 1 }).limit(200).lean();
    const groups = await WorkGroup.find({}).select("name").lean();
    const gName = (id: unknown) => groups.find((g) => String(g._id) === String(id))?.name || "";
    return ok(items.map((p) => ({
      ...p, _id: String(p._id), contractId: String(p.contractId),
      groupIds: p.groupIds.map(String), groupNames: p.groupIds.map(gName),
      createdAt: new Date(p.createdAt).toISOString(),
    })));
  },
});

const createSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(2),
  unit: z.string().min(1),
  unitPrice: z.number().min(1),
  groupIds: z.array(z.string()).min(1),
});

export const POST = handler({
  roles: ["CONTRACTOR_CEO"],
  schema: createSchema,
  run: async ({ actor, body }) => {
    for (const gid of body.groupIds) await assertGroupVisible(actor, gid);
    const dup = await PriceItem.findOne({ code: body.code, contractId: { $exists: true } });
    if (dup) throw new ApiError("این کد آیتم قبلا ثبت شده است.", "DUPLICATE_CODE");
    const groups = await WorkGroup.find({ _id: { $in: body.groupIds } });
    const contractId = groups[0]?.contractId;
    if (!contractId) throw new ApiError("قرارداد گروه مشخص نیست.", "BAD_STATE");
    const doc = await PriceItem.create({ ...body, code: body.code.trim(), contractId, isActive: true });
    await logAudit({ actorUserId: actor._id, actorRole: actor.role, action: "ایجاد آیتم بها", entity: "price", entityId: String(doc._id), detail: `${doc.code} — ${doc.title} — ${doc.unitPrice} ریال` });
    return ok({ id: String(doc._id) });
  },
});

export const dynamic = "force-dynamic";
