"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { PanelPage } from "@/components/layout/panel-page";
import { apiPost } from "@/lib/api-fetch";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { jalaliLong, todayJalali } from "@/lib/date";

export default function DailyReportPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [activities, setActivities] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (activities.trim().length < 5) { toast("شرح فعالیت‌ها را کامل بنویسید.", "warn"); return; }
    setSaving(true);
    try {
      const res = await apiPost<{ updated: boolean }>("/api/v1/reports/daily", { description: activities.trim(), notes: notes.trim() || undefined });
      toast(res.updated ? "گزارش روزانه‌ی امروز به‌روزرسانی شد." : "گزارش روزانه ثبت و برای رییس کارفرما ارسال شد.", "success");
      qc.invalidateQueries({ queryKey: ["daily-mine"] });
      setActivities(""); setNotes("");
    } catch (e) {
      toast(e instanceof Error ? e.message : "ثبت ناموفق بود.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PanelPage role="EMPLOYER_EXPERT">
      <PageHeader title="گزارش روزانه" subtitle={`فعالیت‌های امروز — ${jalaliLong(todayJalali())}`} />
      <Card className="mx-auto max-w-2xl">
        <p className="mb-1.5 text-[12.5px] font-black text-ink-700">شرح فعالیت‌ها</p>
        <Textarea placeholder="بازدیدها، بررسی گزارش‌ها، جلسات و..." value={activities} onChange={(e) => setActivities(e.target.value)} />
        <p className="mb-1.5 mt-4 text-[12.5px] font-black text-ink-700">نکات</p>
        <Textarea placeholder="نکات تکمیلی (اختیاری)..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        <Button full size="xl" className="mt-5" loading={saving} onClick={submit} icon={<Send size={19} />}>
          ثبت و ارسال به رییس کارفرما
        </Button>
        <p className="mt-3 text-center text-[11px] font-bold text-ink-300">اگر امروز قبلا گزارش داده باشید، همین گزارش به‌روزرسانی می‌شود.</p>
      </Card>
    </PanelPage>
  );
}
