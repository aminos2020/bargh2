"use client";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

type Tone = "primary" | "ok" | "warn" | "bad" | "cyan" | "teal" | "orange" | "dark";

const TONES: Record<Tone, string> = {
  primary: "bg-primary-50 text-primary-600",
  ok: "bg-ok-50 text-ok-600",
  warn: "bg-warn-50 text-warn-600",
  bad: "bg-bad-50 text-bad-600",
  cyan: "bg-cyan-50 text-cyan-600",
  teal: "bg-teal-50 text-teal-600",
  orange: "bg-orange-50 text-orange-600",
  dark: "bg-ink-900 text-white",
};

export function KpiCard({ label, value, icon, tone = "primary", sub, onClick, delay = 0 }: {
  label: string; value: ReactNode; icon: ReactNode; tone?: Tone; sub?: string; onClick?: () => void; delay?: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "press group w-full rounded-card border border-line bg-white p-4 text-start shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        onClick && "transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_12px_30px_rgba(37,99,235,0.10)]"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11.5px] font-black text-ink-400">{label}</p>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-[11px]", TONES[tone])}>{icon}</span>
      </div>
      <p className="tnum mt-2.5 text-[22px] font-black leading-none text-ink-900">{value}</p>
      {sub && <p className="mt-1.5 text-[10.5px] font-bold text-ink-300">{sub}</p>}
    </motion.button>
  );
}
