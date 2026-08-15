export type NotifEntity = "report" | "task" | "statement" | "purchase" | "extra" | null;

export interface AppNotification {
  _id: string;
  userId: string;
  title: string;
  body: string;
  entity: NotifEntity;
  entityId?: string | null;
  readAt?: string | null;
  createdAt: string;
}
