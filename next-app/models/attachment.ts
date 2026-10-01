import { mongoose } from "@/lib/db";

const schema = new mongoose.Schema(
  {
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: "WorkReport", default: null, index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
    purchaseRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseRequest", default: null },
    kind: { type: String, enum: ["image", "video", "file"], default: "image" },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    storagePath: { type: String, required: true }, // نام تصادفی — هرگز نام اصلی کاربر
    uploadStatus: { type: String, enum: ["local", "uploading", "uploaded", "failed"], default: "uploaded" },
  },
  { timestamps: true }
);

export const Attachment =
  (mongoose.models.Attachment as mongoose.Model<any>) || mongoose.model("Attachment", schema, "attachments");
