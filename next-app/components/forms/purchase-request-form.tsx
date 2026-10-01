"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api-fetch";
import { useAuthStore } from "@/stores/auth-store";
import { useOffline } from "@/hooks/use-offline";
import { useSyncStore } from "@/stores/sync-store";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AmountInput } from "@/components/ui/amount-input";
import { useState } from "react";

const schema = z.object({
  title: z.string().min(3, "عنوان خرید را وارد کنید."),
  itemDescription: z.string().min(5, "شرح کالا یا تجهیز را کامل بنویسید."),
  quantity: z.coerce.number().min(1, "تعداد را وارد کنید."),
  estimatedPrice: z.number().min(1, "برآورد قیمت را وارد کنید."),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  reason: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export function PurchaseRequestForm({ backHref }: { backHref: string }) {
  const me = useAuthStore((s) => s.me);
  const { online } = useOffline();
  const enqueue = useSyncStore((s) => s.enqueue);
  const toast = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", itemDescription: "", quantity: 1, estimatedPrice: 0, priority: "medium", reason: "" },
  });

  const submit = handleSubmit(async (v) => {
    setSaving(true);
    const payload = { ...v, contractId: null };
    const key = `pur-${Date.now().toString(36)}`;
    try {
      if (!online) {
        enqueue({ idempotencyKey: key, endpoint: "create_purchase_request", payload });
        toast("ذخیره شد و بعد از اتصال ارسال می‌شود.", "success");
      } else {
        await apiPost("/api/v1/purchase-requests", payload);
        toast("درخواست خرید ثبت شد.", "success");
      }
      router.push(backHref);
    } catch (e) {
      toast(e instanceof Error ? e.message : "ثبت درخواست ناموفق بود.", "error");
    } finally {
      setSaving(false);
    }
  });

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4">
      <div><p className="mb-1.5 text-[12.5px] font-black text-ink-700">عنوان خرید</p><Input placeholder="مثلا: خرید مقره ۲۰ کیلوولت" {...register("title")} error={errors.title?.message} /></div>
      <div><p className="mb-1.5 text-[12.5px] font-black text-ink-700">شرح کالا یا تجهیز</p><Textarea {...register("itemDescription")} error={errors.itemDescription?.message} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><p className="mb-1.5 text-[12.5px] font-black text-ink-700">تعداد</p><Input type="number" dir="ltr" {...register("quantity")} error={errors.quantity?.message} /></div>
        <div>
          <p className="mb-1.5 text-[12.5px] font-black text-ink-700">اولویت</p>
          <Select value={watch("priority")} onChange={(v) => setValue("priority", v as Form["priority"])}
            options={[{ value: "low", label: "کم" }, { value: "medium", label: "متوسط" }, { value: "high", label: "زیاد" }, { value: "urgent", label: "فوری" }]} />
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-[12.5px] font-black text-ink-700">برآورد قیمت کل (ریال)</p>
        <AmountInput value={watch("estimatedPrice")} onChange={(n) => setValue("estimatedPrice", n, { shouldValidate: true })} error={errors.estimatedPrice?.message} />
      </div>
      <div><p className="mb-1.5 text-[12.5px] font-black text-ink-700">دلیل خرید</p><Textarea {...register("reason")} /></div>
      <Button full size="xl" type="submit" loading={saving}>{online ? "ثبت و ارسال درخواست" : "ذخیره برای ارسال بعدی"}</Button>
    </form>
  );
}
