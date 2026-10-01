"use client";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Star, Trophy } from "lucide-react";
import { apiFetch, apiPatch } from "@/lib/api-fetch";
import type { PublicUser, ScoreEvent, WorkGroup, WorkReport } from "@/types";
import { ROLE_LABEL } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Avatar } from "@/components/ui/avatar";
import { formatRial, faDigits } from "@/lib/amount";
import { useToast } from "@/components/ui/toast";
import { relativeTimeFa } from "@/lib/date-client";

interface Profile extends PublicUser { groups: WorkGroup[]; totalScore: number; recentScores: ScoreEvent[]; recentReports: WorkReport[]; }

export function PersonnelProfile({ id }: { id: string }) {
  const toast = useToast();
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["user-profile", id], queryFn: () => apiFetch<Profile>(`/api/v1/users/${id}/profile`) });

  if (query.isLoading) return <LoadingSkeleton className="h-96 rounded-card" />;
  if (query.isError || !query.data) return <Card><ErrorState onRetry={() => query.refetch()} /></Card>;
  const u = query.data;

  const toggleActive = async () => {
    try {
      await apiPatch(`/api/v1/users/${u._id}`, { isActive: !u.isActive });
      toast(u.isActive ? "کاربر غیرفعال شد؛ دیگر نمی‌تواند وارد شود." : "کاربر فعال شد.", "success");
      qc.invalidateQueries({ queryKey: ["user-profile", id] });
    } catch (e) {
      toast(e instanceof Error ? e.message : "ناموفق بود.", "error");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/contractor-ceo/personnel" className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-black text-primary-600">
        <ArrowRight size={16} /> بازگشت به نیروها
      </Link>

      <Card className="mb-4">
        <div className="flex items-center gap-4">
          <Avatar name={u.fullName} size={64} />
          <div className="min-w-0 flex-1">
            <p className="text-[17px] font-black text-ink-900">{u.fullName}</p>
            <p className="mt-1 text-[12.5px] font-bold text-ink-400">{ROLE_LABEL[u.role]} — {u.mobileMasked}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge className={u.isActive ? "border-green-200 bg-ok-50 text-ok-700" : "border-red-200 bg-bad-50 text-bad-700"}>{u.isActive ? "فعال" : "غیرفعال"}</Badge>
              <Badge className="border-primary-200 bg-primary-50 text-primary-700"><Star size={11} /> امتیاز: {faDigits(u.totalScore)}</Badge>
            </div>
          </div>
          <Button variant={u.isActive ? "dangerSoft" : "success"} size="sm" onClick={toggleActive}>{u.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}</Button>
        </div>
      </Card>

      <Card className="mb-4">
        <p className="mb-3 text-[13px] font-black text-ink-700">گروه‌ها</p>
        {u.groups.length === 0 ? <EmptyState title="به گروهی تخصیص ندارد" /> : (
          <div className="flex flex-wrap gap-2">
            {u.groups.map((g) => <span key={g._id} className="rounded-full bg-primary-50 px-4 py-2 text-[12.5px] font-black text-primary-700">{g.name}</span>)}
          </div>
        )}
      </Card>

      <Card className="mb-4">
        <p className="mb-3 flex items-center gap-2 text-[13px] font-black text-ink-700"><Trophy size={15} className="text-warn-600" /> آخرین امتیازها</p>
        {u.recentScores.length === 0 ? <EmptyState title="هنوز امتیازی کسب نکرده" /> : (
          <div className="space-y-2">
            {u.recentScores.map((s) => (
              <div key={s._id} className="flex items-center justify-between rounded-input border border-line px-4 py-2.5">
                <p className="text-[12.5px] font-bold text-ink-700">{s.reason}</p>
                <span className="tnum flex items-center gap-1 text-[13px] font-black text-ok-700"><Star size={13} /> +{faDigits(s.score)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <p className="mb-3 text-[13px] font-black text-ink-700">آخرین گزارش‌ها</p>
        {u.recentReports.length === 0 ? <EmptyState title="گزارشی ثبت نکرده" /> : (
          <div className="divide-y divide-line/70">
            {u.recentReports.map((r) => (
              <div key={r._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-black text-ink-900">{r.reportDateJ} — {r.groupName}</p>
                  <p className="tnum mt-0.5 text-[11.5px] font-bold text-ink-400">{formatRial(r.totalAmount || 0, false)} ریال — {relativeTimeFa(r.createdAt)}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
