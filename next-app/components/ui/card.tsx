"use client";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface Props extends HTMLAttributes<HTMLDivElement> {
  pad?: boolean;
  hover?: boolean;
}

export function Card({ pad = true, hover, className, children, ...rest }: Props) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        pad && "p-4 md:p-5",
        hover && "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_12px_30px_rgba(37,99,235,0.10)]",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
