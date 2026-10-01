import { z } from "zod";
import { handler, ok } from "@/lib/api-handler";
import { ApprovalEvent } from "@/models/approval-event";
import { User } from "@/models/user";

/** تاریخچه‌ی تاییدها برای یک گزارش */
export const GET = handler({
  run: async ({ query }) => {
    const reportId = query.get("reportId");
    if (!reportId) return ok([]);
    const events = await ApprovalEvent.find({ reportId }).sort({ createdAt: 1 }).lean();
    const users = await User.find({ _id: { $in: events.map((e) => e.actorUserId) } }).select("fullName").lean();
    return ok(events.map((e) => ({
      ...e, _id: String(e._id), reportId: String(e.reportId),
      actorName: users.find((u) => String(u._id) === String(e.actorUserId))?.fullName || "—",
      createdAt: new Date(e.createdAt).toISOString(),
    })));
  },
});

void z;
export const dynamic = "force-dynamic";
