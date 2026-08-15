import { AuditLog } from "@/models/audit-log";

/**
 * ثبت Audit Log برای همه‌ی تغییرات مهم.
 * نکته‌ی امنیتی: هیچ‌گاه OTP، کلید رمزنگاری یا داده‌ی حساس را در detail نیاورید.
 */
export async function logAudit(input: {
  actorUserId: unknown;
  actorRole: string;
  action: string;
  entity: string;
  entityId: unknown;
  detail?: string;
}) {
  try {
    await AuditLog.create({
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      detail: input.detail,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[audit-failed]", e);
  }
}
