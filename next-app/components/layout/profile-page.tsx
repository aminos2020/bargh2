"use client";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { apiPost } from "@/lib/api-fetch";
import { useToast } from "@/components/ui/toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABEL } from "@/types";
import { SyncStatusIndicator } from "@/components/ui/sync-status-indicator";

export function ProfileView() {
  const me = useAuthStore((s) => s.me);
  const router = useRouter();
  const toast = useToast();
  if (!me) return null;

  const logout = async () => {
    try {
      await apiPost("/api/v1/auth/logout", {});
      router.push("/login");
      router.refresh();
    } catch {
      toast("خروج ناموفق بود.", "error");
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card className="anim-scale-in text-center">
        <Avatar name={me.fullName} size={84} className="mx-auto" />
        <h1 className="mt-4 text-[18px] font-black text-ink-900">{me.fullName}</h1>
        <Badge className="mt-2 border-primary-200 bg-primary-50 text-primary-700">{ROLE_LABEL[me.role]}</Badge>
        <p dir="ltr" className="tnum mt-3 text-[13px] font-bold text-ink-400">{me.mobileMasked}</p>
        <div className="mt-4 flex items-center justify-center gap-2 border-t border-dashed border-line pt-4">
          <ShieldCheck size={15} className="text-ok-600" />
          <p className="text-[11.5px] font-bold text-ink-400">ورود فقط با شماره ثبت‌شده توسط مدیر سامانه</p>
        </div>
        <div className="mt-3 flex items-center justify-center"><SyncStatusIndicator /></div>
        <Button variant="dangerSoft" full size="lg" className="mt-5" icon={<LogOut size={18} />} onClick={logout}>
          خروج از سامانه
        </Button>
      </Card>
    </div>
  );
}
