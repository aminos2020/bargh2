"use client";
import type { ReactNode } from "react";
import { Card } from "./card";
import { cn } from "@/lib/cn";

export function ChartCard({ title, subtitle, actions, children, className }: {
  title: string; subtitle?: string; actions?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <Card className={cn("p-4 md:p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-[14px] font-black text-ink-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[11.5px] font-bold text-ink-400">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </Card>
  );
}
