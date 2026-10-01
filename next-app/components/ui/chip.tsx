"use client";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Props {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

export function Chip({ active, onClick, children, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "press inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[12px] font-black transition-all",
        active ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white text-ink-500 hover:border-primary-300 hover:text-primary-700",
        className
      )}
    >
      {children}
    </button>
  );
}
