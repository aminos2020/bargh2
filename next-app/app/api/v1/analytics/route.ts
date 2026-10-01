import { handler, ok } from "@/lib/api-handler";
import { deputyAnalytics } from "@/services/analytics-service";

export const GET = handler({
  roles: ["DEPUTY", "CONTRACTOR_CEO"],
  run: async ({ query }) => {
    const days = Number(query.get("days")) || 14;
    return ok(await deputyAnalytics(Math.min(60, Math.max(7, days))));
  },
});

export const dynamic = "force-dynamic";
