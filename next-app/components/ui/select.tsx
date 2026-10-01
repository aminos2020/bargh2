"use client";
import { cn } from "@/lib/cn";
import { ChevronDown } from "lucide-react";

interface Option { value: string; label: string; }
interface Props {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  error?: string | null;
}

export function Select({ value, onChange, options, placeholder, className, error }: Props) {
  return (
    <div className="w-full">
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-[52px] w-full appearance-none rounded-input border bg-white px-4 pe-10 text-[14px] font-medium text-ink-900 outline-none transition-all",
            "focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10",
            !value && "text-ink-300",
            error ? "border-bad-600/60" : "border-line",
            className
          )}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value} className="text-ink-900">{o.label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-ink-300">
          <ChevronDown size={18} />
        </span>
      </div>
      {error && <p className="anim-fade-in mt-1.5 text-[12px] font-bold text-bad-600">{error}</p>}
    </div>
  );
}
