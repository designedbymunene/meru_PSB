import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";

let hasInitialized = false;

function resolveOnlineState(isConnected: boolean | null, isInternetReachable: boolean | null) {
  return Boolean(isConnected) && isInternetReachable !== false;
}

export function setupQueryOnlineManager() {
  if (hasInitialized) {
    return;
  }

  hasInitialized = true;

  onlineManager.setEventListener((setOnline) => {
    NetInfo.fetch()
      .then((state) => {
        setOnline(resolveOnlineState(state.isConnected, state.isInternetReachable));
      })
      .catch(() => {
        setOnline(true);
      });

    return NetInfo.addEventListener((state) => {
      setOnline(resolveOnlineState(state.isConnected, state.isInternetReachable));
    });
  });
}
