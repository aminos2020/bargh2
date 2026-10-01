import { mongoose } from "@/lib/db";

const schema = new mongoose.Schema(
  {
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: "WorkReport", required: true, index: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["pending", "mapped", "rejected"], default: "pending", index: true },
    mappedPriceItemId: { type: mongoose.Schema.Types.ObjectId, ref: "PriceItem", default: null },
    mappedQuantity: { type: Number, default: null },
    mappedAmount: { type: Number, default: null },
    mappedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    mappingNote: String,
  },
  { timestamps: true }
);

export const ExtraWorkItem =
  (mongoose.models.ExtraWorkItem as mongoose.Model<any>) || mongoose.model("ExtraWorkItem", schema, "extraworkitems");
