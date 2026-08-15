"use client";
import { cn } from "@/lib/cn";
import { Check } from "lucide-react";

interface Option { value: string; label: string; }
interface Props {
  values: string[];
  onChange: (v: string[]) => void;
  options: Option[];
  placeholder?: string;
}

export function MultiSelect({ values, onChange, options, placeholder }: Props) {
  const toggle = (v: string) =>
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.length === 0 && <p className="text-[12.5px] font-bold text-ink-300">{placeholder || "گزینه‌ای وجود ندارد."}</p>}
      {options.map((o) => {
        const on = values.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            className={cn(
              "press inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-[12.5px] font-bold transition-all",
              on ? "border-primary-600 bg-primary-600 text-white" : "border-line bg-white text-ink-500 hover:border-primary-300"
            )}
          >
            {on && <Check size={14} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
