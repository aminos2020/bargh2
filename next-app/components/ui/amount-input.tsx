"use client";
import { Input } from "./input";
import { enDigits } from "@/lib/mobile";
import { formatNumber } from "@/lib/amount";

interface Props {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  error?: string | null;
}

/** ورود مبلغ به ریال با جداکننده‌ی هزارگان زنده */
export function AmountInput({ value, onChange, placeholder, error }: Props) {
  return (
    <div>
      <Input
        dir="ltr"
        inputMode="numeric"
        value={value > 0 ? formatNumber(value) : ""}
        placeholder={placeholder || "مبلغ به ریال"}
        onChange={(e) => {
          const digits = enDigits(e.target.value).replace(/[^\d]/g, "").slice(0, 15);
          onChange(digits ? Number(digits) : 0);
        }}
        error={error}
      />
      <p className="mt-1 text-[10.5px] font-bold text-ink-300">مبلغ به ریال وارد شود.</p>
    </div>
  );
}
