import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "./session-config";

/** دریافت session در route handlerها و server componentها (فقط سمت سرور). */
export async function getSession(): Promise<SessionData & { destroy?: () => Promise<void> }> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
