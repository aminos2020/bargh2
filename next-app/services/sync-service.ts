import { SyncQueue } from "@/models/sync-queue";
import { User } from "@/models/user";
import { createReport } from "./report-service";
import { createPurchaseRequest } from "./purchase-service";
import type { SyncOp, SyncResultItem } from "@/types";

/**
 * پردازش صف همگام‌سازی آفلاین. هر عملیات با idempotencyKey خودش
 * دقیقا یک بار اعمال می‌شود — حتی اگر کلاینت چندبار بفرستد.
 */
export async function processSyncOps(actor: InstanceType<typeof User>, ops: SyncOp[]): Promise<SyncResultItem[]> {
  const results: SyncResultItem[] = [];
  for (const op of ops) {
    let result: SyncResultItem = { idempotencyKey: op.idempotencyKey, ok: false, message: "عملیات ناشناخته است." };
    try {
      await SyncQueue.findOneAndUpdate(
        { userId: actor._id, idempotencyKey: op.idempotencyKey },
        { $set: { endpoint: op.endpoint, payload: op.payload, status: "sending" }, $inc: { attempts: 1 } },
        { upsert: true }
      );
      if (op.endpoint === "create_report") {
        const r = await createReport(actor, op.payload as Parameters<typeof createReport>[1]);
        result = { idempotencyKey: op.idempotencyKey, ok: true, message: r.duplicated ? "قبلا ثبت شده بود." : "گزارش همگام‌سازی شد.", entityId: r.reportId };
      } else if (op.endpoint === "create_purchase_request") {
        const r = await createPurchaseRequest(actor, op.payload as Parameters<typeof createPurchaseRequest>[1], true);
        result = { idempotencyKey: op.idempotencyKey, ok: true, message: "درخواست خرید همگام‌سازی شد.", entityId: r.id };
      }
      await SyncQueue.updateOne({ userId: actor._id, idempotencyKey: op.idempotencyKey }, { $set: { status: "synced" } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "خطای نامشخص";
      result = { idempotencyKey: op.idempotencyKey, ok: false, message: msg };
      await SyncQueue.updateOne({ userId: actor._id, idempotencyKey: op.idempotencyKey }, { $set: { status: "failed", lastError: msg } });
    }
    results.push(result);
  }
  return results;
}
