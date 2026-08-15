import { mongoose } from "@/lib/db";

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: "WorkReport", required: true },
    score: { type: Number, required: true },
    reason: { type: String, required: true },
    createdByRole: { type: String, required: true },
  },
  { timestamps: true }
);

export const ScoreEvent =
  (mongoose.models.ScoreEvent as mongoose.Model<any>) || mongoose.model("ScoreEvent", schema, "scoreevents");
