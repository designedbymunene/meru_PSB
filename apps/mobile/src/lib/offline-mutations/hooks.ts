import { useEffect, useState, useCallback } from "react";
import { 
  subscribeToOfflineMutations, 
  removeOfflineMutation, 
  clearSucceededOfflineMutations,
  markOfflineMutationAsQueued,
  listOfflineMutations
} from "./outbox";
import { replayOfflineMutationOutbox } from "./replay-worker";
import type { OfflineMutationEntry } from "./types";

export interface OfflineStatus {
  pendingCount: number;
  isSyncing: boolean;
  failedCount: number;
  totalCount: number;
  hasOfflineChanges: boolean;
  entries: OfflineMutationEntry[];
  retryFailed: () => Promise<void>;
  clearCompleted: () => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  sync: () => Promise<void>;
}

export function useOfflineMutationStatus(): OfflineStatus {
  const [entries, setEntries] = useState<OfflineMutationEntry[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    return subscribeToOfflineMutations((newEntries) => {
      setEntries(newEntries);
      setIsSyncing(newEntries.some((e) => e.status === "processing"));
    });
  }, []);

  const retryFailed = useCallback(async () => {
    const failedEntries = entries.filter(e => e.status === 'failed');
    await Promise.all(failedEntries.map(e => markOfflineMutationAsQueued(e.id)));
    void replayOfflineMutationOutbox();
  }, [entries]);

  const clearCompleted = useCallback(async () => {
    await clearSucceededOfflineMutations();
  }, []);

  const removeEntry = useCallback(async (id: string) => {
    await removeOfflineMutation(id);
  }, []);

  const sync = useCallback(async () => {
    await replayOfflineMutationOutbox();
  }, []);

  const pendingCount = entries.filter((e) => e.status === "queued").length;
  const failedCount = entries.filter((e) => e.status === "failed").length;
  const totalCount = entries.length;

  return {
    pendingCount,
    isSyncing,
    failedCount,
    totalCount,
    hasOfflineChanges: totalCount > 0,
    entries,
    retryFailed,
    clearCompleted,
    removeEntry,
    sync,
  };
}
