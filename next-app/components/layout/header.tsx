"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPost } from "@/lib/api-fetch";
import type { AppNotification, Paginated } from "@/types";
import { Breadcrumb, type Crumb } from "@/components/ui/breadcrumb";
import { SyncStatusIndicator } from "@/components/ui/sync-status-indicator";
import { NotificationItem } from "@/components/ui/notification-item";
import { EmptyState } from "@/components/ui/empty-state";
import { faDigits } from "@/lib/amount";
import { relativeTimeFa } from "@/lib/date-client";

function notifTarget(n: AppNotification): string | null {
  if (!n.entity || !n.entityId) return null;
  return `/notifications/${n.entity}/${n.entityId}`;
}

export function Header({ crumbs }: { crumbs?: Crumb[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiFetch<Paginated<AppNotification>>("/api/v1/notifications?limit=20"),
    refetchInterval: 30_000,
  });
  const items = q.data?.items || [];
  const unread = items.filter((n) => !n.readAt).length;

  const openNotif = async (n: AppNotification) => {
    try {
      await apiPost(`/api/v1/notifications/${n._id}/read`, {});
      qc.invalidateQueries({ queryKey: ["notifications"] });
    } catch { /* ignore */ }
    setOpen(false);
    const target = notifTarget(n);
    if (target) router.push(target);
  };

  return (
    <header className="no-print sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-3 px-4 md:px-6">
        {crumbs ? <Breadcrumb items={crumbs} /> : <span className="text-[13px] font-black text-ink-700">توان‌بان</span>}
        <div className="flex items-center gap-2.5">
          <SyncStatusIndicator className="hidden sm:inline-flex" />
          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="اعلان‌ها"
              className="press relative flex h-10 w-10 items-center justify-center rounded-[12px] border border-line bg-white text-ink-500 transition-colors hover:text-primary-600"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="tnum absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-bad-600 px-1 text-[10px] font-black text-white">
                  {faDigits(unread)}
                </span>
              )}
            </button>
            {open && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                <div className="anim-scale-in absolute end-0 top-12 z-50 w-[min(92vw,380px)] overflow-hidden rounded-card border border-line bg-white shadow-[0_20px_50px_rgba(15,23,42,0.16)]">
                  <div className="flex items-center justify-between border-b border-line px-4 py-3">
                    <p className="text-[13px] font-black text-ink-900">اعلان‌ها</p>
                    {unread > 0 && (
                      <button
                        className="text-[11.5px] font-black text-primary-600"
                        onClick={async () => {
                          await apiPost("/api/v1/notifications/read-all", {});
                          qc.invalidateQueries({ queryKey: ["notifications"] });
                        }}
                      >
                        خواندن همه
                      </button>
                    )}
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto">
                    {items.length === 0 ? (
                      <EmptyState title="اعلانی ندارید" />
                    ) : (
                      items.map((n) => <NotificationItem key={n._id} n={n} onClick={() => openNotif(n)} />)
                    )}
                  </div>
                  <p className="border-t border-line px-4 py-2 text-center text-[10.5px] font-bold text-ink-300">
                    آخرین به‌روزرسانی: {q.dataUpdatedAt ? relativeTimeFa(new Date(q.dataUpdatedAt).toISOString()) : "—"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
