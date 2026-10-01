"use client";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder, className }: Props) {
  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center text-ink-300">
        <Search size={18} />
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "جستجو..."}
        className="h-11 w-full rounded-input border border-line bg-white ps-10 pe-4 text-[13.5px] font-medium text-ink-900 outline-none transition-all placeholder:text-ink-300 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10"
      />
    </div>
  );
}
