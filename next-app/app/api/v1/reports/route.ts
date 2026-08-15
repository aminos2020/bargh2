import { z } from "zod";
import { handler, ok, paginate } from "@/lib/api-handler";
import { WorkReport } from "@/models/work-report";
import { ReportItem } from "@/models/report-item";
import { User } from "@/models/user";
import { WorkGroup } from "@/models/work-group";
import { visibleGroupIds, canSeeReport } from "@/lib/permissions";
import { createReport } from "@/services/report-service";
import { jalaliDateSchema, photoSchema } from "@/lib/validators";

const createSchema = z.object({
  groupId: z.string().min(1),
  onBehalfUserId: z.string().nullable().optional(),
  contractId: z.string().optional(),
  reportDateJ: jalaliDateSchema.optional(),
  description: z.string().optional(),
  taskReferenceId: z.string().nullable().optional(),
  offlineClientId: z.string().nullable().optional(),
  items: z.array(z.object({ priceItemId: z.string(), quantity: z.number().min(0) })),
  extras: z.array(z.object({ description: z.string().min(3) })),
  photos: z.array(photoSchema).max(10),
  idempotencyKey: z.string().min(8),
});

export const GET = handler({
  run: async ({ actor, query }) => {
    const filter: Record<string, unknown> = { reportType: "work_report" };
    const statuses = query.get("statuses");
    if (statuses) filter.status = { $in: statuses.split(",") };
    const search = query.get("search");
    const groupId = query.get("groupId");
    if (groupId) filter.groupId = groupId;

    // ایزولاسیون بر اساس نقش
    if (actor.role === "CONTRACTOR_CEO" || actor.role === "RESIDENT_REP") {
      filter.companyId = actor.companyId;
    } else if (actor.role !== "DEPUTY") {
      const vis = await visibleGroupIds(actor);
      filter.$or = [{ groupId: { $in: vis } }, { userId: actor._id }];
    }

    let all = await WorkReport.find(filter).sort({ createdAt: -1 }).lean();

    if (search) {
      const users = await User.find({ fullName: { $regex: search, $options: "i" } }).select("_id").lean();
      const groups = await WorkGroup.find({ name: { $regex: search, $options: "i" } }).select("_id").lean();
      const uids = users.map((u) => String(u._id));
      const gids = groups.map((g) => String(g._id));
      all = all.filter((r) => uids.includes(String(r.userId)) || (r.groupId && gids.includes(String(r.groupId))));
    }

    // فیلتر «در انتظار من»: گزارش‌های خودِ کاربر از صف خودش حذف می‌شوند
    // فیلتر «گزارش‌های من»: فقط گزارش‌های خود کاربر (برای سرپرست)
    const scope = query.get("scope");
    if (scope === "my-queue") all = all.filter((r) => String(r.userId) !== String(actor._id));
    if (scope === "mine") all = all.filter((r) => String(r.userId) === String(actor._id));

    const reportIds = all.map((r) => r._id);
    const items = await ReportItem.find({ reportId: { $in: reportIds } }).lean();
    const users = await User.find({}).select("fullName").lean();
    const groups = await WorkGroup.find({}).select("name").lean();
    const uName = (id: unknown) => users.find((u) => String(u._id) === String(id))?.fullName || "—";
    const gName = (id: unknown) => groups.find((g) => String(g._id) === String(id))?.name || "—";

    const enriched = all.map((r) => {
      const rItems = items.filter((i) => String(i.reportId) === String(r._id));
      return {
        ...r, _id: String(r._id), userId: String(r.userId),
        companyId: String(r.companyId), groupId: r.groupId ? String(r.groupId) : null,
        contractId: String(r.contractId),
        userName: uName(r.userId), groupName: gName(r.groupId),
        itemCount: rItems.length,
        totalAmount: rItems.reduce((s, i) => s + (i.totalAmount || 0), 0),
        submittedAt: r.submittedAt ? new Date(r.submittedAt).toISOString() : undefined,
        createdAt: new Date(r.createdAt).toISOString(),
      };
    });

    return ok(paginate(enriched, query));
  },
});

export const POST = handler({
  roles: ["TECHNICIAN", "GROUP_SUPERVISOR"],
  schema: createSchema,
  run: async ({ actor, body }) => ok(await createReport(actor, body)),
});

export const dynamic = "force-dynamic";
void canSeeReport;
