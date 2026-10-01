import { mongoose } from "@/lib/db";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    description: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const WorkUnit =
  (mongoose.models.WorkUnit as mongoose.Model<any>) || mongoose.model("WorkUnit", schema, "workunits");
