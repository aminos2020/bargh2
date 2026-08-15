import { mongoose } from "@/lib/db";

const schema = new mongoose.Schema(
  {
    actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true, index: true },
    entityId: { type: String, required: true },
    detail: String,
  },
  { timestamps: true }
);

schema.index({ createdAt: -1 });

export const AuditLog =
  (mongoose.models.AuditLog as mongoose.Model<any>) || mongoose.model("AuditLog", schema, "auditlogs");
