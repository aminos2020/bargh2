import { mongoose } from "@/lib/db";

const schema = new mongoose.Schema(
  {
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: "WorkReport", required: true, index: true },
    priceItemId: { type: mongoose.Schema.Types.ObjectId, ref: "PriceItem", required: true },
    // Snapshot — تغییر قیمت فهرست بها، گزارش‌های قبلی را تغییر نمی‌دهد
    titleSnapshot: { type: String, required: true },
    unitSnapshot: { type: String, required: true },
    unitPriceSnapshot: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 }, // ریال
    status: { type: String, enum: ["pending", "approved", "rejected", "edited", "redo"], default: "pending" },
  },
  { timestamps: true }
);

export const ReportItem =
  (mongoose.models.ReportItem as mongoose.Model<any>) || mongoose.model("ReportItem", schema, "reportitems");
