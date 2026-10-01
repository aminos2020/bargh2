import type { HandlerCtx } from "./api-handler";
import { ApiError } from "./api-handler";
import type { Role } from "@/types";

/** بررسی نقش — لایه‌ی دوم بعد از handler (برای توابع service که مستقیم صدا زده می‌شوند). */
export function assertRole(actor: HandlerCtx["actor"], roles: Role[]) {
  if (!actor) throw new ApiError("ورود لازم است.", "UNAUTHENTICATED", 401);
  if (!roles.includes(actor.role as Role)) throw new ApiError("نقش شما اجازه‌ی این عملیات را ندارد.", "FORBIDDEN", 403);
}

export function assertSameCompany(actor: HandlerCtx["actor"], companyId: string | null | undefined) {
  if (!actor.companyId || actor.companyId.toString() !== companyId?.toString()) {
    throw new ApiError("دسترسی به داده‌های شرکت دیگر مجاز نیست.", "FORBIDDEN", 403);
  }
}

export function assertSameOrg(actor: HandlerCtx["actor"], organizationId: string | null | undefined) {
  if (actor.organizationId.toString() !== organizationId?.toString()) {
    throw new ApiError("دسترسی به داده‌های سازمان دیگر مجاز نیست.", "FORBIDDEN", 403);
  }
}
