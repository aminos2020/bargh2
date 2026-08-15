import { mongoose } from "@/lib/db";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    contractorCeoUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    phone: String,
    address: String,
    description: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Company =
  (mongoose.models.Company as mongoose.Model<any>) || mongoose.model("Company", schema, "companies");
