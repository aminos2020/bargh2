import { mongoose } from "@/lib/db";

const schema = new mongoose.Schema(
  {
    contractorCompanyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", required: true },
    periodStart: { type: String, required: true },
    periodEnd: { type: String, required: true },
    reportIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "WorkReport" }],
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["draft", "submitted", "approved", "rejected", "paid"], default: "draft", index: true },
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    decidedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    decisionNote: String,
  },
  { timestamps: true }
);

export const Statement =
  (mongoose.models.Statement as mongoose.Model<any>) || mongoose.model("Statement", schema, "statements");
