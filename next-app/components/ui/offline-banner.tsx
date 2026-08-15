"use client";
import { AnimatePresence, motion } from "framer-motion";
import { CloudOff } from "lucide-react";
import { useOffline } from "@/hooks/use-offline";

export function OfflineBanner() {
  const { offline } = useOffline();
  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-center gap-2 bg-warn-600 px-4 py-2 text-white">
            <CloudOff size={15} />
            <p className="text-[12px] font-black">اتصال اینترنت برقرار نیست — تغییرات ذخیره و بعداً ارسال می‌شوند.</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
