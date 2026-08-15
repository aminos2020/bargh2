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
import type { WorkGroup } from "@/types";

const schema = z.object({
  title: z.string().min(3, "عنوان کار را کامل‌تر بنویسید."),
  description: z.string().optional(),
  groupId: z.string().min(1, "گروه را انتخاب کنید."),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  dueDate: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export function TaskForm({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const groupsQ = useQuery({ queryKey: ["my-groups"], queryFn: () => apiFetch<WorkGroup[]>("/api/v1/groups?mine=1") });
  const membersQ = useQuery({
    queryKey: ["group-members", "all"],
    queryFn: () => apiFetch<{ _id: string; fullName: string }[]>("/api/v1/groups/all-members"),
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "medium", groupId: "", title: "", description: "", dueDate: "" },
  });
  const [userIds, setUserIds] = useState<string[]>([]);

  const submit = handleSubmit(async (v) => {
    setSaving(true);
    try {
      await apiPost("/api/v1/tasks", { ...v, userIds, dueDate: v.dueDate || null });
      toast("کار با موفقیت ایجاد شد.", "success");
      qc.invalidateQueries({ queryKey: ["tasks"] });
      onDone();
    } catch (e) {
      toast(e instanceof Error ? e.message : "ایجاد کار ناموفق بود.", "error");
    } finally {
      setSaving(false);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <p className="mb-1.5 text-[12.5px] font-black text-ink-700">عنوان کار</p>
        <Input placeholder="مثلا: بازدید از پست ۶۳ کیلوولت..." {...register("title")} error={errors.title?.message} />
      </div>
      <div>
        <p className="mb-1.5 text-[12.5px] font-black text-ink-700">شرح</p>
        <Textarea placeholder="جزئیات کار محوله..." {...register("description")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[12.5px] font-black text-ink-700">گروه</p>
          <Select value={watch("groupId")} onChange={(v) => setValue("groupId", v)} placeholder="انتخاب گروه"
            options={(groupsQ.data || []).map((g) => ({ value: g._id, label: g.name }))} error={errors.groupId?.message} />
        </div>
        <div>
          <p className="mb-1.5 text-[12.5px] font-black text-ink-700">اولویت</p>
          <Select value={watch("priority")} onChange={(v) => setValue("priority", v as Form["priority"])}
            options={[{ value: "low", label: "کم" }, { value: "medium", label: "متوسط" }, { value: "high", label: "زیاد" }, { value: "urgent", label: "فوری" }]} />
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-[12.5px] font-black text-ink-700">تاریخ انجام (شمسی)</p>
        <Input dir="ltr" placeholder="1404-06-15" {...register("dueDate")} />
      </div>
      <div>
        <p className="mb-1.5 text-[12.5px] font-black text-ink-700">تخصیص به نیروها (اختیاری)</p>
        <MultiSelect values={userIds} onChange={setUserIds}
          options={(membersQ.data || []).map((m) => ({ value: m._id, label: m.fullName }))} placeholder="نیرویی نیست" />
      </div>
      <Button full size="lg" type="submit" loading={saving}>ایجاد کار</Button>
    </form>
  );
}
