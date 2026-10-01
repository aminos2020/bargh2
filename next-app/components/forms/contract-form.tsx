"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPost } from "@/lib/api-fetch";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import type { Company } from "@/types";
import { jalaliDateSchema } from "@/lib/validators";

const schema = z.object({
  title: z.string().min(3, "عنوان قرارداد را وارد کنید."),
  contractType: z.enum(["volume", "unit_price", "other"]),
  contractorCompanyId: z.string().min(1, "شرکت پیمانکار را انتخاب کنید."),
  startDate: jalaliDateSchema,
  endDate: jalaliDateSchema,
  status: z.enum(["active", "completed", "terminated"]),
  publicNotes: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export function ContractForm({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const companiesQ = useQuery({ queryKey: ["companies"], queryFn: () => apiFetch<{ items: Company[] }>("/api/v1/companies?limit=100") });
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { contractType: "unit_price", status: "active", contractorCompanyId: "", title: "", startDate: "", endDate: "", publicNotes: "" },
  });

  const submit = handleSubmit(async (v) => {
    setSaving(true);
    try {
      await apiPost("/api/v1/contracts", v);
      toast("قرارداد با موفقیت ثبت شد.", "success");
      qc.invalidateQueries({ queryKey: ["contracts"] });
      onDone();
    } catch (e) {
      toast(e instanceof Error ? e.message : "ثبت قرارداد ناموفق بود.", "error");
    } finally {
      setSaving(false);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-input border border-amber-200 bg-warn-50 px-4 py-3">
        <TriangleAlert size={17} className="mt-0.5 shrink-0 text-warn-600" />
        <p className="text-[12px] font-bold leading-6 text-warn-700">اطلاعات محرمانه نباید در سامانه ثبت شود؛ فقط اطلاعات عمومی قرارداد ذخیره می‌شود.</p>
      </div>
      <div><p className="mb-1.5 text-[12.5px] font-black text-ink-700">عنوان</p><Input {...register("title")} error={errors.title?.message} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[12.5px] font-black text-ink-700">نوع قرارداد</p>
          <Select value={watch("contractType")} onChange={(v) => setValue("contractType", v as Form["contractType"])}
            options={[{ value: "volume", label: "حجمی" }, { value: "unit_price", label: "فهرست بهایی" }, { value: "other", label: "سایر" }]} />
        </div>
        <div>
          <p className="mb-1.5 text-[12.5px] font-black text-ink-700">شرکت پیمانکار</p>
          <Select value={watch("contractorCompanyId")} onChange={(v) => setValue("contractorCompanyId", v)} placeholder="انتخاب شرکت"
            options={(companiesQ.data?.items || []).map((c) => ({ value: c._id, label: c.name }))} error={errors.contractorCompanyId?.message} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><p className="mb-1.5 text-[12.5px] font-black text-ink-700">تاریخ شروع (شمسی)</p><Input dir="ltr" placeholder="1404-01-01" {...register("startDate")} error={errors.startDate?.message} /></div>
        <div><p className="mb-1.5 text-[12.5px] font-black text-ink-700">تاریخ پایان (شمسی)</p><Input dir="ltr" placeholder="1404-12-29" {...register("endDate")} error={errors.endDate?.message} /></div>
      </div>
      <div>
        <p className="mb-1.5 text-[12.5px] font-black text-ink-700">وضعیت</p>
        <Select value={watch("status")} onChange={(v) => setValue("status", v as Form["status"])}
          options={[{ value: "active", label: "فعال" }, { value: "completed", label: "تکمیل‌شده" }, { value: "terminated", label: "خاتمه‌یافته" }]} />
      </div>
      <div><p className="mb-1.5 text-[12.5px] font-black text-ink-700">توضیحات عمومی</p><Textarea {...register("publicNotes")} /></div>
      <Button full size="lg" type="submit" loading={saving}>ثبت قرارداد</Button>
    </form>
  );
}
