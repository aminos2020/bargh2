"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPost } from "@/lib/api-fetch";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { WorkGroup, Role } from "@/types";
import { mobileSchema } from "@/lib/validators";

const schema = z.object({
  fullName: z.string().min(3, "نام و نام خانوادگی را کامل وارد کنید."),
  mobile: mobileSchema,
  role: z.string().min(1, "نقش را انتخاب کنید."),
});
type Form = z.infer<typeof schema>;

export function UserForm({ onDone }: { onDone: () => void }) {
  const me = useAuthStore((s) => s.me);
  const toast = useToast();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const groupsQ = useQuery({ queryKey: ["my-groups"], queryFn: () => apiFetch<WorkGroup[]>("/api/v1/groups?mine=1"), enabled: me?.role === "CONTRACTOR_CEO" });
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { role: "", fullName: "", mobile: "" } });

  const roleOptions = me?.role === "DEPUTY"
    ? [{ value: "EMPLOYER_CEO", label: "رییس کارفرما" }, { value: "EMPLOYER_EXPERT", label: "کارشناس کارفرما" }, { value: "CONTRACTOR_CEO", label: "رییس شرکت پیمانکار" }]
    : [{ value: "TECHNICIAN", label: "کارشناس شرکت پیمانکار" }, { value: "GROUP_SUPERVISOR", label: "سرپرست گروه" }, { value: "RESIDENT_REP", label: "نماینده مقیم" }];

  const submit = handleSubmit(async (v) => {
    setSaving(true);
    try {
      await apiPost("/api/v1/users", { ...v, role: v.role as Role, groupIds });
      toast("کاربر با موفقیت ایجاد شد؛ اکنون می‌تواند با این شماره وارد شود.", "success");
      qc.invalidateQueries({ queryKey: ["users"] });
      onDone();
    } catch (e) {
      toast(e instanceof Error ? e.message : "ایجاد کاربر ناموفق بود.", "error");
    } finally {
      setSaving(false);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <div><p className="mb-1.5 text-[12.5px] font-black text-ink-700">نام و نام خانوادگی</p><Input {...register("fullName")} error={errors.fullName?.message} /></div>
      <div><p className="mb-1.5 text-[12.5px] font-black text-ink-700">شماره موبایل</p><Input dir="ltr" inputMode="numeric" placeholder="09xxxxxxxxx" {...register("mobile")} error={errors.mobile?.message} /></div>
      <div>
        <p className="mb-1.5 text-[12.5px] font-black text-ink-700">نقش</p>
        <Select value={watch("role")} onChange={(v) => setValue("role", v)} placeholder="انتخاب نقش" options={roleOptions} error={errors.role?.message} />
      </div>
      {me?.role === "CONTRACTOR_CEO" && (
        <div>
          <p className="mb-1.5 text-[12.5px] font-black text-ink-700">گروه‌ها</p>
          <MultiSelect values={groupIds} onChange={setGroupIds} options={(groupsQ.data || []).map((g) => ({ value: g._id, label: g.name }))} placeholder="گروهی تعریف نشده" />
        </div>
      )}
      <Button full size="lg" type="submit" loading={saving}>ایجاد کاربر</Button>
    </form>
  );
}
