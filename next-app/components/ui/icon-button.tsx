"use client";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: number;
  children: ReactNode;
}

export function IconButton({ label, size = 40, className, children, ...rest }: Props) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "press inline-flex shrink-0 items-center justify-center rounded-[12px] border border-line bg-white text-ink-500",
        "transition-colors hover:border-primary-300 hover:text-primary-600",
        className
      )}
      style={{ width: size, height: size }}
      {...rest}
    >
      {children}
    </button>
  );
}
