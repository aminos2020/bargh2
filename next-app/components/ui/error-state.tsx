"use client";
import { CloudOff, TriangleAlert } from "lucide-react";
import { Button } from "./button";

export function ErrorState({ message, onRetry, offline }: { message?: string; onRetry?: () => void; offline?: boolean }) {
  return (
    <div className="anim-fade-in flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-bad-50 text-bad-600">
        {offline ? <CloudOff size={28} /> : <TriangleAlert size={28} />}
      </span>
      <p className="text-[14.5px] font-black text-ink-800">{offline ? "اتصال برقرار نیست" : "خطایی رخ داده است"}</p>
      <p className="mt-1.5 max-w-xs text-[12.5px] font-bold leading-6 text-ink-400">
        {message || (offline ? "داده‌ها پس از برقراری اتصال به‌روزرسانی می‌شوند." : "دوباره تلاش کنید؛ اگر مشکل ادامه داشت با پشتیبانی تماس بگیرید.")}
      </p>
      {onRetry && <Button variant="soft" className="mt-5" onClick={onRetry}>تلاش مجدد</Button>}
    </div>
  );
}
