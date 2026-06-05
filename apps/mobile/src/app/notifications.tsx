import React, { useState, useCallback, useMemo } from 'react';
import { ScrollView, Text, Pressable, View, LayoutAnimation, Platform, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Briefcase, CheckCircle2, Info, ShieldAlert, X } from 'lucide-react-native';
import { Header, HeaderAction } from '../components/ui/header';

// Helper to safely trigger layout animations - only on native platforms
const safeLayoutAnimation = () => {
    if (Platform.OS !== 'web' && LayoutAnimation.configureNext) {
        try {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        } catch (e) {
            console.warn('LayoutAnimation failed', e);
        }
    }
};

type NotificationType = 'application' | 'vacancy' | 'system';

type NotificationItem = {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: NotificationType;
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
    {
        id: 'n-1',
        title: 'Application update',
        message: 'Your application for Assistant County Commissioner moved to document review.',
        time: '2h ago',
        read: false,
        type: 'application',
    },
    {
        id: 'n-2',
        title: 'New vacancy posted',
        message: 'A new opening matching your profile is now available in Public Administration.',
        time: '5h ago',
        read: false,
        type: 'vacancy',
    },
    {
        id: 'n-3',
        title: 'Account security',
        message: 'A successful login was detected on your account.',
        time: 'Yesterday',
        read: true,
        type: 'system',
    },
    {
        id: 'n-4',
        title: 'Interview Invitation',
        message: 'You have been invited for an interview for the position of Senior Accountant.',
        time: '2 days ago',
        read: true,
        type: 'application',
    },
];

const FILTERS: { label: string; value: NotificationType | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Applications', value: 'application' },
    { label: 'Vacancies', value: 'vacancy' },
    { label: 'System', value: 'system' },
];

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [activeFilter, setActiveFilter] = useState<NotificationType | 'all'>('all');
    const [refreshing, setRefreshing] = useState(false);
    const insets = useSafeAreaInsets();

    const filteredNotifications = useMemo(() => 
        notifications.filter((n) => activeFilter === 'all' || n.type === activeFilter),
        [notifications, activeFilter]
    );

    const unreadCount = useMemo(() => 
        notifications.filter((item) => !item.read).length,
        [notifications]
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    const markAllAsRead = useCallback(() => {
        safeLayoutAnimation();
        setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    }, []);

    const markAsRead = useCallback((id: string) => {
        safeLayoutAnimation();
        setNotifications((current) =>
            current.map((item) => (item.id === id ? { ...item, read: true } : item))
        );
    }, []);

    const deleteNotification = useCallback((id: string) => {
        safeLayoutAnimation();
        setNotifications((current) => current.filter((item) => item.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        safeLayoutAnimation();
        setNotifications([]);
    }, []);

    const iconForType = useCallback((type: NotificationType) => {
        switch (type) {
            case 'application':
                return <CheckCircle2 size={18} color="#2563eb" />;
            case 'vacancy':
                return <Briefcase size={18} color="#059669" />;
            case 'system':
                return <ShieldAlert size={18} color="#dc2626" />;
            default:
                return <Info size={18} color="#94a3b8" />;
        }
    }, []);

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-950">
            <Header
                title="Notifications"
                rightAction={
                    notifications.length > 0 ? (
                        <HeaderAction 
                            label="Clear"
                            onPress={clearAll}
                        />
                    ) : undefined
                }
            />

            <View className="flex-1">
                <View className="px-5 pt-6 pb-2">
                    <Text className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Activity Center</Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">
                        {unreadCount > 0 ? `You have ${unreadCount} unread updates` : 'You are all caught up'}
                    </Text>
                </View>

                {/* Filters */}
                <View className="py-4">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                    >
                        {FILTERS.map((filter) => (
                            <Pressable
                                key={filter.value}
                                onPress={() => setActiveFilter(filter.value)}
                                className={`mr-2 px-5 py-2.5 rounded-full border ${
                                    activeFilter === filter.value
                                        ? 'bg-blue-600 border-blue-600 shadow-sm shadow-blue-200'
                                        : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                                }`}
                            >
                                <Text
                                    className={`text-xs font-bold ${
                                        activeFilter === filter.value ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                                    }`}
                                >
                                    {filter.label}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                <ScrollView
                    className="flex-1"
                    contentInsetAdjustmentBehavior="automatic"
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
                >
                    {filteredNotifications.length === 0 ? (
                        <View className="items-center justify-center py-20">
                            <View className="w-24 h-24 rounded-full bg-white dark:bg-gray-900 items-center justify-center mb-6 shadow-sm border border-gray-50 dark:border-gray-800">
                                <Bell size={40} color="#cbd5e1" />
                            </View>
                            <Text className="text-gray-900 dark:text-white font-black text-xl">No notifications</Text>
                            <Text className="text-gray-500 dark:text-gray-400 text-sm text-center mt-2 max-w-[240px] leading-6">
                                {activeFilter === 'all'
                                    ? "We'll notify you when there are updates to your applications or new jobs."
                                    : `You don't have any ${activeFilter} notifications at the moment.`}
                            </Text>
                            {activeFilter !== 'all' && (
                                <Pressable
                                    onPress={() => setActiveFilter('all')}
                                    className="mt-6 bg-blue-50 dark:bg-blue-900/20 px-6 py-2.5 rounded-xl"
                                >
                                    <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs">View all</Text>
                                </Pressable>
                            )}
                        </View>
                    ) : (
                        <View className="space-y-4">
                            {unreadCount > 0 && activeFilter === 'all' && (
                                <View className="flex-row items-center justify-between mb-2 px-1">
                                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-widest">Recent Updates</Text>
                                    <Pressable onPress={markAllAsRead}>
                                        <Text className="text-blue-600 dark:text-blue-400 text-[11px] font-bold">Mark all read</Text>
                                    </Pressable>
                                </View>
                            )}
                            
                            {filteredNotifications.map((item) => (
                                <Pressable
                                    key={item.id}
                                    style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
                                    onPress={() => !item.read && markAsRead(item.id)}
                                    className={`relative overflow-hidden rounded-2xl border ${
                                        item.read 
                                            ? 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm' 
                                            : 'bg-white dark:bg-gray-900 border-blue-100 dark:border-blue-900/30 shadow-md shadow-blue-50'
                                    }`}
                                >
                                    {!item.read && (
                                        <View className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                                    )}
                                    <View className="p-4">
                                        <View className="flex-row items-start">
                                            <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                                                item.read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/30'
                                            }`}>
                                                {iconForType(item.type)}
                                            </View>
                                            <View className="flex-1">
                                                <View className="flex-row items-center justify-between">
                                                    <Text className={`font-black text-sm pr-3 ${
                                                        item.read ? 'text-gray-900 dark:text-white' : 'text-blue-950 dark:text-blue-100'
                                                    }`}>
                                                        {item.title}
                                                    </Text>
                                                    <Pressable 
                                                        onPress={() => deleteNotification(item.id)}
                                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                    >
                                                        <X size={14} color="#94a3b8" />
                                                    </Pressable>
                                                </View>
                                                <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1.5 leading-5 font-medium">
                                                    {item.message}
                                                </Text>
                                                <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-gray-800/50">
                                                    <View className="flex-row items-center">
                                                        <View className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 mr-2" />
                                                        <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">{item.time}</Text>
                                                    </View>
                                                    {!item.read && (
                                                        <View className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded-md">
                                                            <Text className="text-blue-700 dark:text-blue-300 text-[9px] font-black uppercase">New</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    );
}




