import type { SessionOptions } from "iron-session";
import type { Role } from "@/types";

export interface SessionData {
  userId: string;
  role: Role;
  organizationId: string;
  companyId?: string | null;
}

/** تنظیمات مشترک session — هم در middleware (edge) و هم در route handlerها استفاده می‌شود. */
export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD || "dev-only-insecure-password-change-me-32chars!",
  cookieName: "tavanban_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 12, // ۱۲ ساعت
  },
};
