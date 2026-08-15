"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building, Plus } from "lucide-react";
import { PanelPage } from "@/components/layout/panel-page";
import { apiFetch, apiPost } from "@/lib/api-fetch";
import type { WorkUnit } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { useToast } from "@/components/ui/toast";

export default function UnitsPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const query = useQuery({ queryKey: ["units"], queryFn: () => apiFetch<WorkUnit[]>("/api/v1/units") });

  const create = async () => {
    if (name.trim().length < 2) { toast("نام واحد را کامل وارد کنید.", "warn"); return; }
    setSaving(true);
    try {
      await apiPost("/api/v1/units", { name: name.trim() });
      toast("واحد ایجاد شد.", "success");
      qc.invalidateQueries({ queryKey: ["units"] });
      setOpen(false); setName("");
    } catch (e) {
      toast(e instanceof Error ? e.message : "ناموفق بود.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PanelPage role="DEPUTY">
      <PageHeader title="واحدهای معاونت" subtitle="واحدهای کارفرمایی زیرمجموعه" actions={<Button icon={<Plus size={17} />} onClick={() => setOpen(true)}>واحد جدید</Button>} />
      {query.isLoading ? <CardSkeleton rows={3} /> : (query.data || []).length === 0 ? (
        <Card><EmptyState icon={<Building size={28} />} title="واحدی تعریف نشده" /></Card>
      ) : (
        <div className="stagger grid gap-3 sm:grid-cols-2">
          {(query.data || []).map((u) => (
            <Card key={u._id}>
              <p className="text-[15px] font-black text-ink-900">{u.name}</p>
              {u.description && <p className="mt-1 text-[12px] font-bold text-ink-400">{u.description}</p>}
            </Card>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="ایجاد واحد">
        <p className="mb-1.5 text-[12.5px] font-black text-ink-700">نام واحد</p>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلا: واحد بهره‌برداری خطوط" />
        <Button full size="lg" className="mt-4" loading={saving} onClick={create}>ایجاد</Button>
      </Modal>
    </PanelPage>
  );
}
