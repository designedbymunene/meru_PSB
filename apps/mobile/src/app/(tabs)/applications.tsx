import React from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApplications } from '@/hooks/use-applications';
import { useNetInfo } from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import { getApiErrorMessage, getNormalizedApiError } from '@/lib/api/client';
import { Calendar, Info, ChevronRight, FileText, Building2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { ApplicationsListLoadingState } from '@/components/ui/loading-skeletons';

export default function ApplicationsScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const netInfo = useNetInfo();
    const insets = useSafeAreaInsets();
    const { data, isLoading, error, isError, refetch, isRefetching } = useApplications();
    const applications = data || [];
    const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
    const normalizedError = error ? getNormalizedApiError(error) : null;
    const showOfflineBanner = isOffline || normalizedError?.isOffline;
    const errorMessage = isError ? getApiErrorMessage(error, 'Unable to load your applications right now.') : null;

    if (isLoading && applications.length === 0 && !isError) {
        return <ApplicationsListLoadingState />;
    }

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
            case 'reviewed': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
            case 'accepted': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
            case 'rejected': return 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30';
            default: return 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700';
        }
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-950">
            <FlatList
                data={applications}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                }
                ListHeaderComponent={
                    <View className="mb-6 pt-6">
                        {showOfflineBanner && (
                            <View className="mb-4 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50">
                                <Text className="text-amber-700 text-xs font-semibold">
                                    You&apos;re offline. Showing cached applications where available.
                                </Text>
                            </View>
                        )}
                        <View className="mb-2">
                            <Text className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">My Applications</Text>
                            <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-2">
                                Track and manage your active job applications
                            </Text>
                        </View>
                    </View>
                }
                renderItem={({ item }) => {
                    const statusValue = (item.status || '').toLowerCase();
                    const statusLabel = item.statusLabel || item.status || 'Pending';

                    return (
                        <TouchableOpacity
                            onPress={() => router.push(`/applications/${item.id}`)}
                            activeOpacity={0.7}
                            className="bg-white dark:bg-gray-900 p-5 rounded-[32px] mb-4 border border-gray-100 dark:border-gray-800 shadow-sm"
                        >
                            <View className="flex-row justify-between items-start">
                                <View className="flex-1 mr-4">
                                    <View className="flex-row items-center mb-1.5">
                                        <View className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500 mr-2" />
                                        <Text className="text-gray-400 dark:text-gray-600 text-[10px] font-black uppercase tracking-[1.5px]">
                                            REF: {item.vacancy?.advertisementNumber || 'N/A'}
                                        </Text>
                                    </View>

                                    <Text className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
                                        {item.vacancy?.title}
                                    </Text>

                                    <View className="flex-row items-center">
                                        <View className="w-6 h-6 rounded-lg bg-gray-50 dark:bg-gray-800 items-center justify-center mr-2">
                                            <Building2 size={12} color={isDarkMode ? '#94a3b8' : '#64748b'} />
                                        </View>
                                        <Text className="text-gray-500 dark:text-gray-400 text-xs font-medium" numberOfLines={1}>
                                            {item.vacancy?.department?.name || 'Public Service Board'}
                                        </Text>
                                    </View>
                                </View>

                                <View className={`px-3 py-1.5 rounded-2xl border ${getStatusStyles(statusValue)}`}>
                                    <Text className={`text-[10px] font-black tracking-widest ${getStatusStyles(statusValue).split(' ').find(c => c.startsWith('text-'))}`}>
                                        {statusLabel}
                                    </Text>
                                </View>
                            </View>

                            <View className="mt-5 pt-4 border-t border-gray-50 dark:border-gray-800 flex-row justify-between items-center">
                                <View className="flex-row items-center bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full">
                                    <Calendar size={12} color="#64748b" />
                                    <Text className="text-gray-500 dark:text-gray-400 text-[10px] font-bold ml-1.5 uppercase">
                                        {new Date(item.appliedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </Text>
                                </View>

                                <View className="flex-row items-center">
                                    <Text className="text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase mr-1">Details</Text>
                                    <ChevronRight size={14} color={isDarkMode ? '#60a5fa' : '#004aad'} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View className="items-center justify-center py-20 px-10">
                        <View className="bg-gray-100 dark:bg-gray-900 p-6 rounded-full mb-4">
                            <FileText size={40} color="#94a3b8" />
                        </View>
                        <Text className="text-gray-900 dark:text-white font-bold text-lg text-center">
                            {isError ? 'Unable to load applications' : "No Active Applications"}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-sm text-center mt-2 leading-5">
                            {isError
                                ? errorMessage
                                : "You haven't applied for any vacancies yet. Once you apply for a job, it will appear here for you to track."}
                        </Text>
                        {isError && (
                            <TouchableOpacity
                                onPress={() => refetch()}
                                className="mt-6 px-6 py-3 rounded-full bg-[#004aad] dark:bg-blue-600"
                            >
                                <Text className="text-white font-bold text-xs uppercase tracking-widest">Try Again</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
            />
        </View>
    );
}
