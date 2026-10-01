import { NextRequest, NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import { connectDb } from "./db";
import { getSession } from "./session";
import { User } from "@/models/user";
import type { Role } from "@/types";
import { checkRateLimit } from "./rate-limit";

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;
  constructor(message: string, code: string, status = 400, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export interface HandlerCtx {
  actor: InstanceType<typeof User>;
  body: any;
  query: URLSearchParams;
  params: Record<string, string>;
  req: NextRequest;
}

interface HandlerOpts {
  /** نقش‌های مجاز — اگر تعریف نشود هر کاربر لاگین‌شده مجاز است */
  roles?: Role[];
  /** اعتبارسنجی body */
  schema?: ZodSchema;
  /** اعتبارسنجی query */
  querySchema?: ZodSchema;
  /** route عمومی (بدون نشست) — فقط auth */
  isPublic?: boolean;
  /** rate limit بر اساس IP (در دقیقه) */
  rateLimitPerMin?: number;
  run: (ctx: HandlerCtx) => Promise<unknown>;
}

type RouteHandler = (req: NextRequest, segCtx?: { params?: Promise<Record<string, string>> }) => Promise<NextResponse>;

export function ok(data: unknown, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, error: { code, message, details } }, { status });
}

export function paginate<T>(items: T[], query: URLSearchParams) {
  const page = Math.max(1, Number(query.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.get("limit")) || 20));
  const total = items.length;
  const start = (page - 1) * limit;
  return { page, limit, total, hasNextPage: start + limit < total, items: items.slice(start, start + limit) };
}

export function handler(opts: HandlerOpts): RouteHandler {
  return async (req, segCtx) => {
    try {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
      const path = new URL(req.url).pathname;
      if (opts.rateLimitPerMin) {
        const allowed = checkRateLimit(`${ip}:${path}:${req.method}`, opts.rateLimitPerMin);
        if (!allowed) return fail("RATE_LIMITED", "تعداد درخواست‌ها بیش از حد مجاز است؛ کمی صبر کنید.", 429);
      }

      let actor: HandlerCtx["actor"] | null = null;
      if (!opts.isPublic) {
        await connectDb();
        const session = await getSession();
        if (!session.userId) return fail("UNAUTHENTICATED", "نشست شما منقضی شده است؛ دوباره وارد شوید.", 401);
        const user = await User.findById(session.userId);
        if (!user || !user.isActive) return fail("USER_INACTIVE", "دسترسی شما غیرفعال شده است. با مدیر تماس بگیرید.", 403);
        actor = user;
        if (opts.roles && !opts.roles.includes(user.role as Role)) {
          return fail("FORBIDDEN", "نقش شما اجازه‌ی این عملیات را ندارد.", 403);
        }
      }

      const query = new URL(req.url).searchParams;
      if (opts.querySchema) {
        const parsed = opts.querySchema.safeParse(Object.fromEntries(query.entries()));
        if (!parsed.success) return fail("VALIDATION", "پارامترهای ورودی نامعتبر است.", 422, parsed.error.flatten());
      }

      let body: any = {};
      if (req.method !== "GET" && req.method !== "DELETE") {
        try { body = await req.json(); } catch { body = {}; }
        if (opts.schema) {
          const parsed = opts.schema.safeParse(body);
          if (!parsed.success) return fail("VALIDATION", "ورودی‌ها نامعتبر هستند.", 422, parsed.error.flatten());
          body = parsed.data;
        }
      }

      const params = segCtx?.params ? await segCtx.params : {};
      if (!opts.isPublic && !actor) return fail("UNAUTHENTICATED", "ورود لازم است.", 401);

      await connectDb();
      const data = await opts.run({ actor: actor!, body, query, params, req });
      return ok(data);
    } catch (err) {
      if (err instanceof ApiError) return fail(err.code, err.message, err.status, err.details);
      // eslint-disable-next-line no-console
      console.error("[api-error]", err);
      return fail("SERVER_ERROR", "خطایی رخ داده است؛ دوباره تلاش کنید.", 500);
    }
  };
}
