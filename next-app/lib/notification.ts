import { Notification } from "@/models/notification";
import { GroupMembership } from "@/models/group-membership";

export type NotifEntity = "report" | "task" | "statement" | "purchase" | "extra" | null;

export async function notify(userId: unknown, title: string, body: string, entity: NotifEntity = null, entityId?: unknown) {
  await Notification.create({ userId, title, body, entity, entityId: entityId || null });
}

/** اعلان به همه‌ی اعضای دارای نقش مشخص در یک گروه */
export async function notifyGroupRole(groupId: unknown, membershipType: string, title: string, body: string, entity: NotifEntity = null, entityId?: unknown) {
  const ms = await GroupMembership.find({ groupId, membershipType, isActive: true }).lean();
  await Promise.all(ms.map((m) => notify(m.userId, title, body, entity, entityId)));
}

/** اعلان به نقش‌های مشخص در کل شرکت */
export async function notifyCompanyRoles(companyId: unknown, roles: string[], title: string, body: string, entity: NotifEntity = null, entityId?: unknown) {
  const { User } = await import("@/models/user");
  const users = await User.find({ companyId, role: { $in: roles }, isActive: true }).select("_id").lean();
  await Promise.all(users.map((u) => notify(u._id, title, body, entity, entityId)));
}
