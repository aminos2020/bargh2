import { mongoose } from "@/lib/db";

const schema = new mongoose.Schema(
  {
    mobileHash: { type: String, required: true, index: true },
    otpHash: { type: String, required: true }, // هرگز plain ذخیره نمی‌شود
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    consumedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpCode =
  (mongoose.models.OtpCode as mongoose.Model<any>) || mongoose.model("OtpCode", schema, "otpcodes");
