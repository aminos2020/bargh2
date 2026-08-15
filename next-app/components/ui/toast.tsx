"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

type Kind = "success" | "error" | "warn" | "info";
type ToastFn = (message: string, kind?: Kind) => void;

const ToastContext = createContext<ToastFn>(() => {});
export const useToast = () => useContext(ToastContext);

interface Item { id: number; message: string; kind: Kind; }

const ICONS: Record<Kind, ReactNode> = {
  success: <CheckCircle2 size={18} className="text-ok-600" />,
  error: <XCircle size={18} className="text-bad-600" />,
  warn: <AlertTriangle size={18} className="text-warn-600" />,
  info: <Info size={18} className="text-primary-600" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);

  const push = useCallback<ToastFn>((message, kind = "info") => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev.slice(-3), { id, message, kind }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3800);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom))] z-[80] flex flex-col items-center gap-2 px-4 lg:bottom-6">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-input border bg-white px-4 py-3 shadow-[0_14px_40px_rgba(15,23,42,0.14)]",
                t.kind === "success" && "border-green-200",
                t.kind === "error" && "border-red-200",
                t.kind === "warn" && "border-amber-200",
                t.kind === "info" && "border-primary-200"
              )}
            >
              {ICONS[t.kind]}
              <p className="text-[13px] font-bold leading-6 text-ink-800">{t.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
