import { mongoose } from "@/lib/db";

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    entity: { type: String, enum: ["report", "task", "statement", "purchase", "extra"], default: null },
    entityId: { type: String, default: null },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

schema.index({ userId: 1, readAt: 1, createdAt: -1 });

export const Notification =
  (mongoose.models.Notification as mongoose.Model<any>) || mongoose.model("Notification", schema, "notifications");
