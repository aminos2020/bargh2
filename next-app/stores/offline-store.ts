"use client";
import { create } from "zustand";

/** وضعیت اتصال و شمارنده‌های ذخیره‌ی محلی */
interface OfflineState {
  online: boolean;
  draftCount: number;
  pendingAttachmentCount: number;
  setOnline: (v: boolean) => void;
  setDraftCount: (n: number) => void;
  setPendingAttachmentCount: (n: number) => void;
}

export const useOfflineStore = create<OfflineState>((set) => ({
  online: typeof navigator !== "undefined" ? navigator.onLine : true,
  draftCount: 0,
  pendingAttachmentCount: 0,
  setOnline: (online) => set({ online }),
  setDraftCount: (draftCount) => set({ draftCount }),
  setPendingAttachmentCount: (pendingAttachmentCount) => set({ pendingAttachmentCount }),
}));

export function watchNetwork() {
  if (typeof window === "undefined") return () => {};
  const on = () => useOfflineStore.getState().setOnline(true);
  const off = () => useOfflineStore.getState().setOnline(false);
  window.addEventListener("online", on);
  window.addEventListener("offline", off);
  return () => {
    window.removeEventListener("online", on);
    window.removeEventListener("offline", off);
  };
}
