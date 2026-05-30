import { onlineManager } from "@tanstack/react-query";

let hasInitialized = false;
let hasWarnedMissingNetInfo = false;

function resolveOnlineState(isConnected: boolean | null, isInternetReachable: boolean | null) {
  return Boolean(isConnected) && isInternetReachable !== false;
}

export function setupQueryOnlineManager() {
  if (hasInitialized) {
    return;
  }

  hasInitialized = true;

  onlineManager.setEventListener((setOnline) => {
    let unsubscribe: () => void = () => undefined;
    let didUnsubscribe = false;

    void import("@react-native-community/netinfo")
      .then(({ default: NetInfo }) => {
        if (didUnsubscribe) {
          return;
        }

        NetInfo.fetch()
          .then((state) => {
            setOnline(resolveOnlineState(state.isConnected, state.isInternetReachable));
          })
          .catch(() => {
            setOnline(true);
          });

        unsubscribe = NetInfo.addEventListener((state) => {
          setOnline(resolveOnlineState(state.isConnected, state.isInternetReachable));
        });
      })
      .catch((error) => {
        if (!hasWarnedMissingNetInfo) {
          hasWarnedMissingNetInfo = true;
          console.warn(
            "[NetInfo] Native NetInfo module is unavailable; assuming online mode.",
            error
          );
        }
        setOnline(true);
      });

    return () => {
      didUnsubscribe = true;
      unsubscribe();
    };
  });
}
