import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import {
  persistQueryClientRestore,
  persistQueryClientSubscribe,
} from "@tanstack/react-query-persist-client";
import { queryClient } from "./client";
import { safeAsyncStorage } from "../storage";

const DAY = 24 * 60 * 60 * 1000;

export const QUERY_CACHE_STORAGE_KEY = "meru-county-psb-query-cache";
export const QUERY_CACHE_SCHEMA_VERSION = 1;
export const QUERY_CACHE_BUSTER = `schema-v${QUERY_CACHE_SCHEMA_VERSION}`;

const queryPersister = createAsyncStoragePersister({
  storage: safeAsyncStorage,
  key: QUERY_CACHE_STORAGE_KEY,
});

const queryPersistenceConfig = {
  queryClient,
  persister: queryPersister,
  maxAge: DAY,
  buster: QUERY_CACHE_BUSTER,
} as const;

export async function restoreQueryCache() {
  try {
    await persistQueryClientRestore(queryPersistenceConfig);
  } catch {
    // If restoration fails, we try to clear the client cache
    // We catch errors here too in case removeClient also fails due to storage issues
    try {
      await queryPersister.removeClient();
    } catch (e) {
      console.warn("Failed to clear query cache:", e);
    }
  }
}

export function subscribeToQueryCachePersistence() {
  return persistQueryClientSubscribe(queryPersistenceConfig);
}
