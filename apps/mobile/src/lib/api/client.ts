import { createApiClient } from '@meru/shared';
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

const baseURL = 'https://api.merucountypublicserviceboard.or.ke/api';


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

export default apiClient;
