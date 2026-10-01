import { z } from "zod";
import { handler, ok, ApiError } from "@/lib/api-handler";
import { GroupMembership } from "@/models/group-membership";
import { WorkGroup } from "@/models/work-group";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  groupId: z.string().min(1),
  userId: z.string().min(1),
  membershipType: z.enum(["member", "supervisor", "employer_expert", "employer_ceo"]),
});

/**
 * تخصیص نیرو/ناظر به گروه — بدون تغییر مالکیت نیرو.
 * مدیران کارفرمایی فقط نقش‌های کارفرمایی را می‌توانند اضافه کنند.
 */
export const POST = handler({
  roles: ["CONTRACTOR_CEO", "EMPLOYER_CEO", "DEPUTY"],
  schema,
  run: async ({ actor, body }) => {
    const group = await WorkGroup.findById(body.groupId);
    if (!group) throw new ApiError("گروه پیدا نشد.", "NOT_FOUND", 404);
    if (actor.role === "EMPLOYER_CEO" && !["employer_expert", "employer_ceo"].includes(body.membershipType)) {
      throw new ApiError("فقط می‌توانید ناظران کارفرمایی را به گروه اضافه کنید.", "FORBIDDEN", 403);
    }
    if (actor.role === "CONTRACTOR_CEO" && ["employer_expert", "employer_ceo"].includes(body.membershipType)) {
      throw new ApiError("افزودن ناظر کارفرمایی در صلاحیت شما نیست.", "FORBIDDEN", 403);
    }
    await GroupMembership.findOneAndUpdate(
      { userId: body.userId, groupId: body.groupId, membershipType: body.membershipType },
      { isActive: true },
      { upsert: true }
    );
    await logAudit({ actorUserId: actor._id, actorRole: actor.role, action: "تخصیص به گروه", entity: "group", entityId: body.groupId, detail: `کاربر: ${body.userId} — نقش: ${body.membershipType}` });
    return ok({ done: true });
  },
});

export const dynamic = "force-dynamic";
