import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const hex = process.env.MOBILE_ENC_KEY || "";
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error("MOBILE_ENC_KEY must be a 64-char hex string (openssl rand -hex 32)");
  }
  return Buffer.from(hex, "hex");
}

/** AES-256-GCM — خروجی: base64(iv:tag:ciphertext) */
export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString("base64");
}

export function decrypt(payload: string): string {
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const decipher = createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

/** هش یک‌طرفه برای جستجو (salt ثابت از env تا بدون نیاز به جدول نگاشت باشد). */
export function stableHash(value: string): string {
  const pepper = process.env.SESSION_PASSWORD || "tavanban-pepper";
  return createHash("sha256").update(pepper + "::" + value).digest("hex");
}
