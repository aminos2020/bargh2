"use client";
import { useQuery } from "@tanstack/react-query";
import { Star, Trophy } from "lucide-react";
import { PanelPage } from "@/components/layout/panel-page";
import { apiFetch } from "@/lib/api-fetch";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useAuthStore } from "@/stores/auth-store";
import { faDigits } from "@/lib/amount";
import { relativeTimeFa } from "@/lib/date-client";
import type { ScoreEvent } from "@/types";

interface ProfileLite { totalScore: number; recentScores: ScoreEvent[]; }

export default function ScoresPage() {
  const me = useAuthStore((s) => s.me);
  const q = useQuery({
    queryKey: ["scores", me?._id],
    queryFn: () => apiFetch<ProfileLite>(`/api/v1/users/${me?._id}/profile`),
    enabled: !!me,
  });

  return (
    <PanelPage role="TECHNICIAN">
      <PageHeader title="امتیازها و رزومه کاری" subtitle="پس از تایید نهایی هر گزارش، امتیاز مثبت ثبت می‌شود" />
      <div className="anim-fade-up mb-4 overflow-hidden rounded-sheet bg-ink-900 p-7 text-center shadow-[0_18px_40px_rgba(15,23,42,0.22)]">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-warn-600/20 text-amber-400"><Trophy size={26} /></span>
        <p className="mt-3 text-[12px] font-black text-slate-400">مجموع امتیاز کاری</p>
        <p className="tnum mt-1 text-[34px] font-black leading-none text-white">{q.data ? faDigits(q.data.totalScore) : "—"}</p>
      </div>
      {q.isLoading ? (
        <LoadingSkeleton className="h-64 rounded-card" />
      ) : q.isError ? (
        <Card><ErrorState onRetry={() => q.refetch()} /></Card>
      ) : (q.data?.recentScores || []).length === 0 ? (
        <Card><EmptyState icon={<Star size={28} />} title="هنوز امتیازی کسب نکرده‌اید" body="با ثبت گزارش و دریافت تایید نهایی، امتیاز مثبت می‌گیرید." /></Card>
      ) : (
        <div className="stagger space-y-2.5">
          {(q.data?.recentScores || []).map((s) => (
            <Card key={s._id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13.5px] font-black text-ink-900">{s.reason}</p>
                  <p className="mt-0.5 text-[11px] font-bold text-ink-400">{relativeTimeFa(s.createdAt)}</p>
                </div>
                <span className="tnum flex items-center gap-1.5 rounded-full bg-ok-50 px-3.5 py-1.5 text-[14px] font-black text-ok-700">
                  <Star size={14} fill="currentColor" /> +{faDigits(s.score)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PanelPage>
  );
}
