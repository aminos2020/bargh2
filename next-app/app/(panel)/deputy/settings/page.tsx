"use client";
import { PanelPage } from "@/components/layout/panel-page";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, KeyRound, Database, BellRing } from "lucide-react";

const rows = [
  { icon: <ShieldCheck size={18} />, title: "احراز هویت", body: "ورود فقط با شماره‌ی ثبت‌شده توسط مدیر + کد یک‌بارمصرف ۵ رقمی با اعتبار ۲ دقیقه و محدودیت ۵ تلاش." },
  { icon: <KeyRound size={18} />, title: "رمزنگاری", body: "شماره موبایل با AES-256-GCM رمزنگاری و برای جستجو هش می‌شود؛ OTP هرگز به‌صورت خام ذخیره نمی‌شود." },
  { icon: <Database size={18} />, title: "داده‌ها", body: "حذف سخت ممنوع است؛ همه‌ی تغییرات مهم در Audit Log ثبت می‌شود." },
  { icon: <BellRing size={18} />, title: "اطلاع‌رسانی", body: "اعلان‌های درون‌سامانه‌ای برای همه‌ی مراحل گردش کار فعال است." },
];

export default function SettingsPage() {
  return (
    <PanelPage role="DEPUTY">
      <PageHeader title="تنظیمات سامانه" subtitle="وضعیت امنیتی و پیکربندی" />
      <div className="stagger grid gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <Card key={r.title}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary-50 text-primary-600">{r.icon}</span>
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-black text-ink-900">{r.title}</p>
                <Badge className="border-green-200 bg-ok-50 text-ok-700">فعال</Badge>
              </div>
            </div>
            <p className="mt-3 text-[12px] font-bold leading-6 text-ink-400">{r.body}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-4">
        <p className="text-[12.5px] font-black text-ink-700">نکته‌ی عملیاتی</p>
        <p className="mt-2 text-[12.5px] font-bold leading-7 text-ink-400">
          برای اتصال به درگاه پیامک واقعی، بدنه‌ی تابع <span dir="ltr" className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px]">sendOtpByGateway()</span> در فایل <span dir="ltr" className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px]">lib/otp.ts</span> را با درگاه خود جایگزین کنید. تا آن زمان کد OTP فقط در console سرور (حالت توسعه) نمایش داده می‌شود.
        </p>
      </Card>
    </PanelPage>
  );
}
