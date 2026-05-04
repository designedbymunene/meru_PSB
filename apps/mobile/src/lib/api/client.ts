import { createApiClient } from '@meru/shared';
import { authStorage } from '../auth/storage';
import { authEvents } from '../auth/events';
import Constants from 'expo-constants';

export { 
    createApiClient, 
    getNormalizedApiError, 
    getApiErrorMessage, 
    isOfflineOrNetworkError,
    type NormalizedApiError,
    type ApiErrorCategory
} from '@meru/shared';

const apiBase = (process.env.EXPO_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
const baseURL = `${apiBase}/api`;


export const apiClient = createApiClient({
    baseURL,
    getAccessToken: () => authStorage.getAccessToken(),
    getRefreshToken: () => authStorage.getRefreshToken(),
    onTokenRefresh: (token) => authStorage.setAccessToken(token),
    onLogout: async () => {
        await authStorage.clearAll();
        authEvents.emitLogout();
    },
    isDebug: __DEV__
});

export default apiClient;
