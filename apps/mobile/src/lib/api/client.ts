import { createApiClient } from '@meru/shared';
import Constants from 'expo-constants';
import { authStorage } from '../auth/storage';
import { authEvents } from '../auth/events';
import { queryClient } from '../query/client';

export { 
    createApiClient, 
    getNormalizedApiError, 
    getApiErrorMessage, 
    isOfflineOrNetworkError,
    type NormalizedApiError,
    type ApiErrorCategory
} from '@meru/shared';

// Get the machine's IP address dynamically from Expo's host URI
// This works when using Expo Go or development builds
const debuggerHost = Constants.expoConfig?.hostUri;
const dynamicIP = debuggerHost?.split(':').shift();

// Local development configuration
// Set USE_LOCAL_IP to true when testing on a physical device
// Set USE_LOCAL_IP to false when testing on iOS Simulator / Android Emulator
const USE_LOCAL_IP = true;  // Change to false for simulator
const LOCAL_IP = dynamicIP || '192.168.100.94';  // Your machine's local network IP (fallback)

const baseURL = __DEV__
  ? USE_LOCAL_IP
    ? `http://${LOCAL_IP}:4000/api`  // Physical device (local network)
    : 'http://localhost:4000/api'  // Simulator / Emulator
  : 'https://api.merucountypublicserviceboard.or.ke/api';  // Production


export const apiClient = createApiClient({
    baseURL,
    getAccessToken: () => authStorage.getAccessToken(),
    getRefreshToken: () => authStorage.getRefreshToken(),
    onTokenRefresh: (token) => authStorage.setAccessToken(token),
    onLogout: async () => {
        if (__DEV__) console.log('\x1b[33m[API Client] Triggering global logout...\x1b[0m');
        await authStorage.clearAll();
        queryClient.clear();
        authEvents.emitLogout();
    },
    isDebug: __DEV__
});

export const getAvatarUrl = (avatarPath?: string | null, fullName?: string) => {
    if (!avatarPath) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=004aad&color=fff&size=256`;
    }
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
        return avatarPath;
    }
    // Prepend API base URL (removing the trailing '/api' from the baseURL config)
    const base = baseURL.replace(/\/api$/, '') || '';
    return `${base}${avatarPath}`;
};

export default apiClient;
