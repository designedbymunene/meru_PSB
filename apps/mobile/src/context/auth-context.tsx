import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginInput, RegisterInput, AuthResponse } from '@meru/shared';
import { authStorage } from '../lib/auth/storage';
import { apiClient } from '../lib/api/client';
import { router } from 'expo-router';
import { toast } from 'sonner-native';
import { authEvents } from '../lib/auth/events';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (credentials: LoginInput) => Promise<{ twoFactorRequired?: boolean }>;
    verify2fa: (data: { email: string; otp: string }) => Promise<void>;
    register: (data: RegisterInput) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadUser = useCallback(async () => {
        try {
            const [storedUser, token] = await Promise.all([
                authStorage.getUser(),
                authStorage.getAccessToken()
            ]);
            
            if (storedUser && token) {
                setUser(storedUser);
            } else if (storedUser || token) {
                if (__DEV__) console.warn('[Auth] Inconsistent auth state detected, clearing session');
                await authStorage.clearAll();
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to load user', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    useEffect(() => {
        const unsubscribe = authEvents.subscribe(() => {
            if (user) {
                setUser(null);
                router.replace('/login');
            }
        });
        return unsubscribe;
    }, [user]);

    const login = async (credentials: LoginInput) => {
        try {
            if (__DEV__) console.log('\x1b[36m[Auth] Starting login process...\x1b[0m');
            
            const { getDeviceInfo } = await import('../lib/device');
            const deviceInfo = await getDeviceInfo();

            const response = await apiClient.post<any>('/auth/login', {
                ...credentials,
                ...deviceInfo
            });

            if (response.data.data.twoFactorRequired) {
                return { twoFactorRequired: true };
            }

            const { user, accessToken, refreshToken } = response.data.data;
            
            await authStorage.setAccessToken(accessToken);
            await authStorage.setRefreshToken(refreshToken);
            await authStorage.setUser(user);
            
            setUser(user);
            
            toast.success('Login Successful', {
                description: `Welcome back, ${user.fullName.split(' ')[0]}!`
            });
            router.replace('/');
            return {};
        } catch (error) {
            if (__DEV__) console.error('\x1b[31m[Auth] Login attempt failed\x1b[0m');
            throw error;
        }
    };

    const verify2fa = async (data: { email: string; otp: string }) => {
        try {
            const { getDeviceInfo } = await import('../lib/device');
            const deviceInfo = await getDeviceInfo();

            const response = await apiClient.post<any>('/auth/login/2fa', {
                ...data,
                ...deviceInfo
            });

            const { user, accessToken, refreshToken } = response.data.data;
            
            await authStorage.setAccessToken(accessToken);
            await authStorage.setRefreshToken(refreshToken);
            await authStorage.setUser(user);
            
            setUser(user);
            toast.success('Login Successful');
            router.replace('/');
        } catch (error) {
            throw error;
        }
    };

    const register = async (data: RegisterInput) => {
        const requestId = Math.random().toString(36).substring(7);
        try {
            const formattedData = {
                ...data,
                phoneNumber: data.phoneNumber.startsWith('+') ? data.phoneNumber : `+254${data.phoneNumber.replace(/^0/, '')}`
            };

            const response = await apiClient.post<AuthResponse>('/auth/register', formattedData);
            const { user, accessToken, refreshToken } = response.data.data;
            
            await authStorage.setAccessToken(accessToken);
            await authStorage.setRefreshToken(refreshToken);
            await authStorage.setUser(user);
            
            setUser(user);

            toast.success('Account Created', {
                description: 'Your professional journey starts here.'
            });
            router.replace('/');
        } catch (error: any) {
            if (__DEV__) {
                console.error(`\x1b[31m[Auth] [${requestId}] Registration failed`);
                if (error.response) {
                    console.error(`\x1b[31m[Auth] [${requestId}] Data:`, JSON.stringify(error.response.data, null, 2));
                }
            }
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authStorage.clearAll();
            setUser(null);
            toast.info('Logged Out');
            router.replace('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, verify2fa, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
