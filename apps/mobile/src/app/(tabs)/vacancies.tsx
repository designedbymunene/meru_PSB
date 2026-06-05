import { useVacancies, VacancyFilters } from '@/hooks/use-vacancies';
import { useNetInfo } from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import { Briefcase, Calendar, ChevronRight, Filter, MapPin, Search, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React, { useState, useMemo } from 'react';
import { FlatList, RefreshControl, Text, TextInput, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getApiErrorMessage, getNormalizedApiError } from '@/lib/api/client';
import { VacanciesListLoadingState } from '@/components/ui/loading-skeletons';
import { VacancyFilterSheet } from '@/components/vacancies/VacancyFilterSheet';
import { useDebounce } from '@/hooks/use-debounce';

export default function VacanciesScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [isFilterSheetVisible, setIsFilterSheetVisible] = useState(false);
    const [filters, setFilters] = useState<VacancyFilters>({
        status: 'open',
        departmentId: null,
        jobGroupId: null
    });

    const netInfo = useNetInfo();
    const insets = useSafeAreaInsets();
    
    const {
        data,
        isLoading,
        error,
        isError,
        refetch,
        isRefetching
    } = useVacancies({ ...filters, search: debouncedSearch });

    const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
    const normalizedError = error ? getNormalizedApiError(error) : null;
    const showOfflineBanner = isOffline || normalizedError?.isOffline;
    const errorMessage = isError ? getApiErrorMessage(error, 'Unable to load vacancies right now.') : null;

    const getStatusInfo = (status: string, closingDate: string) => {
        const isClosed = status?.toUpperCase() === 'CLOSED';
        const expiryDate = new Date(closingDate);
        expiryDate.setHours(23, 59, 59, 999);
        const isExpired = expiryDate < new Date();

        if (isClosed) return { label: 'Closed', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-100 dark:border-red-900/30' };
        if (isExpired) return { label: 'Expired', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-100 dark:border-orange-900/30' };
        return { label: 'Open', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-100 dark:border-green-900/30' };
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.status && filters.status !== 'open') count++;
        if (filters.departmentId) count++;
        if (filters.jobGroupId) count++;
        return count;
    }, [filters]);

    const vacancies = data || [];

    if (isLoading && !isRefetching && vacancies.length === 0 && !isError) {
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
                            <Pressable
                                onPress={() => setIsFilterSheetVisible(true)}
                                testID="vacancies-filter"
                                className={`w-10 h-10 rounded-full items-center justify-center border mt-1 ${
                                    activeFilterCount > 0
                                        ? 'bg-[#004aad] border-[#004aad]'
                                        : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                                }`}
                            >
                                <Filter size={18} color={activeFilterCount > 0 ? '#ffffff' : (isDarkMode ? '#ffffff' : '#0f172a')} />
                                {activeFilterCount > 0 && (
                                    <View className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full items-center justify-center border border-white">
                                        <Text className="text-white text-[8px] font-bold">{activeFilterCount}</Text>
                                    </View>
                                )}
                            </Pressable>
                        </View>

                        <View className="flex-row items-center bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 h-14 shadow-sm shadow-gray-100/50">
                            <Search size={20} color="#94a3b8" />
                            <TextInput
                                className="flex-1 ml-3 text-gray-900 dark:text-white text-base py-0"
                                placeholder="Search by position, dept..."
                                placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                testID="vacancies-search"
                            />
                            {searchQuery.length > 0 && (
                                <Pressable onPress={() => setSearchQuery('')} testID="vacancies-clear-search">
                                    <X size={18} color="#94a3b8" />
                                </Pressable>
                            )}
                        </View>
                    </View>
                }
                renderItem={({ item }) => {
                    const status = getStatusInfo(item.status, item.closingDate);
                    return (
                        <Pressable
                            className="bg-white dark:bg-gray-900 p-5 rounded-[28px] mb-5 shadow-sm border border-gray-100 dark:border-gray-800"
                            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                            onPress={() => router.push(`/vacancies/${item.id}`)}
                            testID={`vacancy-card-${item.id}`}
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
                        </Pressable>
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
                                : 'There are currently no job opportunities available matching your filters.'}
                        </Text>
                        {(isError || activeFilterCount > 0 || searchQuery) && (
                            <Pressable
                                onPress={() => {
                                    if (isError) refetch();
                                    else {
                                        setFilters({ status: 'open', departmentId: null, jobGroupId: null });
                                        setSearchQuery('');
                                    }
                                }}
                                className="mt-5 px-5 py-2.5 rounded-full bg-[#004aad] dark:bg-blue-600"
                                testID={isError ? 'vacancies-retry' : 'vacancies-clear-filters'}
                            >
                                <Text className="text-white font-semibold text-xs">
                                    {isError ? 'Try Again' : 'Clear Filters'}
                                </Text>
                            </Pressable>
                        )}
                    </View>
                }
            />

            <VacancyFilterSheet 
                isVisible={isFilterSheetVisible}
                onClose={() => setIsFilterSheetVisible(false)}
                filters={filters}
                onApply={setFilters}
                onReset={() => setFilters({ status: 'open', departmentId: null, jobGroupId: null })}
            />
        </View>
    );
}
