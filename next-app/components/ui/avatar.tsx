"use client";
import { cn } from "@/lib/cn";

const PALETTE = [
  "bg-primary-100 text-primary-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-violet-100 text-violet-700",
];

export function Avatar({ name, size = 40, className }: { name?: string; size?: number; className?: string }) {
  const label = name || "؟";
  const idx = label.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % PALETTE.length;
  const initials = label.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("‌");
  return (
    <span
      className={cn("inline-flex shrink-0 select-none items-center justify-center rounded-full font-black", PALETTE[idx], className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}
