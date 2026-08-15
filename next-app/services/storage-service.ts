import { readFile } from "fs/promises";
import path from "path";
import { uploadsDir } from "@/lib/storage";

/** خواندن فایل آپلودشده برای سرو از route عمومی /files/[name] */
export async function readUpload(name: string): Promise<{ buffer: Buffer; contentType: string }> {
  const safe = path.basename(name); // جلوگیری از path traversal
  const full = path.join(uploadsDir(), safe);
  const buffer = await readFile(full);
  return { buffer, contentType: "image/jpeg" };
}
