import { mongoose } from "@/lib/db";

const schema = new mongoose.Schema(
  {
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: "WorkReport", required: true, index: true },
    actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    actorRole: { type: String, required: true },
    action: { type: String, enum: ["submit", "resubmit", "approve", "reject", "redo", "dispute"], required: true },
    fromStatus: { type: String, required: true },
    toStatus: { type: String, required: true },
    reason: String,
  },
  { timestamps: true }
);

export const ApprovalEvent =
  (mongoose.models.ApprovalEvent as mongoose.Model<any>) || mongoose.model("ApprovalEvent", schema, "approvalevents");
