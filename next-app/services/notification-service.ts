import { Notification } from "@/models/notification";
import { ApiError } from "@/lib/api-handler";

export async function markRead(userId: unknown, notificationId: string) {
  const n = await Notification.findOne({ _id: notificationId, userId });
  if (!n) throw new ApiError("اعلان پیدا نشد.", "NOT_FOUND", 404);
  if (!n.readAt) {
    n.readAt = new Date();
    await n.save();
  }
  return { id: notificationId, readAt: n.readAt };
}

export async function markAllRead(userId: unknown) {
  await Notification.updateMany({ userId, readAt: null }, { readAt: new Date() });
  return { done: true };
}
