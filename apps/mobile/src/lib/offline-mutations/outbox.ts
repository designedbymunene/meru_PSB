import { getNormalizedApiError, type NormalizedApiError } from "@/lib/api/client";
import { hasRetryBudget, isRetryableApiError } from "@/lib/retry-policy";
import { safeAsyncStorage } from "../storage";
import type {
  EnqueueOfflineMutationInput,
  OfflineMutationEntry,
  OfflineMutationErrorSnapshot,
  OfflineMutationStatus,
} from "./types";

export const OFFLINE_MUTATION_OUTBOX_STORAGE_KEY = "meru-county-psb-offline-mutation-outbox";
const OFFLINE_MUTATION_OUTBOX_SCHEMA_VERSION = 1;

interface PersistedOfflineMutationOutbox {
  schemaVersion: number;
  entries: OfflineMutationEntry[];
}

let cache: OfflineMutationEntry[] | null = null;
let operationQueue: Promise<void> = Promise.resolve();

function stableStringify(value: unknown): string {
  if (typeof value === "undefined") {
    return "undefined";
  }

  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const objectValue = value as Record<string, unknown>;
  const keys = Object.keys(objectValue).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(objectValue[key])}`).join(",")}}`;
}

function createDeterministicHash(input: string): string {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function toErrorSnapshot(error: unknown): OfflineMutationErrorSnapshot {
  const normalized = getNormalizedApiError(error);

  return {
    ...normalized,
    attemptedAt: new Date().toISOString(),
  };
}

function buildRequestKey(input: Pick<EnqueueOfflineMutationInput, "method" | "path" | "body" | "headers" | "dedupeKey">): string {
  const signature = {
    method: input.method.toUpperCase(),
    path: input.path,
    body: input.body,
    headers: input.headers,
    dedupeKey: input.dedupeKey ?? null,
  };

  return createDeterministicHash(stableStringify(signature));
}

async function loadFromStorage(): Promise<OfflineMutationEntry[]> {
  if (cache) {
    return cache;
  }

  const raw = await safeAsyncStorage.getItem(OFFLINE_MUTATION_OUTBOX_STORAGE_KEY);

  if (!raw) {
    cache = [];
    return cache;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedOfflineMutationOutbox;

    if (
      parsed.schemaVersion !== OFFLINE_MUTATION_OUTBOX_SCHEMA_VERSION ||
      !Array.isArray(parsed.entries)
    ) {
      cache = [];
      await safeAsyncStorage.removeItem(OFFLINE_MUTATION_OUTBOX_STORAGE_KEY);
      return cache;
    }

    let hasNormalizedProcessingEntries = false;
    const normalizedEntries = parsed.entries.map((entry) => {
      if (entry.status !== "processing") {
        return entry;
      }

      hasNormalizedProcessingEntries = true;

      return {
        ...entry,
        status: "queued" as const,
        updatedAt: new Date().toISOString(),
      };
    });

    cache = normalizedEntries;

    if (hasNormalizedProcessingEntries) {
      await persistToStorage(normalizedEntries);
    }

    return cache;
  } catch (error) {
    console.error("Failed to parse offline mutation outbox. Clearing storage.", error);
    cache = [];
    await safeAsyncStorage.removeItem(OFFLINE_MUTATION_OUTBOX_STORAGE_KEY);
    return cache;
  }
}

export type OfflineMutationListener = (entries: OfflineMutationEntry[]) => void;
const listeners = new Set<OfflineMutationListener>();

export function subscribeToOfflineMutations(listener: OfflineMutationListener): () => void {
  listeners.add(listener);
  loadFromStorage().then(listener);
  return () => listeners.delete(listener);
}

function notifyListeners(entries: OfflineMutationEntry[]) {
  listeners.forEach((listener) => listener([...entries]));
}

async function persistToStorage(entries: OfflineMutationEntry[]) {
  const payload: PersistedOfflineMutationOutbox = {
    schemaVersion: OFFLINE_MUTATION_OUTBOX_SCHEMA_VERSION,
    entries,
  };

  await safeAsyncStorage.setItem(OFFLINE_MUTATION_OUTBOX_STORAGE_KEY, JSON.stringify(payload));
  notifyListeners(entries);
}

async function withOperationLock<T>(operation: () => Promise<T>): Promise<T> {
  const previous = operationQueue;
  let release: (() => void) | undefined;

  operationQueue = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;

  try {
    return await operation();
  } finally {
    release?.();
  }
}

async function updateEntry(
  id: string,
  updater: (entry: OfflineMutationEntry) => OfflineMutationEntry,
): Promise<OfflineMutationEntry | null> {
  return withOperationLock(async () => {
    const entries = await loadFromStorage();
    const index = entries.findIndex((entry) => entry.id === id);

    if (index < 0) {
      return null;
    }

    const updatedEntry = updater(entries[index]);
    entries[index] = updatedEntry;
    await persistToStorage(entries);
    return updatedEntry;
  });
}

export async function listOfflineMutations(): Promise<OfflineMutationEntry[]> {
  const entries = await loadFromStorage();
  return [...entries].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export async function enqueueOfflineMutation(input: EnqueueOfflineMutationInput): Promise<OfflineMutationEntry> {
  return withOperationLock(async () => {
    const entries = await loadFromStorage();
    const requestKey = buildRequestKey(input);

    if (!input.allowDuplicate) {
      const existing = entries.find(
        (entry) => entry.requestKey === requestKey && entry.status !== "succeeded",
      );

      if (existing) {
        return existing;
      }
    }

    const now = new Date().toISOString();
    const entry: OfflineMutationEntry = {
      id: `${requestKey}-${Date.now().toString(36)}`,
      requestKey,
      method: input.method,
      path: input.path,
      body: input.body,
      headers: input.headers,
      createdAt: now,
      updatedAt: now,
      status: "queued",
      retryCount: 0,
    };

    entries.push(entry);
    await persistToStorage(entries);
    return entry;
  });
}

export async function markOfflineMutationAsProcessing(id: string) {
  return updateEntry(id, (entry) => ({
    ...entry,
    status: "processing",
    updatedAt: new Date().toISOString(),
  }));
}

export async function markOfflineMutationAsSucceeded(id: string) {
  return updateEntry(id, (entry) => ({
    ...entry,
    status: "succeeded",
    updatedAt: new Date().toISOString(),
    lastError: undefined,
  }));
}

export async function markOfflineMutationAsQueued(
  id: string,
  options?: {
    retryCount?: number;
    error?: unknown;
  },
) {
  return updateEntry(id, (entry) => ({
    ...entry,
    status: "queued",
    retryCount: options?.retryCount ?? entry.retryCount,
    updatedAt: new Date().toISOString(),
    lastError: options?.error ? toErrorSnapshot(options.error) : entry.lastError,
  }));
}

export async function markOfflineMutationAsFailed(
  id: string,
  retryCount: number,
  error: unknown,
) {
  return updateEntry(id, (entry) => ({
    ...entry,
    status: "failed",
    retryCount,
    updatedAt: new Date().toISOString(),
    lastError: toErrorSnapshot(error),
  }));
}

export async function removeOfflineMutation(id: string): Promise<boolean> {
  return withOperationLock(async () => {
    const entries = await loadFromStorage();
    const filteredEntries = entries.filter((entry) => entry.id !== id);

    if (filteredEntries.length === entries.length) {
      return false;
    }

    cache = filteredEntries;
    await persistToStorage(filteredEntries);
    return true;
  });
}

export async function clearSucceededOfflineMutations(): Promise<number> {
  return withOperationLock(async () => {
    const entries = await loadFromStorage();
    const remainingEntries = entries.filter((entry) => entry.status !== "succeeded");
    const removedCount = entries.length - remainingEntries.length;

    if (removedCount === 0) {
      return 0;
    }

    cache = remainingEntries;
    await persistToStorage(remainingEntries);
    return removedCount;
  });
}

export async function annotateOfflineMutationError(id: string, error: unknown, status?: OfflineMutationStatus) {
  return updateEntry(id, (entry) => ({
    ...entry,
    status: status ?? entry.status,
    updatedAt: new Date().toISOString(),
    lastError: toErrorSnapshot(error),
  }));
}

export function shouldRetryReplay(error: NormalizedApiError, retryCount: number): boolean {
  return isRetryableApiError(error) && hasRetryBudget(retryCount);
}
