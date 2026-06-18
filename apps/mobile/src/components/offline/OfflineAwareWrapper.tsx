import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { View, Pressable, Modal, Text, ActivityIndicator } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { WifiOff, AlertTriangle } from 'lucide-react-native';
import { OfflineNotice } from './OfflineBanner';

interface OfflineAwareContextValue {
    isOffline: boolean;
    queueAction: (action: () => Promise<void>) => Promise<void>;
    isQueued: (key: string) => boolean;
}

const OfflineAwareContext = createContext<OfflineAwareContextValue | undefined>(undefined);

export const useOffline = () => {
    const context = useContext(OfflineAwareContext);
    if (!context) {
        throw new Error('useOffline must be used within OfflineAwareProvider');
    }
    return context;
};

interface OfflineAwareProviderProps {
    children: ReactNode;
    showToast?: boolean;
}

/**
 * Provider component that enables offline-aware functionality throughout the app.
 * Manages the queue of actions to run when back online.
 */
export function OfflineAwareProvider({ children, showToast = true }: OfflineAwareProviderProps) {
    const netInfo = useNetInfo();
    const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
    const [queuedActions, setQueuedActions] = useState<Set<string>>(new Set());
    const [showOfflineModal, setShowOfflineModal] = useState(false);

    // Clear queue when coming back online
    useEffect(() => {
        if (!isOffline) {
            setQueuedActions(new Set());
            setShowOfflineModal(false);
        }
    }, [isOffline]);

    const queueAction = async (action: () => Promise<void>): Promise<void> => {
        const actionKey = Math.random().toString(36).substring(7);

        if (isOffline) {
            setQueuedActions(prev => new Set([...prev, actionKey]));
            setShowOfflineModal(true);
            throw new Error('Offline: Action queued for later');
        }

        try {
            await action();
        } catch (error) {
            if ((error as any)?.message?.includes('Offline')) {
                throw error;
            }
            throw error;
        }
    };

    const isQueued = (key: string) => queuedActions.has(key);

    return (
        <OfflineAwareContext.Provider value={{ isOffline, queueAction, isQueued }}>
            {children}
            {showToast && isOffline && <OfflineModal />}
        </OfflineAwareContext.Provider>
    );
}

function OfflineModal() {
    const netInfo = useNetInfo();
    const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;

    if (!isOffline) return null;

    return (
        <Modal visible transparent animationType="fade">
            <View className="flex-1 bg-black/50 items-center justify-center p-6">
                <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                    <View className="items-center mb-4">
                        <View className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full items-center justify-center mb-4">
                            <WifiOff size={32} color="#f59e0b" />
                        </View>
                        <Text className="text-xl font-bold text-gray-900 dark:text-white text-center">
                            You're Offline
                        </Text>
                        <Text className="text-gray-600 dark:text-gray-400 text-center text-sm mt-2">
                            This action requires an internet connection. It has been queued and will be attempted automatically when you reconnect.
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

interface OfflineAwareButtonProps {
    children: ReactNode;
    onPress: () => Promise<void>;
    disabled?: boolean;
    allowOffline?: boolean;
}

/**
 * Button component that is aware of offline state.
 * - Can queue actions for later when offline
 * - Shows feedback about offline status
 * - Optionally allows actions to proceed offline
 */
export function OfflineAwareButton({
    children,
    onPress,
    disabled = false,
    allowOffline = false,
}: OfflineAwareButtonProps) {
    const { isOffline, queueAction } = useOffline();
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePress = async () => {
        if (disabled || isProcessing) return;

        setIsProcessing(true);
        try {
            if (!allowOffline && isOffline) {
                await queueAction(onPress);
            } else {
                await onPress();
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Pressable
            onPress={handlePress}
            disabled={disabled || isProcessing}
            className={`${isProcessing ? 'opacity-70' : ''}`}
        >
            {isProcessing ? (
                <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="#ffffff" />
                </View>
            ) : (
                children
            )}
        </Pressable>
    );
}

interface OfflineBlockProps {
    children: ReactNode;
    fallback?: ReactNode;
    showMessage?: boolean;
}

/**
 * Wrapper that blocks content when offline, showing a fallback instead.
 *
 * @example
 * <OfflineBlock fallback={<Text>This feature requires internet</Text>}>
 *   <OnlineOnlyFeature />
 * </OfflineBlock>
 */
export function OfflineBlock({ children, fallback, showMessage = true }: OfflineBlockProps) {
    const { isOffline } = useOffline();

    if (isOffline) {
        return (
            <View className="p-4 items-center justify-center">
                {fallback || (
                    <>
                        <View className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mb-4">
                            <WifiOff size={32} color="#6b7280" />
                        </View>
                        {showMessage && (
                            <>
                                <Text className="text-gray-900 dark:text-white font-semibold mb-2 text-center">
                                    Offline Mode
                                </Text>
                                <Text className="text-gray-600 dark:text-gray-400 text-sm text-center">
                                    This feature requires an internet connection. Please check your connection and try again.
                                </Text>
                            </>
                        )}
                    </>
                )}
            </View>
        );
    }

    return <>{children}</>;
}

interface CachedDataNoticeProps {
    timestamp?: string;
    isStale?: boolean;
}

/**
 * Notice shown when displaying cached/stale data while offline.
 *
 * @example
 * <CachedDataNotice timestamp={updatedAt} isStale={isDataStale} />
 */
export function CachedDataNotice({ timestamp, isStale }: CachedDataNoticeProps) {
    const { isOffline } = useOffline();

    if (!isOffline && !isStale) return null;

    return (
        <View className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 p-3 my-2">
            <View className="flex-row items-center">
                <AlertTriangle size={16} color="#3b82f6" />
                <Text className="text-blue-700 dark:text-blue-300 text-xs ml-2 flex-1">
                    {isStale
                        ? 'This data may be outdated. It will refresh when you reconnect.'
                        : 'Showing cached data. Will update when connection is restored.'}
                </Text>
                {timestamp && (
                    <Text className="text-blue-600 dark:text-blue-400 text-[10px] ml-2">
                        Cached {new Date(timestamp).toLocaleTimeString()}
                    </Text>
                )}
            </View>
        </View>
    );
}

/**
 * Hook that returns whether data should be considered stale based on age.
 *
 * @example
 * const isStale = useDataStale(updatedAt, 5 * 60 * 1000); // 5 minutes
 */
export function useDataStale(timestamp: string | undefined, staleThreshold: number) {
    if (!timestamp) return false;

    const age = Date.now() - new Date(timestamp).getTime();
    return age > staleThreshold;
}
