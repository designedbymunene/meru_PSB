import { QueryClient } from "@tanstack/react-query";
import { getNormalizedApiError } from "@/lib/api/client";
import { hasRetryBudget, isRetryableApiError } from "@/lib/retry-policy";
import { setupQueryOnlineManager } from "./online-manager";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

setupQueryOnlineManager();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const normalizedError = getNormalizedApiError(error);
        return isRetryableApiError(normalizedError) && hasRetryBudget(failureCount);
      },
      staleTime: 5 * MINUTE,
      gcTime: 24 * HOUR,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error) => {
        const normalizedError = getNormalizedApiError(error);
        return isRetryableApiError(normalizedError) && hasRetryBudget(failureCount);
      },
    },
  },
});
