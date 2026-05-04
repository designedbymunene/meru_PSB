import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const authStorage = {
    async setAccessToken(token: string) {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    },
    async getAccessToken() {
        return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    },
    async setRefreshToken(token: string) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    },
    async getRefreshToken() {
        return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    },
    async setUser(user: any) {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    },
    async getUser() {
        const user = await SecureStore.getItemAsync(USER_KEY);
        return user ? JSON.parse(user) : null;
    },
    async clearAll() {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
    }
};
