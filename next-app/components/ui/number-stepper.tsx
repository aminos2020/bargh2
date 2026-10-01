"use client";
import { Minus, Plus } from "lucide-react";
import { faDigits } from "@/lib/amount";
import { cn } from "@/lib/cn";

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  large?: boolean;
}

/** Stepper بزرگ و مناسب لمس برای شرایط میدانی */
export function NumberStepper({ value, onChange, min = 0, step = 1, large }: Props) {
  const btn = cn(
    "press flex items-center justify-center rounded-[12px] bg-primary-600 text-white transition-colors hover:bg-primary-700",
    large ? "h-12 w-12" : "h-10 w-10"
  );
  return (
    <div className="inline-flex items-center gap-2.5">
      <button type="button" className={btn} aria-label="کاهش" onClick={() => onChange(Math.max(min, value - step))}>
        <Minus size={large ? 20 : 17} />
      </button>
      <input
        inputMode="decimal"
        dir="ltr"
        value={faDigits(String(value))}
        onChange={(e) => {
          const n = Number(e.target.value.replace(/[۰-۹]/g, (c) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(c))).replace(/[^\d.]/g, ""));
          if (!Number.isNaN(n)) onChange(Math.max(min, n));
        }}
        className={cn(
          "tnum w-16 rounded-[12px] border border-line bg-white text-center font-black text-ink-900 outline-none focus:border-primary-400",
          large ? "h-12 text-[17px]" : "h-10 text-[14px]"
        )}
      />
      <button type="button" className={btn} aria-label="افزایش" onClick={() => onChange(value + step)}>
        <Plus size={large ? 20 : 17} />
      </button>
    </div>
  );
}
