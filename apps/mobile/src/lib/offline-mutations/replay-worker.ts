import { AppState, type AppStateStatus } from "react-native";
import { apiClient, getNormalizedApiError } from "@/lib/api/client";
import { queryClient } from "@/lib/query/client";
import {
  annotateOfflineMutationError,
  listOfflineMutations,
  markOfflineMutationAsFailed,
  markOfflineMutationAsProcessing,
  markOfflineMutationAsQueued,
  markOfflineMutationAsSucceeded,
  shouldRetryReplay,
} from "./outbox";
import type { OfflineMutationEntry } from "./types";

let replayInFlight: Promise<void> | null = null;
let hasInitializedReplaySubscription = false;
let lastKnownOnlineState = true;
let hasWarnedMissingNetInfo = false;

function invalidateAffectedQueries(path: string) {
  const invalidations: string[][] = [];

  if (path === "/applicant-profiles" || path === "/applicant-profiles/me") {
    invalidations.push(["profile"]);
  }

  if (path.startsWith("/applicant-profiles/me/qualifications") || path.startsWith("/applicant-profiles/qualifications")) {
    invalidations.push(["qualifications"]);
  }

  if (path.startsWith("/applicant-profiles/me/professional-memberships") || path.includes("/professional-memberships")) {
    invalidations.push(["memberships"]);
  }

  if (path.startsWith("/applicant-profiles/me/professional-details") || path.startsWith("/applicant-profiles/professional-details")) {
    invalidations.push(["professional-details"]);
  }

  if (path.startsWith("/applicant-profiles/me/employment-history") || path.startsWith("/applicant-profiles/employment-history") || path.startsWith("/applicant-profiles/employment")) {
    invalidations.push(["employment-history"]);
    invalidations.push(["employment"]);
  }

  if (path.startsWith("/applicant-profiles/me/training-courses") || path.startsWith("/applicant-profiles/training-courses")) {
    invalidations.push(["training-courses"]);
  }

  invalidations.forEach((queryKey) => {
    queryClient.invalidateQueries({ queryKey });
  });
}

function resolveOnlineState(isConnected: boolean | null, isInternetReachable: boolean | null) {
  return Boolean(isConnected) && isInternetReachable !== false;
}

function isReplayable(entry: OfflineMutationEntry) {
  return entry.status === "queued";
}

async function replayEntry(entry: OfflineMutationEntry): Promise<"success" | "halt"> {
  const processingEntry = await markOfflineMutationAsProcessing(entry.id);

  if (!processingEntry) {
    return "success";
  }

  try {
    await apiClient.request({
      method: processingEntry.method,
      url: processingEntry.path,
      data: processingEntry.body,
      headers: {
        ...processingEntry.headers,
        "X-Idempotency-Key": processingEntry.requestKey,
      },
    });

    await markOfflineMutationAsSucceeded(processingEntry.id);
    invalidateAffectedQueries(processingEntry.path);
    return "success";
  } catch (error) {
    const normalizedError = getNormalizedApiError(error);

    if (normalizedError.category === "network") {
      await markOfflineMutationAsQueued(processingEntry.id, { error, retryCount: processingEntry.retryCount });
      return "halt";
    }

    const retryCount = processingEntry.retryCount + 1;

    if (shouldRetryReplay(normalizedError, retryCount)) {
      await markOfflineMutationAsQueued(processingEntry.id, { error, retryCount });
      return "success";
    }

    await markOfflineMutationAsFailed(processingEntry.id, retryCount, error);
    return "success";
  }
}

async function runReplayQueue() {
  const entries = await listOfflineMutations();
  const replayQueue = entries.filter(isReplayable);

  for (const entry of replayQueue) {
    const result = await replayEntry(entry);

    if (result === "halt") {
      break;
    }
  }
}

export function replayOfflineMutationOutbox(): Promise<void> {
  if (replayInFlight) {
    return replayInFlight;
  }

  replayInFlight = runReplayQueue()
    .catch(async (error) => {
      console.error("Offline mutation replay failed.", error);

      const queuedEntries = (await listOfflineMutations()).filter(isReplayable);
      await Promise.all(queuedEntries.map((entry) => annotateOfflineMutationError(entry.id, error)));
    })
    .finally(() => {
      replayInFlight = null;
    });

  return replayInFlight;
}

export function initializeOfflineMutationReplay() {
  if (hasInitializedReplaySubscription) {
    return () => undefined;
  }

  hasInitializedReplaySubscription = true;

  let unsubscribeNetInfo: () => void = () => undefined;
  let isDisposed = false;

  void import("@react-native-community/netinfo")
    .then(({ default: NetInfo }) => {
      if (isDisposed) {
        return;
      }

      NetInfo.fetch()
        .then((state) => {
          const isOnline = resolveOnlineState(state.isConnected, state.isInternetReachable);
          lastKnownOnlineState = isOnline;

          if (isOnline) {
            void replayOfflineMutationOutbox();
          }
        })
        .catch((error) => {
          console.error("Unable to resolve connectivity state for offline replay.", error);
        });

      unsubscribeNetInfo = NetInfo.addEventListener((state) => {
        const isOnline = resolveOnlineState(state.isConnected, state.isInternetReachable);

        if (isOnline && !lastKnownOnlineState) {
          void replayOfflineMutationOutbox();
        }

        lastKnownOnlineState = isOnline;
      });
    })
    .catch((error) => {
      if (!hasWarnedMissingNetInfo) {
        hasWarnedMissingNetInfo = true;
        console.warn(
          "[NetInfo] Offline replay is running without connectivity listeners because NetInfo is unavailable.",
          error
        );
      }

      lastKnownOnlineState = true;
      void replayOfflineMutationOutbox();
    });

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === "active") {
      void replayOfflineMutationOutbox();
    }
  };

  const appStateSubscription = AppState.addEventListener("change", handleAppStateChange);

  return () => {
    isDisposed = true;
    unsubscribeNetInfo();
    appStateSubscription.remove();
    hasInitializedReplaySubscription = false;
  };
}
