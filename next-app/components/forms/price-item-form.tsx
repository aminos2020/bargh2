"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPost } from "@/lib/api-fetch";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { AmountInput } from "@/components/ui/amount-input";
import { useState } from "react";
import type { WorkGroup } from "@/types";

const schema = z.object({
  code: z.string().min(1, "کد آیتم الزامی است."),
  title: z.string().min(2, "عنوان آیتم الزامی است."),
  unit: z.string().min(1, "واحد اندازه‌گیری الزامی است."),
  unitPrice: z.number().min(1, "قیمت واحد را وارد کنید."),
});
type Form = z.infer<typeof schema>;

export function PriceItemForm({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const groupsQ = useQuery({ queryKey: ["my-groups"], queryFn: () => apiFetch<WorkGroup[]>("/api/v1/groups?mine=1") });
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { code: "", title: "", unit: "", unitPrice: 0 },
  });

  const submit = handleSubmit(async (v) => {
    if (groupIds.length === 0) { toast("حداقل یک گروه انتخاب کنید.", "warn"); return; }
    setSaving(true);
    try {
      await apiPost("/api/v1/price-items", { ...v, groupIds });
      toast("آیتم بها با موفقیت ثبت شد.", "success");
      qc.invalidateQueries({ queryKey: ["price-items"] });
      onDone();
    } catch (e) {
      toast(e instanceof Error ? e.message : "ثبت آیتم ناموفق بود.", "error");
    } finally {
      setSaving(false);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><p className="mb-1.5 text-[12.5px] font-black text-ink-700">کد</p><Input dir="ltr" placeholder="010101" {...register("code")} error={errors.code?.message} /></div>
        <div><p className="mb-1.5 text-[12.5px] font-black text-ink-700">واحد</p><Input placeholder="کیلومتر / دستگاه / عدد" {...register("unit")} error={errors.unit?.message} /></div>
      </div>
      <div><p className="mb-1.5 text-[12.5px] font-black text-ink-700">عنوان</p><Input placeholder="مثلا: کابل‌کشی فشار متوسط" {...register("title")} error={errors.title?.message} /></div>
      <div>
        <p className="mb-1.5 text-[12.5px] font-black text-ink-700">قیمت واحد (ریال)</p>
        <AmountInput value={watch("unitPrice")} onChange={(n) => setValue("unitPrice", n, { shouldValidate: true })} error={errors.unitPrice?.message} />
      </div>
      <div>
        <p className="mb-1.5 text-[12.5px] font-black text-ink-700">گروه‌های مجاز</p>
        <MultiSelect values={groupIds} onChange={setGroupIds} options={(groupsQ.data || []).map((g) => ({ value: g._id, label: g.name }))} placeholder="گروهی نیست" />
      </div>
      <Button full size="lg" type="submit" loading={saving}>ثبت آیتم</Button>
    </form>
  );
}
