"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import type { Paginated, PublicUser } from "@/types";
import { ROLE_LABEL } from "@/types";
import { SearchBar } from "@/components/ui/search-bar";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { UserForm } from "@/components/forms/user-form";
import { useMobile } from "@/hooks/use-mobile";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { relativeTimeFa } from "@/lib/date-client";

export function PersonnelList() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const mobile = useMobile();
  const search = useDebouncedValue(q, 350);

  const query = useQuery({
    queryKey: ["users", search, role],
    queryFn: () => apiFetch<Paginated<PublicUser>>(`/api/v1/users?limit=15${search ? `&search=${encodeURIComponent(search)}` : ""}${role ? `&role=${role}` : ""}`),
  });
  const list = query.data?.items || [];
  const Wrap = mobile ? BottomSheet : Modal;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <SearchBar value={q} onChange={setQ} placeholder="جستجوی نام نیرو..." className="min-w-52 flex-1" />
        <Select value={role} onChange={setRole} placeholder="همه نقش‌ها" className="h-11 w-44"
          options={[
            { value: "TECHNICIAN", label: "کارشناس شرکت" },
            { value: "GROUP_SUPERVISOR", label: "سرپرست گروه" },
            { value: "RESIDENT_REP", label: "نماینده مقیم" },
          ]} />
        <Button icon={<Plus size={17} />} onClick={() => setCreateOpen(true)}>نیروی جدید</Button>
      </div>

      {query.isLoading ? (
        <CardSkeleton rows={4} />
      ) : query.isError ? (
        <Card><ErrorState onRetry={() => query.refetch()} /></Card>
      ) : list.length === 0 ? (
        <Card><EmptyState icon={<Users size={28} />} title="نیرویی یافت نشد" body="اولین نیروی شرکت خود را اضافه کنید." action={<Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>افزودن نیرو</Button>} /></Card>
      ) : (
        <>
          <div className="stagger space-y-2.5">
            {list.map((u) => (
              <Card key={u._id} hover onClick={() => router.push(`/contractor-ceo/personnel/${u._id}`)}>
                <div className="flex items-center gap-3">
                  <Avatar name={u.fullName} size={42} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-black text-ink-900">{u.fullName}</p>
                    <p className="mt-0.5 text-[11.5px] font-bold text-ink-400">{ROLE_LABEL[u.role]} — آخرین فعالیت: {relativeTimeFa(u.lastLoginAt)}</p>
                  </div>
                  <Badge className={u.isActive ? "border-green-200 bg-ok-50 text-ok-700" : "border-red-200 bg-bad-50 text-bad-700"}>
                    {u.isActive ? "فعال" : "غیرفعال"}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={1} hasNextPage={!!query.data?.hasNextPage} total={query.data?.total || 0} onPage={() => {}} />
        </>
      )}

      <Wrap open={createOpen} onClose={() => setCreateOpen(false)} title="افزودن نیروی جدید">
        <UserForm onDone={() => setCreateOpen(false)} />
      </Wrap>
    </div>
  );
}
