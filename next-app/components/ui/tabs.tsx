"use client";
import { cn } from "@/lib/cn";
import { faDigits } from "@/lib/amount";

interface Tab { key: string; label: string; count?: number; }

export function Tabs({ value, onChange, tabs, className }: { value: string; onChange: (k: string) => void; tabs: Tab[]; className?: string }) {
  return (
    <div className={cn("no-scrollbar flex w-full gap-1.5 overflow-x-auto", className)}>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={cn(
            "press h-9 shrink-0 rounded-full px-4 text-[12px] font-black transition-all",
            value === t.key ? "bg-ink-900 text-white shadow-sm" : "border border-line bg-white text-ink-500 hover:border-primary-300 hover:text-primary-700"
          )}
        >
          {t.label}
          {typeof t.count === "number" && <span className={cn("tnum ms-1.5 rounded-full px-1.5 py-0.5 text-[10.5px]", value === t.key ? "bg-white/20" : "bg-slate-100")}>{faDigits(t.count)}</span>}
        </button>
      ))}
    </div>
  );
}
