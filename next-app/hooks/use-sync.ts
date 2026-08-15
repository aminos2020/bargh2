"use client";
import { useEffect } from "react";
import { useSyncStore, flushSyncQueue } from "@/stores/sync-store";
import { useOfflineStore } from "@/stores/offline-store";

/**
 * همگام‌سازی خودکار: به‌محض برقراری اتصال، صف ارسال می‌شود.
 */
export function useSync() {
  const queue = useSyncStore((s) => s.queue);
  const syncing = useSyncStore((s) => s.syncing);
  const online = useOfflineStore((s) => s.online);

  useEffect(() => {
    useSyncStore.getState().load();
  }, []);

  useEffect(() => {
    if (online && queue.length > 0 && !syncing) {
      void flushSyncQueue();
    }
  }, [online, queue.length, syncing]);

  return { queue, syncing, flush: flushSyncQueue };
}
