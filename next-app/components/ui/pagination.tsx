"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { faDigits } from "@/lib/amount";

export function Pagination({ page, hasNextPage, total, onPage }: { page: number; hasNextPage: boolean; total: number; onPage: (p: number) => void }) {
  if (total === 0) return null;
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="tnum text-[12px] font-bold text-ink-400">{faDigits(total)} مورد</p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)} icon={<ChevronRight size={15} />}>قبلی</Button>
        <span className="tnum text-[12.5px] font-black text-ink-700">صفحه {faDigits(page)}</span>
        <Button variant="outline" size="sm" disabled={!hasNextPage} onClick={() => onPage(page + 1)} icon={<ChevronLeft size={15} />}>بعدی</Button>
      </div>
    </div>
  );
}
