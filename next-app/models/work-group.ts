import { mongoose } from "@/lib/db";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", required: true },
    workUnitId: { type: mongoose.Schema.Types.ObjectId, ref: "WorkUnit", default: null },
    supervisorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const WorkGroup =
  (mongoose.models.WorkGroup as mongoose.Model<any>) || mongoose.model("WorkGroup", schema, "workgroups");
