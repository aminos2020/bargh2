import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { ApiError } from "./api-handler";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // ۴ مگابایت بعد از فشرده‌سازی
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * ذخیره‌ی عکس از dataURL (فشرده‌شده در کلاینت) با نام تصادفی.
 * مسیر سرو: /files/<name>.jpg از طریق route عمومی.
 */
export async function saveImageFromDataUrl(dataUrl: string, mimeType: string): Promise<{ storagePath: string; size: number }> {
  if (!ALLOWED.has(mimeType)) throw new ApiError("نوع فایل مجاز نیست؛ فقط عکس JPG/PNG/WebP.", "BAD_FILE_TYPE", 400);
  const match = /^data:image\/[a-z]+;base64,(.+)$/i.exec(dataUrl);
  if (!match) throw new ApiError("فایل نامعتبر است.", "BAD_FILE", 400);
  const buf = Buffer.from(match[1], "base64");
  if (buf.length > MAX_IMAGE_SIZE) throw new ApiError("حجم عکس بیش از حد مجاز است.", "FILE_TOO_LARGE", 400);

  const dir = path.resolve(process.env.UPLOAD_DIR || "./uploads");
  await mkdir(dir, { recursive: true });
  const name = `${Date.now().toString(36)}-${randomBytes(8).toString("hex")}.jpg`;
  await writeFile(path.join(dir, name), buf);
  return { storagePath: `/files/${name}`, size: buf.length };
}

export function uploadsDir(): string {
  return path.resolve(process.env.UPLOAD_DIR || "./uploads");
}
