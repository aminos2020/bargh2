"use client";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "soft" | "outline" | "danger" | "dangerSoft" | "success" | "warnSoft" | "ghost" | "dark";
type Size = "sm" | "md" | "lg" | "xl";

const variants: Record<Variant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-600/20",
  soft: "bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-100",
  outline: "bg-white text-ink-700 border border-line hover:border-primary-300 hover:text-primary-700",
  danger: "bg-bad-600 text-white hover:bg-bad-700",
  dangerSoft: "bg-bad-50 text-bad-700 hover:bg-red-100 border border-red-100",
  success: "bg-ok-600 text-white hover:bg-ok-700",
  warnSoft: "bg-warn-50 text-warn-700 hover:bg-amber-100 border border-amber-100",
  ghost: "bg-transparent text-ink-500 hover:bg-slate-100",
  dark: "bg-ink-900 text-white hover:bg-ink-800",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[12px] gap-1.5 rounded-[10px]",
  md: "h-11 px-5 text-[13.5px] gap-2 rounded-input",
  lg: "h-[52px] px-6 text-[14px] gap-2 rounded-input",
  xl: "h-14 px-7 text-[15px] gap-2.5 rounded-[16px]",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  full?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", loading, full, icon, className, children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "press inline-flex select-none items-center justify-center font-bold transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant], sizes[size], full && "w-full", className
      )}
      {...rest}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : icon}
      {children}
    </button>
  );
});
