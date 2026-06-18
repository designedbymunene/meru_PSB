import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Wifi, WifiOff, X, AlertCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetInfo } from '@react-native-community/netinfo';
import { useColorScheme } from 'nativewind';

/**
 * OfflineBanner - A persistent banner showing connectivity status
 *
 * Features:
 * - Shows offline warning with clear messaging
 * - Auto-dismisses when connection returns
 * - Dismissible by user
 * - Animated transitions
 *
 * @example
 * <OfflineBanner />
 */
export function OfflineBanner() {
    const insets = useSafeAreaInsets();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const netInfo = useNetInfo();

    const [isVisible, setIsVisible] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;

    useEffect(() => {
        // Show banner when going offline
        if (isOffline && !isVisible) {
            setIsVisible(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
        // Hide banner when coming back online
        else if (!isOffline && isVisible) {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => setIsVisible(false));
            setWasOffline(false);
        }
    }, [isOffline]);

    useEffect(() => {
        if (isOffline) {
            setWasOffline(true);
        }
    }, [isOffline]);

    const handleDismiss = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setIsVisible(false));
    };

    if (!isVisible) return null;

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                paddingTop: insets.top,
            }}
            className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800"
        >
            <View className="flex-row items-center px-4 py-3">
                <WifiOff size={18} color="#f59e0b" />
                <View className="flex-1 ml-3">
                    <Text className="text-amber-900 dark:text-amber-100 font-semibold text-sm">
                        You're offline
                    </Text>
                    <Text className="text-amber-700 dark:text-amber-300 text-xs">
                        Some features may be limited. Data will sync when you reconnect.
                    </Text>
                </View>
                <Pressable onPress={handleDismiss} hitSlop={8}>
                    <X size={18} color="#f59e0b" />
                </Pressable>
            </View>
        </Animated.View>
    );
}

/**
 * ConnectionStatusIndicator - A small status indicator showing connectivity
 *
 * Features:
 * - Compact size for header integration
 * - Color-coded status (green=online, amber=offline)
 * - Animated pulse when offline
 *
 * @example
 * <ConnectionStatusIndicator />
 */
export function ConnectionStatusIndicator() {
    const netInfo = useNetInfo();
    const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
    const [pulseAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        if (isOffline) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 0.5,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isOffline]);

    return (
        <Animated.View style={{ opacity: pulseAnim }}>
            {isOffline ? (
                <WifiOff size={16} color="#f59e0b" />
            ) : (
                <Wifi size={16} color="#10b981" />
            )}
        </Animated.View>
    );
}

/**
 * OfflineNotice - A dismissible card shown when user attempts actions while offline
 *
 * @example
 * <OfflineNotice message="This feature requires an internet connection" />
 */
interface OfflineNoticeProps {
    message?: string;
    onRetry?: () => void;
}

export function OfflineNotice({ message, onRetry }: OfflineNoticeProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View className="bg-gray-50 dark:bg-gray-900 border-l-4 border-amber-500 p-4 rounded-r-lg my-2">
            <View className="flex-row items-start">
                <AlertCircle size={20} color="#f59e0b" />
                <View className="flex-1 ml-3">
                    <Text className="text-gray-900 dark:text-white font-semibold text-sm mb-1">
                        Offline Mode
                    </Text>
                    <Text className="text-gray-600 dark:text-gray-400 text-xs leading-4">
                        {message || 'This action requires an internet connection. It has been queued and will retry when you reconnect.'}
                    </Text>
                    {onRetry && (
                        <Pressable
                            onPress={onRetry}
                            className="mt-3 self-start px-4 py-2 bg-amber-500 rounded-lg"
                        >
                            <Text className="text-white font-semibold text-xs">Retry Now</Text>
                        </Pressable>
                    )}
                </View>
            </View>
        </View>
    );
}

/**
 * OfflineBadge - A small badge component to mark features as unavailable offline
 *
 * @example
 * <OfflineBadge />
 */
export function OfflineBadge() {
    return (
        <View className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-full flex-row items-center">
            <WifiOff size={10} color="#6b7280" />
            <Text className="text-gray-500 dark:text-gray-400 text-[10px] font-semibold ml-1">
                Offline
            </Text>
        </View>
    );
}
