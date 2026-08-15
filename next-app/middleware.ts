import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session-config";

/**
 * محافظ routeهای پنل: بدون نشست معتبر، کاربر به /login هدایت می‌شود.
 * بررسی نقش و مالکیت منابع همیشه داخل APIها انجام می‌شود (نه فقط اینجا).
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  if (!session.userId || !session.role) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  return response;
}

export const config = {
  matcher: [
    "/deputy/:path*",
    "/employer-ceo/:path*",
    "/employer-expert/:path*",
    "/contractor-ceo/:path*",
    "/resident/:path*",
    "/supervisor/:path*",
    "/technician/:path*",
  ],
};
