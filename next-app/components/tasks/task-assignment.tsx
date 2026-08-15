"use client";
import { useQueryClient } from "@tanstack/react-query";
import { apiPatch } from "@/lib/api-fetch";
import { useToast } from "@/components/ui/toast";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { useState } from "react";

/** واگذاری کار به اعضای گروه (سرپرست) */
export function TaskAssignment({ taskId, options, initial, onDone }: {
  taskId: string;
  options: { value: string; label: string }[];
  initial: string[];
  onDone: () => void;
}) {
  const toast = useToast();
  const qc = useQueryClient();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await apiPatch(`/api/v1/tasks/${taskId}`, { assignedUserIds: values });
      toast("تخصیص کار ذخیره شد.", "success");
      qc.invalidateQueries({ queryKey: ["tasks"] });
      onDone();
    } catch (e) {
      toast(e instanceof Error ? e.message : "ناموفق بود.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <p className="mb-2 text-[12.5px] font-black text-ink-700">تخصیص به اعضای گروه</p>
      <MultiSelect values={values} onChange={setValues} options={options} placeholder="عضوی نیست" />
      <Button className="mt-4" loading={saving} onClick={save}>ذخیره تخصیص</Button>
    </div>
  );
}
