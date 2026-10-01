export type AttachmentKind = "image" | "video" | "file";
export type UploadStatus = "local" | "uploading" | "uploaded" | "failed";

export interface Attachment {
  _id: string;
  reportId?: string | null;
  taskId?: string | null;
  purchaseRequestId?: string | null;
  kind: AttachmentKind;
  fileName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  uploadStatus: UploadStatus;
  createdAt: string;
}
