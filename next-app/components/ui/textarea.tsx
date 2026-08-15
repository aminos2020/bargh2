"use client";
import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string | null;
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea({ error, className, ...rest }, ref) {
  return (
    <div className="w-full">
      <textarea
        ref={ref}
        className={cn(
          "min-h-[110px] w-full rounded-input border bg-white p-4 text-[14px] font-medium leading-7 text-ink-900 outline-none transition-all",
          "placeholder:text-ink-300 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10",
          error ? "border-bad-600/60" : "border-line",
          className
        )}
        {...rest}
      />
      {error && <p className="anim-fade-in mt-1.5 text-[12px] font-bold text-bad-600">{error}</p>}
    </div>
  );
});
