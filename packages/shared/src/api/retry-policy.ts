import type { NormalizedApiError } from "./client-factory";

export const MAX_RETRY_ATTEMPTS = 1;

export function hasRetryBudget(failureCount: number) {
  return failureCount <= MAX_RETRY_ATTEMPTS;
}

export function isRetryableApiError(error: NormalizedApiError) {
  return error.category !== "auth" && error.category !== "client";
}
