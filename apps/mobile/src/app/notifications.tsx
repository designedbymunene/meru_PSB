import React, { useState, useCallback, useMemo } from 'react';
import { ScrollView, Text, Pressable, View, LayoutAnimation, Platform, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Briefcase, CheckCircle2, Info, ShieldAlert, X } from 'lucide-react-native';
import { Header, HeaderAction } from '../components/ui/header';
import { formatDistanceToNow } from 'date-fns';
import {
    useNotifications,
    useUnreadNotificationCount,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,
    useDeleteNotification
} from '../hooks/use-notifications';

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

const formatTimeAgo = (dateStr: string) => {
    try {
        if (!dateStr) return 'some time ago';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'some time ago';
        return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
        return 'some time ago';
    }
};

const mapBackendType = (type: string): NotificationType => {
    switch (type) {
        case 'application_status':
        case 'application_update':
        case 'document_request':
            return 'application';
        case 'vacancy':
            return 'vacancy';
        default:
            return 'system';
    }
};

const FILTERS: { label: string; value: NotificationType | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Applications', value: 'application' },
    { label: 'Vacancies', value: 'vacancy' },
    { label: 'System', value: 'system' },
];

export default function NotificationsScreen() {
    const { data: notificationsData = [], isLoading, refetch } = useNotifications(1, 100);
    const { data: unreadCount = 0 } = useUnreadNotificationCount();
    const markAsReadMutation = useMarkNotificationAsRead();
    const markAllAsReadMutation = useMarkAllNotificationsAsRead();
    const deleteNotificationMutation = useDeleteNotification();

    const [activeFilter, setActiveFilter] = useState<NotificationType | 'all'>('all');
    const [refreshing, setRefreshing] = useState(false);
    const insets = useSafeAreaInsets();

    const mappedNotifications = useMemo(() => {
        if (!notificationsData) return [];
        const list = Array.isArray(notificationsData)
            ? notificationsData
            : ((notificationsData as any).data || []);
        return list.map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            time: formatTimeAgo(n.createdAt),
            read: n.read,
            type: mapBackendType(n.type)
        }));
    }, [notificationsData]);

    const filteredNotifications = useMemo(() => 
        mappedNotifications.filter((n) => activeFilter === 'all' || n.type === activeFilter),
        [mappedNotifications, activeFilter]
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } catch (e) {
            console.warn('Failed to refetch notifications:', e);
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    const markAllAsRead = useCallback(() => {
        safeLayoutAnimation();
        markAllAsReadMutation.mutate();
    }, [markAllAsReadMutation]);

    const markAsRead = useCallback((id: number) => {
        safeLayoutAnimation();
        markAsReadMutation.mutate(id);
    }, [markAsReadMutation]);

    const deleteNotification = useCallback((id: number) => {
        safeLayoutAnimation();
        deleteNotificationMutation.mutate(id);
    }, [deleteNotificationMutation]);

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
                    unreadCount > 0 ? (
                        <HeaderAction 
                            label="Mark Read"
                            onPress={markAllAsRead}
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
                                        ? 'bg-blue-600 border-blue-600'
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
                    {isLoading ? (
                        <View className="items-center justify-center py-20">
                            <ActivityIndicator size="large" color="#2563eb" />
                        </View>
                    ) : filteredNotifications.length === 0 ? (
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
                                    className="mt-6 bg-blue-50 dark:bg-slate-900 px-6 py-2.5 rounded-xl"
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
                                    style={({ pressed }) => [
                                        { opacity: pressed ? 0.9 : 1 },
                                        !item.read ? {
                                            shadowColor: '#2563eb',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.08,
                                            shadowRadius: 4,
                                            elevation: 2
                                        } : {
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 1 },
                                            shadowOpacity: 0.05,
                                            shadowRadius: 2,
                                            elevation: 1
                                        }
                                    ]}
                                    onPress={() => !item.read && markAsRead(item.id)}
                                    className={`relative overflow-hidden rounded-2xl border ${
                                        item.read 
                                            ? 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800' 
                                            : 'bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-900'
                                    }`}
                                >
                                    {!item.read && (
                                        <View className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                                    )}
                                    <View className="p-4">
                                        <View className="flex-row items-start">
                                            <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                                                item.read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-950'
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
                                                <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
                                                    <View className="flex-row items-center">
                                                        <View className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 mr-2" />
                                                        <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">{item.time}</Text>
                                                    </View>
                                                    {!item.read && (
                                                        <View className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 rounded-md">
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




