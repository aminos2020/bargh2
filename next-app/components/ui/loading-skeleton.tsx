"use client";
import { cn } from "@/lib/cn";

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-card border border-line bg-white p-4">
          <div className="flex items-center gap-3">
            <LoadingSkeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton className="h-3.5 w-1/3" />
              <LoadingSkeleton className="h-3 w-2/3" />
            </div>
            <LoadingSkeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function KpiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingSkeleton key={i} className="h-[104px] rounded-card" />
      ))}
    </div>
  );
}
