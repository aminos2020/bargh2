import { z } from "zod";
import { handler, ok, ApiError } from "@/lib/api-handler";
import { Statement } from "@/models/statement";
import { WorkReport } from "@/models/work-report";
import { logAudit } from "@/lib/audit";
import { notifyCompanyRoles } from "@/lib/notification";

const schema = z.object({
  action: z.enum(["approved", "rejected", "paid"]),
  note: z.string().optional(),
});

export const POST = handler({
  roles: ["DEPUTY"],
  schema,
  run: async ({ actor, params, body }) => {
    const s = await Statement.findById(params.id);
    if (!s) throw new ApiError("صورت‌وضعیت پیدا نشد.", "NOT_FOUND", 404);
    if (body.action === "approved" && s.status !== "submitted") throw new ApiError("فقط صورت‌وضعیت ارسال‌شده قابل تایید است.", "BAD_STATE");
    if (body.action === "paid" && s.status !== "approved") throw new ApiError("فقط صورت‌وضعیت تاییدشده قابل پرداخت است.", "BAD_STATE");

    s.status = body.action;
    s.decidedByUserId = actor._id;
    s.decisionNote = body.note || s.decisionNote;
    await s.save();

    if (body.action === "paid") {
      await WorkReport.updateMany({ _id: { $in: s.reportIds } }, { status: "settled" });
    }

    const label = body.action === "approved" ? "تایید" : body.action === "rejected" ? "رد" : "پرداخت";
    await logAudit({ actorUserId: actor._id, actorRole: actor.role, action: `${label} صورت‌وضعیت`, entity: "statement", entityId: String(s._id), detail: `${s.totalAmount} ریال` });
    await notifyCompanyRoles(s.contractorCompanyId, ["CONTRACTOR_CEO"], `صورت‌وضعیت ${label} شد`, `وضعیت صورت‌وضعیت به «${label}» تغییر کرد.`, "statement", String(s._id));
    return ok({ id: String(s._id), status: s.status });
  },
});

export const dynamic = "force-dynamic";
