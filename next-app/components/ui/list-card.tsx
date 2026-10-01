"use client";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Props {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  onClick?: () => void;
  leading?: ReactNode;
  className?: string;
}

/** کارت لیست برای موبایل — معادل ردیف جدول در دسکتاپ */
export function ListCard({ title, subtitle, meta, onClick, leading, className }: Props) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-card border border-line bg-white p-4 text-start shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        onClick && "press transition-all hover:border-primary-200",
        className
      )}
    >
      {leading}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-black text-ink-900">{title}</span>
        {subtitle && <span className="mt-0.5 block truncate text-[12px] font-bold text-ink-400">{subtitle}</span>}
      </span>
      {meta && <span className="shrink-0 text-left">{meta}</span>}
    </Comp>
  );
}
