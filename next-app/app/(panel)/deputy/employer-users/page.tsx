"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import { PanelPage } from "@/components/layout/panel-page";
import { apiFetch } from "@/lib/api-fetch";
import type { Paginated, PublicUser } from "@/types";
import { ROLE_LABEL } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserForm } from "@/components/forms/user-form";

export default function EmployerUsersPage() {
  const [open, setOpen] = useState(false);
  const query = useQuery({
    queryKey: ["users", "employer"],
    queryFn: () => apiFetch<Paginated<PublicUser>>("/api/v1/users?limit=100"),
  });
  const list = (query.data?.items || []).filter((u) => u.role === "EMPLOYER_CEO" || u.role === "EMPLOYER_EXPERT");

  return (
    <PanelPage role="DEPUTY">
      <PageHeader
        title="کاربران کارفرمایی"
        subtitle="رییس و کارشناسان کارفرمای واحدهای معاونت"
        actions={<Button icon={<Plus size={17} />} onClick={() => setOpen(true)}>کاربر جدید</Button>}
      />
      {query.isLoading ? (
        <CardSkeleton rows={4} />
      ) : query.isError ? (
        <Card><ErrorState onRetry={() => query.refetch()} /></Card>
      ) : list.length === 0 ? (
        <Card><EmptyState icon={<Users size={28} />} title="کاربر کارفرمایی ثبت نشده" body="رییس یا کارشناس کارفرما را برای واحدها ایجاد کنید." action={<Button icon={<Plus size={16} />} onClick={() => setOpen(true)}>ایجاد کاربر</Button>} /></Card>
      ) : (
        <div className="stagger space-y-2.5">
          {list.map((u) => (
            <Card key={u._id}>
              <div className="flex items-center gap-3">
                <Avatar name={u.fullName} size={42} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-black text-ink-900">{u.fullName}</p>
                  <p className="mt-0.5 text-[11.5px] font-bold text-ink-400">{ROLE_LABEL[u.role]} — {u.mobileMasked}</p>
                </div>
                <Badge className={u.isActive ? "border-green-200 bg-ok-50 text-ok-700" : "border-red-200 bg-bad-50 text-bad-700"}>{u.isActive ? "فعال" : "غیرفعال"}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="ایجاد کاربر کارفرمایی">
        <UserForm onDone={() => setOpen(false)} />
      </Modal>
    </PanelPage>
  );
}
