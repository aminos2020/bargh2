"use client";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  error?: string | null;
  ltr?: boolean;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input({ icon, error, ltr, className, ...rest }, ref) {
  return (
    <div className="w-full">
      <div className="relative">
        {icon && <span className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center text-ink-300">{icon}</span>}
        <input
          ref={ref}
          dir={ltr ? "ltr" : undefined}
          className={cn(
            "h-[52px] w-full rounded-input border bg-white px-4 text-[14px] font-medium text-ink-900 outline-none transition-all",
            "placeholder:text-ink-300 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10",
            icon && "ps-11",
            ltr && "text-left",
            error ? "border-bad-600/60" : "border-line",
            className
          )}
          {...rest}
        />
      </div>
      {error && <p className="anim-fade-in mt-1.5 text-[12px] font-bold text-bad-600">{error}</p>}
    </div>
  );
});
