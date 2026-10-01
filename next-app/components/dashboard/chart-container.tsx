"use client";
import type { ReactNode } from "react";
import { ChartCard } from "@/components/ui/chart-card";
import { EmptyState } from "@/components/ui/empty-state";

export function ChartContainer({ title, subtitle, data, children }: { title: string; subtitle?: string; data: unknown[]; children: ReactNode }) {
  return (
    <ChartCard title={title} subtitle={subtitle}>
      {data.length === 0 ? <EmptyState title="داده‌ای برای نمایش نیست" /> : children}
    </ChartCard>
  );
}
