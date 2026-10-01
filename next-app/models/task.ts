import { mongoose } from "@/lib/db";

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    assignedGroupIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "WorkGroup" }],
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", default: null },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "WorkGroup", default: null },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    dueDate: { type: String, default: null }, // کلید شمسی
    status: { type: String, enum: ["open", "in_progress", "done", "cancelled"], default: "open" },
    sourceRole: { type: String, required: true },
  },
  { timestamps: true }
);

schema.index({ status: 1, priority: 1 });

export const Task = (mongoose.models.Task as mongoose.Model<any>) || mongoose.model("Task", schema, "tasks");
