"use client";
import { RefreshCw, WifiOff } from "lucide-react";
import { useSyncStore } from "@/stores/sync-store";
import { useOffline } from "@/hooks/use-offline";
import { cn } from "@/lib/cn";
import { faDigits } from "@/lib/amount";

export function SyncStatusIndicator({ className }: { className?: string }) {
  const queue = useSyncStore((s) => s.queue);
  const syncing = useSyncStore((s) => s.syncing);
  const { online } = useOffline();
  const pending = queue.length;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-black",
        pending > 0 ? "bg-amber-50 text-warn-700" : online ? "bg-ok-50 text-ok-700" : "bg-amber-50 text-warn-700",
        className
      )}
    >
      {pending > 0 ? (
        <>
          <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
          {faDigits(pending)} مورد در صف ارسال
        </>
      ) : (
        <>
          <WifiOff size={13} className={online ? "hidden" : ""} />
          {online ? "همگام" : "آفلاین"}
        </>
      )}
    </span>
  );
}
