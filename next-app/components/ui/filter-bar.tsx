"use client";
import type { ReactNode } from "react";

/** نوار فیلتر بالای جدول‌ها در دسکتاپ */
export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-card border border-line bg-white p-3">
      {children}
    </div>
  );
}
