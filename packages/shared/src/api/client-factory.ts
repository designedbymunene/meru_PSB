import axios, {
    AxiosError,
    isAxiosError,
    type AxiosInstance,
    type InternalAxiosRequestConfig,
} from 'axios';
import { hasRetryBudget, isRetryableApiError } from './retry-policy';

export type ApiErrorCategory = 'network' | 'auth' | 'server' | 'client' | 'unknown';

export interface ApiErrorResponseData {
    message?: string;
    code?: string;
    [key: string]: unknown;
}

export interface NormalizedApiError {
    message: string;
    code: string;
    category: ApiErrorCategory;
    status?: number;
    isNetworkError: boolean;
    isOffline: boolean;
}

export type ApiAxiosError = AxiosError<ApiErrorResponseData> & {
    normalized?: NormalizedApiError;
};

export interface RetryableRequestConfig extends InternalAxiosRequestConfig {
    _authRefreshAttempts?: number;
    _retryCount?: number;
}

const OFFLINE_MESSAGE = 'No internet connection. Please check your connection and try again.';
const NETWORK_MESSAGE = 'Unable to reach the server. Please try again.';
const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

const isProbablyOffline = (error: AxiosError): boolean => {
    const message = error.message.toLowerCase();
    return (
        error.code === 'ERR_NETWORK' ||
        message.includes('network request failed') ||
        message.includes('network error') ||
        message.includes('internet connection appears to be offline')
    );
};

export const normalizeApiError = (error: unknown): NormalizedApiError => {
    if (isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponseData>;
        const status = axiosError.response?.status;
        const responseData = axiosError.response?.data;
        const responseMessage = typeof responseData?.message === 'string' ? responseData.message : undefined;
        const responseCode = typeof responseData?.code === 'string' ? responseData.code : undefined;

        if (!axiosError.response) {
            const isOffline = isProbablyOffline(axiosError);

            return {
                message: isOffline ? OFFLINE_MESSAGE : NETWORK_MESSAGE,
                code: responseCode ?? (isOffline ? 'OFFLINE' : axiosError.code || 'NETWORK_ERROR'),
                category: 'network',
                isNetworkError: true,
                isOffline,
            };
        }

        const category: ApiErrorCategory = status === 401
            ? 'auth'
            : status && status >= 500
                ? 'server'
                : status && status >= 400
                    ? 'client'
                    : 'unknown';

        return {
            message: responseMessage || axiosError.message || DEFAULT_ERROR_MESSAGE,
            code: responseCode || (status ? `HTTP_${status}` : 'UNKNOWN_API_ERROR'),
            category,
            status,
            isNetworkError: false,
            isOffline: false,
        };
    }

    return {
        message: error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE,
        code: 'UNKNOWN_ERROR',
        category: 'unknown',
        isNetworkError: false,
        isOffline: false,
    };
};

export const attachNormalizedApiError = (error: unknown): unknown => {
    if (isAxiosError(error)) {
        (error as ApiAxiosError).normalized = normalizeApiError(error);
    }
    return error;
};

export const getNormalizedApiError = (error: unknown): NormalizedApiError => {
    if (isAxiosError(error) && (error as ApiAxiosError).normalized) {
        return (error as ApiAxiosError).normalized as NormalizedApiError;
    }
    return normalizeApiError(error);
};

export const getApiErrorMessage = (error: unknown, fallbackMessage = DEFAULT_ERROR_MESSAGE): string => {
    const normalizedError = getNormalizedApiError(error);
    return normalizedError.message || fallbackMessage;
};

export const isOfflineOrNetworkError = (error: unknown): boolean => {
    const normalizedError = getNormalizedApiError(error);
    return normalizedError.category === 'network';
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ApiClientOptions {
    baseURL: string;
    getAccessToken: () => Promise<string | null>;
    getRefreshToken: () => Promise<string | null>;
    onTokenRefresh: (accessToken: string) => Promise<void>;
    onLogout: () => Promise<void>;
    isDebug?: boolean;
}

export const createApiClient = (options: ApiClientOptions): AxiosInstance => {
    const { baseURL: rawBaseURL, getAccessToken, getRefreshToken, onTokenRefresh, onLogout, isDebug } = options;
    const baseURL = rawBaseURL.replace(/\/+$/, '');
    const AUTH_REFRESH_MAX_ATTEMPTS = 1;

    const apiClient = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    apiClient.interceptors.request.use(
        async (config) => {
            const token = await getAccessToken();
            if (token) {
                if (config.headers.set) {
                    config.headers.set('Authorization', `Bearer ${token}`);
                } else {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }

            if (isDebug) {
                const hasAuth = !!(config.headers.Authorization || (config.headers.get && config.headers.get('Authorization')));
                console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} ${hasAuth ? '(Auth)' : '(No Auth)'}`);
                
                if (config.data) {
                    // Sanitize sensitive data before logging
                    const dataToLog = { ...config.data };
                    const sensitiveFields = ['password', 'token', 'refreshToken', 'accessToken', 'currentPassword', 'newPassword'];
                    sensitiveFields.forEach(field => {
                        if (dataToLog[field]) dataToLog[field] = '********';
                    });
                    console.log(`[API Request Data]`, JSON.stringify(dataToLog, null, 2));
                }
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    apiClient.interceptors.response.use(
        (response) => {
            if (isDebug) {
                console.log(`\x1b[32m[API Success] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}\x1b[0m`);
            }
            return response;
        },
        async (error: AxiosError<ApiErrorResponseData>) => {
            const normalizedError = getNormalizedApiError(error);
            
            if (isDebug) {
                const status = error.response?.status || 'Network Error';
                const method = error.config?.method?.toUpperCase();
                const url = error.config?.url;
                const responseData = JSON.stringify(error.response?.data, null, 2);
                
                console.log(`\x1b[31m[API Error] ${status} ${method} ${url}\x1b[0m`);
                console.log(`\x1b[31m[API Error Message] ${normalizedError.message}\x1b[0m`);
                if (error.response?.data) {
                    console.log(`\x1b[31m[API Error Data] ${responseData}\x1b[0m`);
                }
            }

            const originalRequest = error.config as RetryableRequestConfig | undefined;
            if (!originalRequest) {
                return Promise.reject(attachNormalizedApiError(error));
            }

            // 1. Handle Auth Refresh
            const refreshAttempts = originalRequest._authRefreshAttempts ?? 0;
            if (
                error.response?.status === 401 &&
                refreshAttempts < AUTH_REFRESH_MAX_ATTEMPTS &&
                !originalRequest.url?.includes('/auth/refresh')
            ) {
                originalRequest._authRefreshAttempts = refreshAttempts + 1;

                try {
                    const refreshToken = await getRefreshToken();
                    if (refreshToken) {
                        const response = await axios.post(`${baseURL}/auth/refresh`, {
                            refreshToken,
                        });

                        const { accessToken } = response.data.data;
                        await onTokenRefresh(accessToken);

                        originalRequest.headers = originalRequest.headers ?? {};
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        return apiClient(originalRequest);
                    }
                } catch {
                    await onLogout();
                }
            } else if (error.response?.status === 401) {
                await onLogout();
            }

            // 2. Handle General Retries
            const retryCount = originalRequest._retryCount ?? 0;

            if (isRetryableApiError(normalizedError) && hasRetryBudget(retryCount)) {
                originalRequest._retryCount = retryCount + 1;
                const delay = (retryCount + 1) * 1000 + Math.random() * 500;
                await sleep(delay);
                return apiClient(originalRequest);
            }

            return Promise.reject(attachNormalizedApiError(error));
        }
    );

    return apiClient;
};
