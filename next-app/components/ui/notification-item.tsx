"use client";
import { BellRing } from "lucide-react";
import { relativeTimeFa } from "@/lib/date-client";
import type { AppNotification } from "@/types";
import { cn } from "@/lib/cn";

export function NotificationItem({ n, onClick }: { n: AppNotification; onClick: () => void }) {
  const unread = !n.readAt;
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 border-b border-line/70 px-4 py-3.5 text-start transition-colors last:border-0 hover:bg-primary-50/40",
        unread && "bg-primary-50/25"
      )}
    >
      <span className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full", unread ? "bg-primary-600 text-white" : "bg-slate-100 text-ink-300")}>
        <BellRing size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-[13px] leading-6", unread ? "font-black text-ink-900" : "font-bold text-ink-500")}>{n.title}</span>
        <span className="mt-0.5 block truncate text-[12px] font-bold text-ink-400">{n.body}</span>
        <span className="mt-1 block text-[10.5px] font-bold text-ink-300">{relativeTimeFa(n.createdAt)}</span>
      </span>
      {unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary-600" />}
    </button>
  );
}
