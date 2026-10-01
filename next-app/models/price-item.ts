import { mongoose } from "@/lib/db";

const schema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    unit: { type: String, required: true, trim: true },
    unitPrice: { type: Number, required: true, min: 0 }, // ریال
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", required: true, index: true },
    groupIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "WorkGroup" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

schema.index({ contractId: 1, code: 1 }, { unique: true });

export const PriceItem =
  (mongoose.models.PriceItem as mongoose.Model<any>) || mongoose.model("PriceItem", schema, "priceitems");
