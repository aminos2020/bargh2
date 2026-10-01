"use client";
import { create } from "zustand";
import type { SyncOp, SyncResultItem } from "@/types";

const QUEUE_KEY = "tavanban_sync_queue_v1";

interface SyncState {
  queue: SyncOp[];
  syncing: boolean;
  lastResults: SyncResultItem[];
  load: () => void;
  enqueue: (op: SyncOp) => void;
  remove: (idempotencyKey: string) => void;
  clearSynced: () => void;
  setSyncing: (v: boolean) => void;
  setResults: (r: SyncResultItem[]) => void;
}

function persist(queue: SyncOp[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch { /* quota */ }
}

export const useSyncStore = create<SyncState>((set, get) => ({
  queue: [],
  syncing: false,
  lastResults: [],
  load: () => {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      set({ queue: raw ? (JSON.parse(raw) as SyncOp[]) : [] });
    } catch { set({ queue: [] }); }
  },
  enqueue: (op) => {
    const queue = [...get().queue.filter((q) => q.idempotencyKey !== op.idempotencyKey), op];
    persist(queue);
    set({ queue });
  },
  remove: (idempotencyKey) => {
    const queue = get().queue.filter((q) => q.idempotencyKey !== idempotencyKey);
    persist(queue);
    set({ queue });
  },
  clearSynced: () => {
    const queue: SyncOp[] = [];
    persist(queue);
    set({ queue });
  },
  setSyncing: (syncing) => set({ syncing }),
  setResults: (lastResults) => set({ lastResults }),
}));

/** ارسال صف به سرور با retry و backoff — بعد از برقراری اتصال */
export async function flushSyncQueue(): Promise<SyncResultItem[]> {
  const st = useSyncStore.getState();
  if (st.queue.length === 0 || st.syncing) return [];
  st.setSyncing(true);
  let results: SyncResultItem[] = [];
  let delay = 500;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch("/api/v1/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ops: useSyncStore.getState().queue }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "خطا در همگام‌سازی");
      results = json.data.results as SyncResultItem[];
      for (const r of results) if (r.ok) useSyncStore.getState().remove(r.idempotencyKey);
      break;
    } catch (e) {
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
      if (attempt === 2) results = useSyncStore.getState().queue.map((q) => ({ idempotencyKey: q.idempotencyKey, ok: false, message: e instanceof Error ? e.message : "خطا" }));
    }
  }
  useSyncStore.getState().setSyncing(false);
  useSyncStore.getState().setResults(results);
  return results;
}
