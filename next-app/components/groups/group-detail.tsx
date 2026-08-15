"use client";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, UserPlus } from "lucide-react";
import { apiFetch, apiPost } from "@/lib/api-fetch";
import type { PublicUser, WorkGroup } from "@/types";
import { MEMBERSHIP_LABEL, type MembershipType } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { faDigits } from "@/lib/amount";

interface Member extends PublicUser { membershipType: MembershipType; }
interface Detail extends WorkGroup { members: Member[]; assignableUsers: PublicUser[]; }

export function GroupDetail({ id, backHref }: { id: string; backHref: string }) {
  const toast = useToast();
  const qc = useQueryClient();
  const mobile = useMobile();
  const [addOpen, setAddOpen] = useState(false);
  const [addRole, setAddRole] = useState<MembershipType>("member");
  const [userId, setUserId] = useState("");

  const query = useQuery({ queryKey: ["group", id], queryFn: () => apiFetch<Detail>(`/api/v1/groups/${id}`) });
  if (query.isLoading) return <LoadingSkeleton className="h-96 rounded-card" />;
  if (query.isError || !query.data) return <Card><ErrorState onRetry={() => query.refetch()} /></Card>;
  const g = query.data;
  const Wrap = mobile ? BottomSheet : Modal;

  const addMember = async () => {
    if (!userId) { toast("کاربر را انتخاب کنید.", "warn"); return; }
    try {
      await apiPost(`/api/v1/memberships`, { groupId: id, userId, membershipType: addRole });
      toast("عضو به گروه اضافه شد.", "success");
      qc.invalidateQueries({ queryKey: ["group", id] });
      setAddOpen(false);
    } catch (e) {
      toast(e instanceof Error ? e.message : "ناموفق بود.", "error");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={backHref} className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-black text-primary-600"><ArrowRight size={16} /> بازگشت</Link>
      <Card className="mb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[17px] font-black text-ink-900">{g.name}</p>
            {g.description && <p className="mt-1 text-[12.5px] font-bold leading-6 text-ink-400">{g.description}</p>}
          </div>
          <Button size="sm" variant="soft" icon={<UserPlus size={15} />} onClick={() => setAddOpen(true)}>افزودن عضو</Button>
        </div>
        <p className="mt-3 rounded-input bg-slate-50 px-4 py-2.5 text-[12px] font-bold text-ink-500">
          سرپرست: {g.supervisorName || "تعیین نشده"} — {faDigits(g.members.length)} عضو
        </p>
      </Card>

      {g.members.length === 0 ? (
        <Card><EmptyState title="عضوی ندارد" body="نیروها و ناظران کارفرما را به این گروه اضافه کنید." /></Card>
      ) : (
        <div className="stagger space-y-2.5">
          {g.members.map((m) => (
            <Card key={m._id + m.membershipType}>
              <div className="flex items-center gap-3">
                <Avatar name={m.fullName} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-black text-ink-900">{m.fullName}</p>
                  <p className="mt-0.5 text-[11px] font-bold text-ink-400">{m.mobileMasked}</p>
                </div>
                <Badge className="border-primary-200 bg-primary-50 text-primary-700">{MEMBERSHIP_LABEL[m.membershipType]}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Wrap open={addOpen} onClose={() => setAddOpen(false)} title="افزودن عضو به گروه">
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-[12.5px] font-black text-ink-700">نوع عضویت</p>
            <div className="flex flex-wrap gap-2">
              {(["member", "employer_expert", "employer_ceo"] as MembershipType[]).map((t) => (
                <button key={t} onClick={() => setAddRole(t)}
                  className={`press rounded-full border px-4 py-2 text-[12px] font-black ${addRole === t ? "border-primary-600 bg-primary-600 text-white" : "border-line bg-white text-ink-500"}`}>
                  {MEMBERSHIP_LABEL[t]}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] font-bold text-ink-300">مالکیت نیروها تغییر نمی‌کند؛ فقط به این گروه مرتبط می‌شوند.</p>
          </div>
          <div>
            <p className="mb-1.5 text-[12.5px] font-black text-ink-700">کاربر</p>
            <select value={userId} onChange={(e) => setUserId(e.target.value)}
              className="h-[52px] w-full rounded-input border border-line bg-white px-4 text-[14px] font-medium outline-none focus:border-primary-400">
              <option value="">انتخاب کاربر</option>
              {g.assignableUsers.map((u) => <option key={u._id} value={u._id}>{u.fullName}</option>)}
            </select>
          </div>
          <Button full size="lg" onClick={addMember}>افزودن به گروه</Button>
        </div>
      </Wrap>
    </div>
  );
}
