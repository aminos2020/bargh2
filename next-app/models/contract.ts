import { mongoose } from "@/lib/db";

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    contractType: { type: String, enum: ["volume", "unit_price", "other"], default: "unit_price" },
    contractorCompanyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    employerOrganizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    // فقط اطلاعات عمومی — ذخیره‌ی اطلاعات محرمانه ممنوع است.
    startDate: { type: String, required: true }, // کلید شمسی YYYY-MM-DD
    endDate: { type: String, required: true },
    status: { type: String, enum: ["active", "completed", "terminated"], default: "active" },
    publicNotes: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

schema.index({ contractorCompanyId: 1, status: 1 });

export const Contract =
  (mongoose.models.Contract as mongoose.Model<any>) || mongoose.model("Contract", schema, "contracts");
