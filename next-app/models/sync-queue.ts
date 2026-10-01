import { mongoose } from "@/lib/db";

/** سمت سرور: سابقه‌ی عملیات‌های همگام‌سازی آفلاین کلاینت‌ها */
const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    endpoint: { type: String, required: true },
    method: { type: String, default: "POST" },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    idempotencyKey: { type: String, required: true },
    status: { type: String, enum: ["pending", "sending", "synced", "failed"], default: "pending" },
    attempts: { type: Number, default: 0 },
    lastError: String,
  },
  { timestamps: true }
);

schema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });

export const SyncQueue =
  (mongoose.models.SyncQueue as mongoose.Model<any>) || mongoose.model("SyncQueue", schema, "syncqueues");
