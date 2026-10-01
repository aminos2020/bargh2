"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { apiPost } from "@/lib/api-fetch";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { mobileSchema } from "@/lib/validators";

const schema = z.object({
  name: z.string().min(2, "نام شرکت الزامی است."),
  code: z.string().min(1, "کد شرکت الزامی است."),
  description: z.string().optional(),
  ceoFullName: z.string().min(3, "نام رییس شرکت را وارد کنید."),
  ceoMobile: mobileSchema,
});
type Form = z.infer<typeof schema>;

export function CompanyForm({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const submit = handleSubmit(async (v) => {
    setSaving(true);
    try {
      await apiPost("/api/v1/companies", v);
      toast("شرکت و رییس آن با موفقیت ایجاد شد.", "success");
      qc.invalidateQueries({ queryKey: ["companies"] });
      onDone();
    } catch (e) {
      toast(e instanceof Error ? e.message : "ایجاد شرکت ناموفق بود.", "error");
    } finally {
      setSaving(false);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><p className="mb-1.5 text-[12.5px] font-black text-ink-700">نام شرکت</p><Input placeholder="شرکت فنی مهندسی ..." {...register("name")} error={errors.name?.message} /></div>
        <div><p className="mb-1.5 text-[12.5px] font-black text-ink-700">کد شرکت</p><Input dir="ltr" placeholder="C-101" {...register("code")} error={errors.code?.message} /></div>
      </div>
      <div><p className="mb-1.5 text-[12.5px] font-black text-ink-700">توضیحات</p><Textarea {...register("description")} /></div>
      <div className="rounded-input border border-dashed border-line bg-slate-50/60 p-4">
        <p className="mb-3 text-[12.5px] font-black text-ink-700">رییس شرکت پیمانکار</p>
        <div className="space-y-4">
          <div><p className="mb-1.5 text-[12.5px] font-black text-ink-700">نام و نام خانوادگی</p><Input {...register("ceoFullName")} error={errors.ceoFullName?.message} /></div>
          <div><p className="mb-1.5 text-[12.5px] font-black text-ink-700">شماره موبایل</p><Input dir="ltr" inputMode="numeric" placeholder="09xxxxxxxxx" {...register("ceoMobile")} error={errors.ceoMobile?.message} /></div>
        </div>
      </div>
      <Button full size="lg" type="submit" loading={saving}>ایجاد شرکت</Button>
    </form>
  );
}
