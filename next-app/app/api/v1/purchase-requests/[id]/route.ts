import { handler, ok, ApiError } from "@/lib/api-handler";
import { PurchaseRequest } from "@/models/purchase-request";
import { User } from "@/models/user";

export const GET = handler({
  run: async ({ actor, params }) => {
    const p = await PurchaseRequest.findById(params.id).lean();
    if (!p) throw new ApiError("درخواست پیدا نشد.", "NOT_FOUND", 404);
    if (actor.role !== "DEPUTY" && String(p.companyId) !== String(actor.companyId)) throw new ApiError("دسترسی مجاز نیست.", "FORBIDDEN", 403);
    const users = await User.find({ _id: { $in: [p.requesterUserId, p.decidedByUserId].filter(Boolean) } }).select("fullName").lean();
    const uName = (id: unknown) => users.find((u) => String(u._id) === String(id))?.fullName || "—";
    return ok({
      ...p, _id: String(p._id),
      requesterUserId: String(p.requesterUserId), companyId: String(p.companyId),
      contractId: p.contractId ? String(p.contractId) : null,
      decidedByUserId: p.decidedByUserId ? String(p.decidedByUserId) : null,
      requesterName: uName(p.requesterUserId),
      deciderName: p.decidedByUserId ? uName(p.decidedByUserId) : null,
      purchasedAt: p.purchasedAt ? new Date(p.purchasedAt).toISOString() : null,
      createdAt: new Date(p.createdAt).toISOString(),
    });
  },
});

export const dynamic = "force-dynamic";
