import { z } from "zod";
import { handler, ok, paginate } from "@/lib/api-handler";
import { WorkReport } from "@/models/work-report";
import { User } from "@/models/user";
import { logAudit } from "@/lib/audit";
import { jalaliKey } from "@/lib/date";
import { jalaliDateSchema } from "@/lib/validators";

const createSchema = z.object({
  reportDateJ: jalaliDateSchema.optional(),
  description: z.string().min(5, "شرح فعالیت‌ها را بنویسید."),
  notes: z.string().optional(),
});

/** گزارش روزانه‌ی کارشناس کارفرما */
export const POST = handler({
  roles: ["EMPLOYER_EXPERT"],
  schema: createSchema,
  run: async ({ actor, body }) => {
    const dateJ = body.reportDateJ || jalaliKey();
    // یک گزارش روزانه در هر روز
    const existing = await WorkReport.findOne({ userId: actor._id, reportType: "daily_report", reportDateJ: dateJ });
    if (existing) {
      existing.description = body.description + (body.notes ? `\n\nنکات: ${body.notes}` : "");
      existing.status = "submitted";
      await existing.save();
      return ok({ id: String(existing._id), updated: true });
    }
    const doc = await WorkReport.create({
      reportType: "daily_report",
      userId: actor._id,
      companyId: actor.companyId || actor.organizationId,
      contractId: actor.organizationId,
      unitId: actor.unitId || null,
      reportDateJ: dateJ,
      status: "submitted",
      description: body.description + (body.notes ? `\n\nنکات: ${body.notes}` : ""),
      idempotencyKey: `daily-${actor._id}-${dateJ}`,
      submittedAt: new Date(),
    });
    await logAudit({ actorUserId: actor._id, actorRole: actor.role, action: "ثبت گزارش روزانه", entity: "report", entityId: String(doc._id), detail: dateJ });
    return ok({ id: String(doc._id), updated: false });
  },
});

export const GET = handler({
  roles: ["EMPLOYER_CEO", "DEPUTY", "EMPLOYER_EXPERT"],
  run: async ({ actor, query }) => {
    const filter: Record<string, unknown> = { reportType: "daily_report" };
    if (actor.role === "EMPLOYER_EXPERT") filter.userId = actor._id;
    else if (actor.role === "EMPLOYER_CEO") {
      const experts = await User.find({ organizationId: actor.organizationId, role: "EMPLOYER_EXPERT" }).select("_id").lean();
      filter.userId = { $in: experts.map((e) => e._id) };
    }
    const all = await WorkReport.find(filter).sort({ reportDateJ: -1 }).lean();
    const users = await User.find({}).select("fullName").lean();
    return ok(paginate(all.map((r) => ({
      _id: String(r._id), reportDateJ: r.reportDateJ, status: r.status,
      description: r.description,
      userId: String(r.userId),
      userName: users.find((u) => String(u._id) === String(r.userId))?.fullName || "—",
      createdAt: new Date(r.createdAt).toISOString(),
    })), query));
  },
});

export const dynamic = "force-dynamic";
