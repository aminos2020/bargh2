import { mongoose } from "@/lib/db";

const schema = new mongoose.Schema(
  {
    requesterUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", default: null },
    title: { type: String, required: true, trim: true },
    itemDescription: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    estimatedPrice: { type: Number, required: true, min: 0 },
    reason: String,
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    status: { type: String, enum: ["draft", "submitted", "approved", "rejected", "purchased"], default: "draft", index: true },
    decidedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    decisionNote: String,
    purchasedAt: Date,
  },
  { timestamps: true }
);

export const PurchaseRequest =
  (mongoose.models.PurchaseRequest as mongoose.Model<any>) || mongoose.model("PurchaseRequest", schema, "purchaserequests");
