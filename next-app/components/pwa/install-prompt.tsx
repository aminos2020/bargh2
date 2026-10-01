"use client";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BIPEvent extends Event { prompt: () => Promise<void>; }

/** پیشنهاد نصب PWA (Add to Home Screen) */
export function InstallPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!evt || hidden) return null;
  return (
    <div className="anim-fade-up fixed inset-x-4 bottom-24 z-40 mx-auto flex max-w-sm items-center gap-3 rounded-card border border-line bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.2)] lg:bottom-6">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-primary-50 text-primary-600"><Download size={19} /></span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-black text-ink-900">نصب روی دستگاه</p>
        <p className="text-[11px] font-bold text-ink-400">دسترسی سریع‌تر، مثل اپلیکیشن</p>
      </div>
      <Button size="sm" onClick={async () => { await evt.prompt(); setHidden(true); }}>نصب</Button>
      <button className="text-[11px] font-black text-ink-300" onClick={() => setHidden(true)}>بعداً</button>
    </div>
  );
}
