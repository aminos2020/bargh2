"use client";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface Column<T> {
  key: string;
  title: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

/** جدول کامل دسکتاپ — در موبایل از ListCard استفاده می‌شود */
export function DataTable<T extends { _id: string }>({ columns, rows, onRowClick, className }: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("hidden overflow-hidden rounded-card border border-line bg-white md:block", className)}>
      <table className="w-full text-start">
        <thead>
          <tr className="border-b border-line bg-slate-50/70">
            {columns.map((c) => (
              <th key={c.key} className={cn("px-4 py-3 text-start text-[11.5px] font-black text-ink-400", c.className)}>{c.title}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line/70">
          {rows.map((r) => (
            <tr
              key={r._id}
              onClick={() => onRowClick?.(r)}
              className={cn("transition-colors", onRowClick && "cursor-pointer hover:bg-primary-50/40")}
            >
              {columns.map((c) => (
                <td key={c.key} className={cn("px-4 py-3.5 text-[13px] font-medium text-ink-800", c.className)}>
                  {c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
