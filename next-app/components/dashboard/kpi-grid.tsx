"use client";
import type { ReactNode } from "react";
import { KpiCard } from "@/components/ui/kpi-card";

export interface Kpi {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: "primary" | "ok" | "warn" | "bad" | "cyan" | "teal" | "orange" | "dark";
  sub?: string;
  onClick?: () => void;
}

export function KpiGrid({ kpis, cols = 4 }: { kpis: Kpi[]; cols?: 2 | 3 | 4 }) {
  return (
    <div className={cols === 2 ? "grid grid-cols-2 gap-3" : cols === 3 ? "grid grid-cols-2 gap-3 lg:grid-cols-3" : "grid grid-cols-2 gap-3 lg:grid-cols-4"}>
      {kpis.map((k, i) => (
        <KpiCard key={k.label} label={k.label} value={k.value} icon={k.icon} tone={k.tone} sub={k.sub} onClick={k.onClick} delay={i * 45} />
      ))}
    </div>
  );
}
