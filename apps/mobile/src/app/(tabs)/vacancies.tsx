import { useQuery } from '@tanstack/react-query';
import { useNetInfo } from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import { Briefcase, Calendar, ChevronRight, Filter, MapPin, Search, Users } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React, { useState } from 'react';
import { FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient, getApiErrorMessage, getNormalizedApiError } from '@/lib/api/client';
import { VacanciesListLoadingState } from '@/components/ui/loading-skeletons';

export default function VacanciesScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const [searchQuery, setSearchQuery] = useState('');
    const netInfo = useNetInfo();
    const insets = useSafeAreaInsets();
    const {
        data,
        isLoading,
        error,
        isError,
        refetch,
        isRefetching
    } = useQuery({
        queryKey: ['vacancies'],
        queryFn: async () => {
            const response = await apiClient.get('/vacancies');
            return response.data.data;
        },
    });
    const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
    const normalizedError = error ? getNormalizedApiError(error) : null;
    const showOfflineBanner = isOffline || normalizedError?.isOffline;
    const errorMessage = isError ? getApiErrorMessage(error, 'Unable to load vacancies right now.') : null;

    const getStatusInfo = (status: string, closingDate: string) => {
        const isClosed = status?.toUpperCase() === 'CLOSED';
        const isExpired = new Date(closingDate) < new Date();

        if (isClosed) return { label: 'Closed', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-100 dark:border-red-900/30' };
        if (isExpired) return { label: 'Expired', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-100 dark:border-orange-900/30' };
        return { label: 'Open', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-100 dark:border-green-900/30' };
    };

    const vacancies = data || [];

    if (isLoading && vacancies.length === 0 && !isError) {
        return <VacanciesListLoadingState />;
    }

    return (
        <View className="flex-1 bg-white dark:bg-gray-950">
            <FlatList
                data={vacancies}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                }
                ListHeaderComponent={
                    <View className="mb-8 pt-6">
                        {showOfflineBanner && (
                            <View className="mb-4 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50">
                                <Text className="text-amber-700 text-xs font-semibold">
                                    You&apos;re offline. Showing cached vacancies where available.
                                </Text>
                            </View>
                        )}

                        <View className="flex-row justify-between items-start mb-6">
                            <View className="flex-1 pr-3">
                                <Text className="text-3xl font-black text-gray-900 dark:text-white">Job Vacancies</Text>
                                <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-2">
                                    Find your next career opportunity in Meru County
                                </Text>
                            </View>
                            <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-900 items-center justify-center border border-gray-100 dark:border-gray-800 mt-1">
                                <Filter size={18} color={isDarkMode ? '#ffffff' : '#0f172a'} />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row items-center bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 h-14 shadow-sm shadow-gray-100/50">
                            <Search size={20} color="#94a3b8" />
                            <TextInput
                                className="flex-1 ml-3 text-gray-900 dark:text-white text-base py-0"
                                placeholder="Search by position, dept..."
                                placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            <View className="bg-gray-200 dark:bg-gray-800 h-6 w-[1px] mx-2" />
                            <Users size={18} color="#64748b" />
                        </View>
                    </View>
                }
                renderItem={({ item }) => {
                    const status = getStatusInfo(item.status, item.closingDate);
                    return (
                        <TouchableOpacity
                            className="bg-white dark:bg-gray-900 p-5 rounded-[28px] mb-5 shadow-sm border border-gray-100 dark:border-gray-800"
                            activeOpacity={0.7}
                            onPress={() => router.push(`/vacancies/${item.id}`)}
                        >
                            <View className="flex-row justify-between items-start mb-4">
                                <View className="flex-1 mr-3">
                                    <View className={`self-start px-2.5 py-1 rounded-lg border ${status.bg} ${status.border} mb-3`}>
                                        <Text className={`text-[10px] font-black uppercase tracking-wider ${status.color}`}>
                                            {status.label}
                                        </Text>
                                    </View>
                                    <Text className="text-lg font-black text-gray-900 dark:text-white leading-tight" numberOfLines={2}>
                                        {item.title}
                                    </Text>
                                </View>
                                <View className="bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl">
                                    <Briefcase size={20} color={isDarkMode ? '#3b82f6' : '#004aad'} />
                                </View>
                            </View>

                            <Text className="text-gray-500 dark:text-gray-400 text-xs leading-5 mb-5" numberOfLines={2}>
                                {item.description || 'No description available for this position.'}
                            </Text>

                            <View className="flex-row items-center flex-wrap mb-6 -mx-2">
                                <View className="flex-row items-center mx-2 my-1">
                                    <MapPin size={12} color="#64748b" />
                                    <Text className="text-gray-500 dark:text-gray-400 text-[11px] font-medium ml-1.5">{item.department?.name || 'Public Service'}</Text>
                                </View>
                                <View className="flex-row items-center mx-2 my-1">
                                    <Users size={12} color="#64748b" />
                                    <Text className="text-gray-500 dark:text-gray-400 text-[11px] font-medium ml-1.5">{item.openPositions} Position{item.openPositions !== 1 ? 's' : ''}</Text>
                                </View>
                                <View className="flex-row items-center mx-2 my-1">
                                    <Calendar size={12} color="#64748b" />
                                    <Text className="text-gray-500 dark:text-gray-400 text-[11px] font-medium ml-1.5">
                                        Closing: {new Date(item.closingDate).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                                <Text className="text-[#004aad] dark:text-blue-400 font-black text-xs uppercase tracking-widest">View Details</Text>
                                <View className="bg-gray-900 dark:bg-blue-600 w-8 h-8 rounded-full items-center justify-center">
                                    <ChevronRight size={16} color="white" />
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                     <View className="items-center justify-center py-20 px-10">
                        <View className="bg-gray-50 dark:bg-gray-900 p-6 rounded-full mb-4">
                            <Briefcase size={40} color="#94a3b8" />
                        </View>
                        <Text className="text-gray-900 dark:text-white font-bold text-lg text-center">
                            {isError ? 'Unable to Load Vacancies' : 'No Active Vacancies'}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-sm text-center mt-2 leading-5">
                            {isError
                                ? errorMessage
                                : 'There are currently no job opportunities available. Please check back later.'}
                        </Text>
                        {isError && (
                            <TouchableOpacity
                                onPress={() => refetch()}
                                className="mt-5 px-5 py-2.5 rounded-full bg-[#004aad] dark:bg-blue-600"
                            >
                                <Text className="text-white font-semibold text-xs">Try Again</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
            />
        </View>
    );
}
