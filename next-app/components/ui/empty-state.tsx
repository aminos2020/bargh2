"use client";
import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="anim-fade-in flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-slate-100 text-ink-300">
        {icon || <Inbox size={28} />}
      </span>
      <p className="text-[14.5px] font-black text-ink-800">{title}</p>
      {body && <p className="mt-1.5 max-w-xs text-[12.5px] font-bold leading-6 text-ink-400">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
