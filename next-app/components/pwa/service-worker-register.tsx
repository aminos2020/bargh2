"use client";
import { useEffect } from "react";

/** ثبت service worker (فایل عمومی /sw.js) */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => { /* offline-first بدون SW هم کار می‌کند */ });
    }
  }, []);
  return null;
}
