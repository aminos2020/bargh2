"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import type { WorkGroup } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GroupForm } from "@/components/forms/group-form";
import { useMobile } from "@/hooks/use-mobile";
import { faDigits } from "@/lib/amount";

export function GroupList({ basePath }: { basePath: string }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const mobile = useMobile();
  const query = useQuery({ queryKey: ["groups"], queryFn: () => apiFetch<WorkGroup[]>("/api/v1/groups?mine=1") });
  const list = query.data || [];
  const Wrap = mobile ? BottomSheet : Modal;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-[12.5px] font-bold text-ink-400">{faDigits(list.length)} گروه</p>
        <Button icon={<Plus size={17} />} onClick={() => setCreateOpen(true)}>گروه جدید</Button>
      </div>

      {query.isLoading ? (
        <CardSkeleton rows={3} />
      ) : query.isError ? (
        <Card><ErrorState onRetry={() => query.refetch()} /></Card>
      ) : list.length === 0 ? (
        <Card><EmptyState icon={<Users size={28} />} title="گروهی تعریف نشده" body="اولین گروه کاری را بسازید و نیروها را به آن تخصیص دهید." action={<Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>ساخت گروه</Button>} /></Card>
      ) : (
        <div className="stagger grid gap-3 sm:grid-cols-2">
          {list.map((g) => (
            <Card key={g._id} hover onClick={() => router.push(`${basePath}/${g._id}`)}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[15px] font-black text-ink-900">{g.name}</p>
                  {g.description && <p className="mt-1 line-clamp-1 text-[12px] font-bold text-ink-400">{g.description}</p>}
                </div>
                <Badge className={g.isActive ? "border-green-200 bg-ok-50 text-ok-700" : "border-red-200 bg-bad-50 text-bad-700"}>{g.isActive ? "فعال" : "غیرفعال"}</Badge>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-dashed border-line pt-3">
                <div className="flex items-center gap-2">
                  <Avatar name={g.supervisorName || "؟"} size={30} />
                  <span className="text-[12px] font-black text-ink-700">{g.supervisorName || "بدون سرپرست"}</span>
                </div>
                <span className="tnum text-[12px] font-bold text-ink-400">{faDigits(g.memberCount || 0)} عضو</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Wrap open={createOpen} onClose={() => setCreateOpen(false)} title="ایجاد گروه کاری">
        <GroupForm onDone={() => setCreateOpen(false)} />
      </Wrap>
    </div>
  );
}
