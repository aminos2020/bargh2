"use client";
import { cn } from "@/lib/cn";

interface Option { value: string; label: string; }

export function SegmentedControl({ value, onChange, options, className }: { value: string; onChange: (v: string) => void; options: Option[]; className?: string }) {
  return (
    <div className={cn("flex rounded-input border border-line bg-slate-100 p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-10 flex-1 rounded-[11px] text-[12.5px] font-black transition-all duration-200",
            value === o.value ? "bg-white text-primary-700 shadow-sm" : "text-ink-400 hover:text-ink-700"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
