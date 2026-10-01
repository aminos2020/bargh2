import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ROLE_HOME } from "@/lib/permissions";
import type { Role } from "@/types";

/**
 * مقصد مشترک کلیک روی اعلان‌ها — بر اساس نقش کاربر به صفحه‌ی جزییات مرتبط می‌رود.
 */
export default async function NotificationRedirect({ params }: { params: Promise<{ entity: string; id: string }> }) {
  const { entity, id } = await params;
  const session = await getSession();
  const panel = session.role ? ROLE_HOME[session.role as Role] : "/login";

  switch (entity) {
    case "report":
      if (session.role === "TECHNICIAN") redirect(`/technician/reports/${id}`);
      if (session.role === "GROUP_SUPERVISOR") redirect(`/supervisor/reviews/${id}`);
      if (session.role === "EMPLOYER_EXPERT") redirect(`/employer-expert/reviews/${id}`);
      if (session.role === "EMPLOYER_CEO") redirect(`/employer-ceo/reviews/${id}`);
      if (session.role === "CONTRACTOR_CEO") redirect(`/contractor-ceo/reports/${id}`);
      redirect(`${panel}/reports`);
      break;
    case "task":
      redirect(`${panel}/tasks`);
      break;
    case "statement":
      redirect(session.role === "DEPUTY" ? `/deputy/statements/${id}` : `/contractor-ceo/statements/${id}`);
      break;
    case "purchase":
      redirect(session.role === "RESIDENT_REP" ? `/resident/purchase-requests/${id}` : `/contractor-ceo/purchase-requests/${id}`);
      break;
    case "extra":
      redirect("/resident/extra-items");
      break;
    default:
      redirect(panel);
  }
}

export const dynamic = "force-dynamic";
