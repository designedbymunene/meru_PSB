import { PropsWithChildren, useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { initializeOfflineMutationReplay } from "@/lib/offline-mutations";
import { queryClient } from "./client";
import {
  restoreQueryCache,
  subscribeToQueryCachePersistence,
} from "./persistence";

export function AppQueryProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let unsubscribeOfflineReplay: (() => void) | undefined;
    let isMounted = true;

    const setup = async () => {
      try {
        await restoreQueryCache();
        unsubscribe = subscribeToQueryCachePersistence();
        unsubscribeOfflineReplay = initializeOfflineMutationReplay();
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    setup();

    return () => {
      isMounted = false;
      unsubscribe?.();
      unsubscribeOfflineReplay?.();
    };
  }, []);

  if (!isReady) {
    return null;
  }

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
