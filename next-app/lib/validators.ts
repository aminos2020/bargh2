import { z } from "zod";
import { normalizeMobile } from "./mobile";
import { isValidJalaliKey } from "./date";

export const mobileSchema = z
  .string()
  .min(1, "شماره موبایل الزامی است.")
  .refine((v) => normalizeMobile(v) !== null, "شماره موبایل نامعتبر است.");

export const jalaliDateSchema = z
  .string()
  .refine(isValidJalaliKey, "تاریخ شمسی نامعتبر است.");

export const mongoId = z.string().regex(/^[a-f\d]{24}$/i, "شناسه نامعتبر است.");

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  groupId: z.string().optional(),
  companyId: z.string().optional(),
  contractId: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export const photoSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  dataUrl: z.string().min(1),
});

export const prioritySchema = z.enum(["low", "medium", "high", "urgent"]);
