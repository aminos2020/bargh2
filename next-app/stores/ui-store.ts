"use client";
import { create } from "zustand";

interface UiState {
  mobileNavOpen: boolean;
  notifOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;
  setNotifOpen: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  mobileNavOpen: false,
  notifOpen: false,
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  setNotifOpen: (notifOpen) => set({ notifOpen }),
}));
