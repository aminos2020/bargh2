"use client";
import { useEffect } from "react";
import { useOfflineStore, watchNetwork } from "@/stores/offline-store";

export function useOffline() {
  const { online } = useOfflineStore();
  useEffect(() => watchNetwork(), []);
  return { online, offline: !online };
}
