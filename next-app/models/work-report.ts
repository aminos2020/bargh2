import { mongoose } from "@/lib/db";

const schema = new mongoose.Schema(
  {
    reportType: { type: String, enum: ["work_report", "daily_report"], default: "work_report" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "WorkGroup", default: null, index: true },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", required: true },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: "WorkUnit", default: null },
    reportDateJ: { type: String, required: true }, // کلید شمسی
    status: {
      type: String,
      enum: ["draft", "submitted", "supervisor_review", "expert_review", "employer_ceo_review", "approved", "rejected", "redo_requested", "disputed", "settled"],
      default: "draft",
      index: true,
    },
    description: String,
    taskReferenceId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
    offlineClientId: { type: String, default: null },
    idempotencyKey: { type: String, required: true },
    submittedAt: Date,
    currentReviewerRole: { type: String, default: null },
  },
  { timestamps: true }
);

// جلوگیری از ثبت تکراری گزارش آفلاین
schema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });
schema.index({ status: 1, reportDateJ: 1 });

export const WorkReport =
  (mongoose.models.WorkReport as mongoose.Model<any>) || mongoose.model("WorkReport", schema, "workreports");
