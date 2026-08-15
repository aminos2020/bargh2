"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ListTodo, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import type { Paginated, Task } from "@/types";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { TaskCard } from "./task-card";
import { TaskForm } from "@/components/forms/task-form";
import { useMobile } from "@/hooks/use-mobile";
import { usePermissions } from "@/hooks/use-permissions";

export function TaskList() {
  const [tab, setTab] = useState("open");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const mobile = useMobile();
  const { canCreateTask } = usePermissions();

  const query = useQuery({
    queryKey: ["tasks", tab, page],
    queryFn: () => apiFetch<Paginated<Task>>(`/api/v1/tasks?status=${tab === "all" ? "" : tab}&page=${page}&limit=12`),
  });
  const list = query.data?.items || [];
  const CreateWrap = mobile ? BottomSheet : Modal;

  return (
    <div>
      <PageHeader
        title="کارهای محوله"
        subtitle="کارهای محول‌شده از کارفرما یا سرپرست"
        actions={canCreateTask ? <Button size="sm" icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>ایجاد کار</Button> : undefined}
      />
      <Tabs className="mb-4" value={tab} onChange={(t) => { setTab(t); setPage(1); }} tabs={[
        { key: "open", label: "باز" }, { key: "in_progress", label: "در حال انجام" }, { key: "done", label: "انجام شده" }, { key: "all", label: "همه" },
      ]} />

      {query.isLoading ? (
        <CardSkeleton rows={3} />
      ) : query.isError ? (
        <Card><ErrorState onRetry={() => query.refetch()} /></Card>
      ) : list.length === 0 ? (
        <Card><EmptyState icon={<ListTodo size={28} />} title="کاری در این وضعیت نیست" /></Card>
      ) : (
        <>
          <div className="space-y-2.5">
            {list.map((t) => <TaskCard key={t._id} task={t} canChangeStatus />)}
          </div>
          <Pagination page={page} hasNextPage={!!query.data?.hasNextPage} total={query.data?.total || 0} onPage={setPage} />
        </>
      )}

      <CreateWrap open={createOpen} onClose={() => setCreateOpen(false)} title="ایجاد کار جدید">
        <TaskForm onDone={() => setCreateOpen(false)} />
      </CreateWrap>
    </div>
  );
}
