import { mongoose } from "@/lib/db";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["deputy", "employer", "contractor"], required: true },
    description: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Organization =
  (mongoose.models.Organization as mongoose.Model<any>) || mongoose.model("Organization", schema, "organizations");
