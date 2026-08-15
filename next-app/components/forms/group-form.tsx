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
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Contract, PublicUser } from "@/types";

const schema = z.object({
  name: z.string().min(2, "نام گروه الزامی است."),
  description: z.string().optional(),
  contractId: z.string().min(1, "قرارداد را انتخاب کنید."),
  supervisorUserId: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export function GroupForm({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const contractsQ = useQuery({ queryKey: ["contracts"], queryFn: () => apiFetch<{ items: Contract[] }>("/api/v1/contracts?limit=100") });
  const supervisorsQ = useQuery({ queryKey: ["users", "GROUP_SUPERVISOR"], queryFn: () => apiFetch<{ items: PublicUser[] }>("/api/v1/users?role=GROUP_SUPERVISOR&limit=100") });
  const membersQ = useQuery({ queryKey: ["users", "TECHNICIAN"], queryFn: () => apiFetch<{ items: PublicUser[] }>("/api/v1/users?role=TECHNICIAN&limit=100") });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", contractId: "", supervisorUserId: "" },
  });

  const submit = handleSubmit(async (v) => {
    setSaving(true);
    try {
      await apiPost("/api/v1/groups", { ...v, supervisorUserId: v.supervisorUserId || null, memberIds });
      toast("گروه با موفقیت ایجاد شد.", "success");
      qc.invalidateQueries({ queryKey: ["groups"] });
      onDone();
    } catch (e) {
      toast(e instanceof Error ? e.message : "ایجاد گروه ناموفق بود.", "error");
    } finally {
      setSaving(false);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <div><p className="mb-1.5 text-[12.5px] font-black text-ink-700">نام گروه</p><Input placeholder="مثلا: گروه خطوط ۶۳ کیلوولت" {...register("name")} error={errors.name?.message} /></div>
      <div><p className="mb-1.5 text-[12.5px] font-black text-ink-700">توضیحات</p><Textarea {...register("description")} /></div>
      <div>
        <p className="mb-1.5 text-[12.5px] font-black text-ink-700">قرارداد</p>
        <Select value={watch("contractId")} onChange={(v) => setValue("contractId", v)} placeholder="انتخاب قرارداد"
          options={(contractsQ.data?.items || []).map((c) => ({ value: c._id, label: c.title }))} error={errors.contractId?.message} />
      </div>
      <div>
        <p className="mb-1.5 text-[12.5px] font-black text-ink-700">سرپرست گروه (فقط یک نفر)</p>
        <Select value={watch("supervisorUserId") || ""} onChange={(v) => setValue("supervisorUserId", v)} placeholder="انتخاب سرپرست"
          options={(supervisorsQ.data?.items || []).map((u) => ({ value: u._id, label: u.fullName }))} />
      </div>
      <div>
        <p className="mb-1.5 text-[12.5px] font-black text-ink-700">اعضای گروه</p>
        <MultiSelect values={memberIds} onChange={setMemberIds}
          options={(membersQ.data?.items || []).map((u) => ({ value: u._id, label: u.fullName }))} placeholder="نیرویی ثبت نشده" />
      </div>
      <Button full size="lg" type="submit" loading={saving}>ایجاد گروه</Button>
    </form>
  );
}
