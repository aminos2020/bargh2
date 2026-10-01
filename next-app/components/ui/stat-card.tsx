"use client";
import type { ReactNode } from "react";
import { Card } from "./card";

export function StatCard({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: string; icon?: ReactNode }) {
  return (
    <Card className="flex items-center gap-3">
      {icon && <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-primary-50 text-primary-600">{icon}</span>}
      <div className="min-w-0">
        <p className="truncate text-[11.5px] font-black text-ink-400">{label}</p>
        <p className="tnum mt-0.5 text-[17px] font-black text-ink-900">{value}</p>
        {hint && <p className="mt-0.5 text-[10.5px] font-bold text-ink-300">{hint}</p>}
      </div>
    </Card>
  );
}
