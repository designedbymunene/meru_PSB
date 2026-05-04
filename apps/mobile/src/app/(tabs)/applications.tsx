import React from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNetInfo } from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import { apiClient, getApiErrorMessage, getNormalizedApiError } from '@/lib/api/client';
import { Calendar, Info, ChevronRight, FileText } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { ApplicationsListLoadingState } from '@/components/ui/loading-skeletons';

export default function ApplicationsScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const netInfo = useNetInfo();
    const insets = useSafeAreaInsets();
    const { data, isLoading, error, isError, refetch, isRefetching } = useQuery({
        queryKey: ['applications'],
        queryFn: async () => {
            const response = await apiClient.get('/applications');
            return response.data.data;
        },
    });
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
            case 'pending': return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/30';
            case 'reviewed': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
            case 'accepted': return 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30';
            case 'rejected': return 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30';
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
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        onPress={() => router.push(`/applications/${item.id}`)}
                        activeOpacity={0.7}
                        className="bg-white dark:bg-gray-900 p-4 rounded-2xl mb-4 shadow-sm border border-gray-100 dark:border-gray-800"
                    >
                        <View className="flex-row justify-between items-start mb-3">
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-gray-900 dark:text-white">{item.vacancy?.title}</Text>
                                <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">Ref: {item.vacancy?.refNumber || 'N/A'}</Text>
                            </View>
                            <View className={`px-3 py-1 rounded-full border ${getStatusStyles(item.status)}`}>
                                <Text className={`text-[10px] font-black uppercase tracking-wider ${getStatusStyles(item.status).split(' ').find(c => c.startsWith('text-'))}`}>
                                    {item.status}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row justify-between items-center pt-3 border-t border-gray-50 dark:border-gray-800">
                            <View className="flex-row items-center">
                                <Calendar size={14} color="#64748b" />
                                <Text className="text-gray-500 dark:text-gray-400 text-xs ml-1">Applied on: {new Date(item.createdAt).toLocaleDateString()}</Text>
                            </View>
                            <ChevronRight size={16} color="#94a3b8" />
                        </View>
                    </TouchableOpacity>
                )}
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
