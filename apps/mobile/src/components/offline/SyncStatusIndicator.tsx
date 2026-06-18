import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Animated, ScrollView } from 'react-native';
import { Cloud, CloudOff, CheckCircle2, Clock, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react-native';
import { subscribeToOfflineMutations, type OfflineMutationEntry } from '@/lib/offline-mutations/outbox';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { runOfflineMutationOutbox } from '@/lib/offline-mutations/replay-worker';
import { useNetInfo } from '@react-native-community/netinfo';

/**
 * SyncStatusIndicator - Shows pending sync operations with count
 *
 * @example
 * <SyncStatusIndicator />
 */
export function SyncStatusIndicator() {
    const [pendingCount, setPendingCount] = useState(0);
    const [failedCount, setFailedCount] = useState(0);
    const netInfo = useNetInfo();
    const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;

    useEffect(() => {
        const unsubscribe = subscribeToOfflineMutations((entries) => {
            const pending = entries.filter(e => e.status === 'queued' || e.status === 'processing').length;
            const failed = entries.filter(e => e.status === 'failed').length;
            setPendingCount(pending);
            setFailedCount(failed);
        });
        return unsubscribe;
    }, []);

    if (pendingCount === 0 && failedCount === 0) return null;

    const hasPending = pendingCount > 0;
    const hasFailed = failedCount > 0;

    return (
        <View className="flex-row items-center gap-2">
            {hasPending && (
                <View className="bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full flex-row items-center border border-blue-200 dark:border-blue-800">
                    <Clock size={12} color="#3b82f6" />
                    <Text className="text-blue-600 dark:text-blue-400 text-[10px] font-semibold ml-1">
                        {pendingCount} pending
                    </Text>
                </View>
            )}
            {hasFailed && (
                <View className="bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-full flex-row items-center border border-red-200 dark:border-red-800">
                    <AlertCircle size={12} color="#ef4444" />
                    <Text className="text-red-600 dark:text-red-400 text-[10px] font-semibold ml-1">
                        {failedCount} failed
                    </Text>
                </View>
            )}
        </View>
    );
}

/**
 * SyncPanel - A detailed panel showing all pending/failed sync operations
 *
 * @example
 * <SyncPanel isVisible onClose={() => {}} />
 */
interface SyncPanelProps {
    isVisible: boolean;
    onClose: () => void;
}

export function SyncPanel({ isVisible, onClose }: SyncPanelProps) {
    const insets = useSafeAreaInsets();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [entries, setEntries] = useState<OfflineMutationEntry[]>([]);
    const [isRetrying, setIsRetrying] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const netInfo = useNetInfo();
    const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
    const slideAnim = React.useRef(new Animated.Value(300)).current;

    useEffect(() => {
        if (isVisible) {
            const unsubscribe = subscribeToOfflineMutations(setEntries);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
            return unsubscribe;
        } else {
            Animated.timing(slideAnim, {
                toValue: 300,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [isVisible]);

    const handleRetryAll = async () => {
        if (isOffline) {
            return;
        }
        setIsRetrying(true);
        try {
            await runOfflineMutationOutbox();
        } finally {
            setIsRetrying(false);
        }
    };

    const formatMutationName = (entry: OfflineMutationEntry) => {
        const method = entry.method.toUpperCase();
        const path = entry.path.split('/').pop() || entry.path;
        return `${method} ${path}`;
    };

    const getEntryIcon = (status: OfflineMutationEntry['status']) => {
        switch (status) {
            case 'queued':
                return <Clock size={16} color="#3b82f6" />;
            case 'processing':
                return <Clock size={16} color="#f59e0b" />;
            case 'succeeded':
                return <CheckCircle2 size={16} color="#10b981" />;
            case 'failed':
                return <AlertCircle size={16} color="#ef4444" />;
        }
    };

    const activeEntries = entries.filter(e => e.status !== 'succeeded');

    if (!isVisible) return null;

    return (
        <>
            <Pressable
                className="absolute inset-0 bg-black/50 z-40"
                onPress={onClose}
                pointerEvents={isVisible ? 'auto' : 'none'}
            />
            <Animated.View
                style={{
                    transform: [{ translateY: slideAnim }],
                }}
                className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-950 rounded-t-3xl shadow-2xl z-50 border-t border-gray-200 dark:border-gray-800"
                style={{ paddingBottom: insets.bottom + 20 }}
            >
                {/* Header */}
                <View className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-900">
                    <View className="flex-row items-center">
                        {isOffline ? (
                            <CloudOff size={20} color="#f59e0b" />
                        ) : (
                            <Cloud size={20} color="#3b82f6" />
                        )}
                        <Text className="ml-2 text-lg font-bold text-gray-900 dark:text-white">
                            {isOffline ? 'Offline Sync Queue' : 'Sync Status'}
                        </Text>
                    </View>
                    <Pressable onPress={onClose} hitSlop={12}>
                        <X size={20} color="#6b7280" />
                    </Pressable>
                </View>

                {/* Summary */}
                <View className="px-4 py-3 bg-gray-50 dark:bg-gray-900">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-sm text-gray-600 dark:text-gray-400">
                            {activeEntries.length} item{activeEntries.length !== 1 ? 's' : ''} to sync
                        </Text>
                        {!isOffline && activeEntries.length > 0 && (
                            <Pressable
                                onPress={handleRetryAll}
                                disabled={isRetrying}
                                className="bg-blue-600 px-3 py-1.5 rounded-lg"
                            >
                                <Text className="text-white text-xs font-semibold">
                                    {isRetrying ? 'Syncing...' : 'Sync Now'}
                                </Text>
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* Entries */}
                <ScrollView className="flex-1 max-h-80">
                    {activeEntries.length === 0 ? (
                        <View className="items-center justify-center py-12">
                            <CheckCircle2 size={48} color="#10b981" />
                            <Text className="mt-3 text-gray-900 dark:text-white font-semibold">All synced!</Text>
                        </View>
                    ) : (
                        activeEntries.map((entry) => (
                            <View
                                key={entry.id}
                                className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-900"
                            >
                                <View className="mr-3">{getEntryIcon(entry.status)}</View>
                                <View className="flex-1">
                                    <Text className="text-sm font-medium text-gray-900 dark:text-white">
                                        {formatMutationName(entry)}
                                    </Text>
                                    <Text className="text-xs text-gray-500">
                                        {entry.status === 'failed' && entry.lastError
                                            ? entry.lastError.message
                                            : entry.status === 'processing'
                                            ? 'Processing...'
                                            : 'Waiting to sync'}
                                    </Text>
                                </View>
                                {entry.status === 'failed' && (
                                    <Pressable
                                        onPress={handleRetryAll}
                                        className="ml-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/20 rounded-lg"
                                        hitSlop={8}
                                    >
                                        <Text className="text-red-600 dark:text-red-400 text-xs font-semibold">Retry</Text>
                                    </Pressable>
                                )}
                            </View>
                        ))
                    )}
                </ScrollView>

                {/* Info */}
                {isOffline && (
                    <View className="px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-200 dark:border-amber-800">
                        <Text className="text-xs text-amber-700 dark:text-amber-300 text-center">
                            You're offline. Items will sync automatically when you reconnect.
                    </Text>
                    </View>
                )}
            </Animated.View>
        </>
    );
}

/**
 * OptimisticStatus - Shows the real-time sync status of form operations
 *
 * @example
 * <OptimisticStatus isPending={true} isQueued={false} />
 */
interface OptimisticStatusProps {
    isPending?: boolean;
    isQueued?: boolean;
    isFailed?: boolean;
    message?: string;
}

export function OptimisticStatus({ isPending, isQueued, isFailed, message }: OptimisticStatusProps) {
    if (isFailed) {
        return (
            <View className="flex-row items-center bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
                <AlertCircle size={14} color="#ef4444" />
                <Text className="text-red-600 dark:text-red-400 text-xs ml-2 flex-1">
                    {message || 'Failed to sync. Will retry automatically.'}
                </Text>
            </View>
        );
    }

    if (isQueued) {
        return (
            <View className="flex-row items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                <Clock size={14} color="#3b82f6" />
                <Text className="text-blue-600 dark:text-blue-400 text-xs ml-2 flex-1">
                    {message || 'Saved locally. Will sync when you\'re online.'}
                </Text>
            </View>
        );
    }

    if (isPending) {
        return (
            <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                <View className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                <Text className="text-gray-600 dark:text-gray-400 text-xs ml-2">
                    Saving...
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-row items-center bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
            <CheckCircle2 size={14} color="#10b981" />
            <Text className="text-green-600 dark:text-green-400 text-xs ml-2">
                Saved
            </Text>
        </View>
    );
}
