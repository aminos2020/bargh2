import { handler, ok, paginate } from "@/lib/api-handler";
import { Notification } from "@/models/notification";

export const GET = handler({
  run: async ({ actor, query }) => {
    const filter: Record<string, unknown> = { userId: actor._id };
    const f = query.get("filter");
    if (f === "unread") filter.readAt = null;
    const all = await Notification.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    return ok(paginate(all.map((n) => ({
      ...n, _id: String(n._id), userId: String(n.userId),
      entityId: n.entityId ? String(n.entityId) : null,
      readAt: n.readAt ? new Date(n.readAt).toISOString() : null,
      createdAt: new Date(n.createdAt).toISOString(),
    })), query));
  },
});

export const dynamic = "force-dynamic";
