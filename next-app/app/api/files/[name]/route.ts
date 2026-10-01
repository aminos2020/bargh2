import { NextRequest, NextResponse } from "next/server";
import { readUpload } from "@/services/storage-service";

/** سرو عمومی فایل‌های آپلودشده (با نام تصادفی) */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await ctx.params;
    if (!/^[\w.-]+\.jpg$/.test(name)) {
      return NextResponse.json({ ok: false, error: { code: "BAD_NAME", message: "نام فایل نامعتبر است." } }, { status: 400 });
    }
    const { buffer, contentType } = await readUpload(name);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "فایل پیدا نشد." } }, { status: 404 });
  }
}

export const dynamic = "force-dynamic";
