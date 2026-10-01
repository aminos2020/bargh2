"use client";
import { useState } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { isValidJalaliKey, jalaliKey, toJalali } from "@/lib/date";

interface Props {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

/** بازه‌ی تاریخ شمسی — ورودی دستی با اعتبارسنجی + میان‌برهای آماده */
export function DateRangePickerJalali({ from, to, onChange }: Props) {
  const [f, setF] = useState(from);
  const [t, setT] = useState(to);

  const apply = () => {
    if (!isValidJalaliKey(f) || !isValidJalaliKey(t)) return;
    onChange(f, t);
  };

  const preset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    const fk = jalaliKey(toJalali(start));
    const tk = jalaliKey(toJalali(end));
    setF(fk); setT(tk);
    onChange(fk, tk);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-36">
        <Input dir="ltr" value={f} onChange={(e) => setF(e.target.value)} placeholder="1404-01-01" error={!isValidJalaliKey(f) && f ? "نامعتبر" : null} />
      </div>
      <span className="text-[12px] font-black text-ink-300">تا</span>
      <div className="w-36">
        <Input dir="ltr" value={t} onChange={(e) => setT(e.target.value)} placeholder="1404-01-31" error={!isValidJalaliKey(t) && t ? "نامعتبر" : null} />
      </div>
      <Button variant="soft" size="md" onClick={apply}>اعمال</Button>
      <div className="flex gap-1.5">
        <Button variant="ghost" size="sm" onClick={() => preset(7)}>۷ روز</Button>
        <Button variant="ghost" size="sm" onClick={() => preset(14)}>۱۴ روز</Button>
        <Button variant="ghost" size="sm" onClick={() => preset(30)}>۳۰ روز</Button>
      </div>
    </div>
  );
}
