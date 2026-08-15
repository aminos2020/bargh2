"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { apiFetch, apiPost } from "@/lib/api-fetch";
import type { AppNotification, Paginated } from "@/types";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Pagination } from "@/components/ui/pagination";
import { NotificationItem } from "@/components/ui/notification-item";

export function NotificationInbox() {
  const [tab, setTab] = useState("unread");
  const [page, setPage] = useState(1);
  const router = useRouter();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", tab, page],
    queryFn: () => apiFetch<Paginated<AppNotification>>(`/api/v1/notifications?filter=${tab}&page=${page}&limit=20`),
  });
  const list = query.data?.items || [];

  const open = async (n: AppNotification) => {
    try {
      await apiPost(`/api/v1/notifications/${n._id}/read`, {});
      qc.invalidateQueries({ queryKey: ["notifications"] });
    } catch { /* ignore */ }
    if (n.entity && n.entityId) router.push(`/notifications/${n.entity}/${n.entityId}`);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Tabs value={tab} onChange={(t) => { setTab(t); setPage(1); }} tabs={[
          { key: "unread", label: "خوانده‌نشده" }, { key: "all", label: "همه" },
        ]} />
        {tab === "unread" && (
          <Button variant="outline" size="sm" onClick={async () => {
            await apiPost("/api/v1/notifications/read-all", {});
            qc.invalidateQueries({ queryKey: ["notifications"] });
          }}>خواندن همه</Button>
        )}
      </div>
      <Card pad={false}>
        {query.isLoading ? (
          <div className="p-4"><CardSkeleton rows={4} /></div>
        ) : list.length === 0 ? (
          <EmptyState icon={<Bell size={28} />} title={tab === "unread" ? "اعلان خوانده‌نشده‌ای ندارید" : "اعلانی ندارید"} />
        ) : (
          <>
            {list.map((n) => <NotificationItem key={n._id} n={n} onClick={() => open(n)} />)}
            <div className="p-3"><Pagination page={page} hasNextPage={!!query.data?.hasNextPage} total={query.data?.total || 0} onPage={setPage} /></div>
          </>
        )}
      </Card>
    </div>
  );
}
