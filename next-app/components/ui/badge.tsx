"use client";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Badge({ className, children, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-black leading-none",
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
