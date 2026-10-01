"use client";
import { create } from "zustand";
import type { PublicUser } from "@/types";

interface AuthState {
  me: PublicUser | null;
  ready: boolean;
  setMe: (u: PublicUser | null) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  me: null,
  ready: false,
  setMe: (me) => set({ me, ready: true }),
  signOut: () => set({ me: null }),
}));
