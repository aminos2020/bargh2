"use client";
import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { relativeTimeFa } from "@/lib/date-client";
import type { AuditLog } from "@/types";

export function RecentActivity({ logs, title = "آخرین فعالیت‌ها" }: { logs: AuditLog[]; title?: string }) {
  return (
    <Card pad={false}>
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="text-[13px] font-black text-ink-700">{title}</p>
        <Activity size={15} className="text-ink-300" />
      </div>
      {logs.length === 0 ? (
        <EmptyState title="فعالیتی ثبت نشده" />
      ) : (
        <div className="divide-y divide-line/70">
          {logs.slice(0, 8).map((l) => (
            <div key={l._id} className="flex items-start gap-3 px-4 py-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-black text-ink-800">{l.action}</p>
                <p className="mt-0.5 truncate text-[11.5px] font-bold text-ink-400">
                  {l.actorName || "—"}{l.detail ? ` — ${l.detail}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-[10.5px] font-bold text-ink-300">{relativeTimeFa(l.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
