import { mongoose } from "@/lib/db";

const schema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    mobileNormalized: { type: String, required: true }, // فقط برای seed/dev — جستجو با hash انجام می‌شود
    mobileHash: { type: String, required: true, unique: true, index: true },
    mobileEnc: { type: String, required: true }, // AES-256-GCM برای نمایش
    role: {
      type: String,
      enum: ["DEPUTY", "EMPLOYER_CEO", "EMPLOYER_EXPERT", "CONTRACTOR_CEO", "RESIDENT_REP", "GROUP_SUPERVISOR", "TECHNICIAN"],
      required: true,
    },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: "WorkUnit", default: null },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

schema.index({ companyId: 1, role: 1 });
schema.index({ organizationId: 1, role: 1 });

export const User = (mongoose.models.User as mongoose.Model<any>) || mongoose.model("User", schema, "users");
