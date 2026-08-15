"use client";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

export function QuickActions({ actions, className }: { actions: { label: string; icon: LucideIcon; href: string; tone?: "dark" | "primary" }[]; className?: string }) {
  const router = useRouter();
  return (
    <div className={cn("flex flex-wrap gap-2.5", className)}>
      {actions.map((a) => (
        <button
          key={a.href}
          onClick={() => router.push(a.href)}
          className={cn(
            "press flex items-center gap-2.5 rounded-input border px-4 py-3 text-[13px] font-black transition-all",
            a.tone === "dark"
              ? "border-ink-900 bg-ink-900 text-white hover:bg-ink-800"
              : "border-line bg-white text-ink-700 hover:border-primary-300 hover:text-primary-700"
          )}
        >
          <a.icon size={17} />
          {a.label}
        </button>
      ))}
    </div>
  );
}
