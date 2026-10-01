"use client";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export interface Crumb { label: string; href?: string; }

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="hidden items-center gap-1 text-[12px] font-bold text-ink-400 md:flex" aria-label="مسیر">
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronLeft size={13} className="text-ink-300" />}
          {c.href ? (
            <Link href={c.href} className="transition-colors hover:text-primary-600">{c.label}</Link>
          ) : (
            <span className="text-ink-700">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
