import { useApplications } from '@/hooks/use-applications';
import { useVacancies } from '@/hooks/use-vacancies';
import { useNetInfo } from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import { Bell, Briefcase, Calendar, CheckCircle, ChevronRight, Clock, FileText, MapPin, Search } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React, { useMemo } from 'react';
import { Image, RefreshControl, ScrollView, Text, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header, HeaderAction } from '@/components/ui/header';
import { useAuth } from '@/context/auth-context';
import { getApiErrorMessage, getNormalizedApiError, getAvatarUrl } from '@/lib/api/client';
import { DashboardLoadingState } from '@/components/ui/loading-skeletons';

export default function DashboardScreen() {
    const { user } = useAuth();
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const router = useRouter();
    const netInfo = useNetInfo();
    const [refreshing, setRefreshing] = React.useState(false);
    const insets = useSafeAreaInsets();

    const {
        data: applications,
        error: applicationsError,
        isError: hasApplicationsError,
        refetch: refetchApplications,
        isLoading: isApplicationsLoading,
    } = useApplications();

    const {
        data: vacancies,
        error: vacanciesError,
        isError: hasVacanciesError,
        refetch: refetchVacancies,
        isLoading: isVacanciesLoading,
    } = useVacancies();

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([refetchApplications(), refetchVacancies()]);
        } finally {
            setRefreshing(false);
        }
    }, [refetchApplications, refetchVacancies]);

    const activeApp = useMemo(() => {
        const app = applications?.[0];
        if (!app) return null;

        // If API already provides these, use them
        if (app.progress !== undefined && app.nextStep) return app;

        // Otherwise calculate them (mirrors TrackApplicationScreen logic)
        const status = (app.status || 'pending').toLowerCase();
        let progress = 0;
        let nextStep = 'Application in review';

        if (status === 'pending') {
            progress = 30;
            nextStep = 'Undergoing preliminary review';
        } else if (status === 'reviewed') {
            progress = 50;
            nextStep = 'Shortlisting in progress';
        } else if (status === 'accepted') {
            progress = 100;
            nextStep = 'Application successful';
        } else if (status === 'rejected') {
            progress = 100;
            nextStep = 'Final decision reached';
        }

        return { ...app, progress, nextStep };
    }, [applications]);

    if ((isApplicationsLoading || isVacanciesLoading) && !applications && !vacancies) {
        return <DashboardLoadingState />;
    }

    const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
    const applicationsNormalizedError = applicationsError ? getNormalizedApiError(applicationsError) : null;
    const vacanciesNormalizedError = vacanciesError ? getNormalizedApiError(vacanciesError) : null;
    const showOfflineBanner = isOffline || applicationsNormalizedError?.isOffline || vacanciesNormalizedError?.isOffline;
    const applicationsErrorMessage = hasApplicationsError
        ? getApiErrorMessage(applicationsError, 'Unable to load your applications right now.')
        : null;
    const vacanciesErrorMessage = hasVacanciesError
        ? getApiErrorMessage(vacanciesError, 'Unable to load vacancies right now.')
        : null;

    const stats = [
        { label: 'Applied', value: applications?.length || 0, icon: <FileText size={16} color="#004aad" />, bg: 'bg-blue-50/50', path: '/applications' },
        { label: 'Shortlisted', value: '0', icon: <CheckCircle size={16} color="#16a34a" />, bg: 'bg-green-50/50', path: '/applications' },
        { label: 'Interviews', value: '0', icon: <Clock size={16} color="#f59e0b" />, bg: 'bg-orange-50/50', path: '/applications' },
        { label: 'Saved', value: '0', icon: <Bell size={16} color="#6366f1" />, bg: 'bg-indigo-50/50', path: '/vacancies' },
    ];

    return (
        <View className="flex-1 bg-white dark:bg-gray-950">
            <Header
                title="Meru County PSB"
                subtitle="Public Service Board"
                showBackButton={false}
                leftAction={
                    <View className="w-10 h-10 bg-slate-50 dark:bg-gray-900 rounded-xl items-center justify-center border border-gray-100 dark:border-gray-800">
                        <Image 
                            source={require('../../../assets/branding/merucountylogo.png')} 
                            style={{ width: 24, height: 24 }}
                            contentFit="contain"
                        />
                    </View>
                }
                rightAction={
                    <View className="flex-row items-center gap-2">
                        <HeaderAction
                            icon={<Bell size={20} color={isDarkMode ? '#ffffff' : '#0f172a'} />}
                            onPress={() => router.push('/notifications')}
                        />
                        <Pressable
                            onPress={() => router.push('/profile')}
                            className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-900 items-center justify-center border border-gray-100 dark:border-gray-800 overflow-hidden"
                        >
                            <Image source={{ uri: getAvatarUrl(user?.avatar, user?.fullName) }} className="w-full h-full" />
                        </Pressable>
                    </View>
                }
            />
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            >
                <View className="p-5">
                    {showOfflineBanner && (
                        <View className="mb-6 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50">
                            <Text className="text-amber-700 text-xs font-semibold">
                                You&apos;re offline. Showing cached dashboard data where available.
                            </Text>
                        </View>
                    )}

                    {/* Welcome Section & Search Icon Row */}
                    <View className="flex-row justify-between items-center mb-8">
                        <View>
                            <Text className="text-gray-400 dark:text-gray-500 text-sm font-medium">Welcome back,</Text>
                            <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{user?.fullName?.split(' ')[0] || 'Applicant'} 👋</Text>
                        </View>
                        <Pressable
                            onPress={() => router.push('/vacancies')}
                            className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-900 items-center justify-center border border-gray-100 dark:border-gray-800"
                        >
                            <Search size={22} color={isDarkMode ? '#ffffff' : '#0f172a'} />
                        </Pressable>
                    </View>

                    {/* Quick Stats - Wrapped Grid (2x2) */}
                    <View className="flex-row flex-wrap mb-10 -mx-1.5">
                        {stats.map((stat, idx) => (
                            <View key={idx} className="w-1/2 p-1.5">
                                <Pressable
                                    onPress={() => router.push(stat.path as any)}
                                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                                    className={`flex-row items-center ${stat.bg} dark:bg-gray-900/50 px-3 py-4 rounded-2xl border border-gray-100/50 dark:border-gray-800`}
                                >
                                    <View className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm">
                                        {stat.icon}
                                    </View>
                                    <View className="ml-3">
                                        <Text className="text-base font-bold text-gray-900 dark:text-white leading-tight">{stat.value}</Text>
                                        <Text className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-tight">{stat.label}</Text>
                                    </View>
                                </Pressable>
                            </View>
                        ))}
                    </View>

                    {/* Active Application Card - Minimalist yet Captivating */}
                    <View className="mb-10">
                        <View className="flex-row justify-between items-center mb-5 px-1">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white">Ongoing Activity</Text>
                            <Pressable onPress={() => router.push('/applications')}>
                                <Text className="text-[#004aad] dark:text-blue-400 font-bold text-xs">View All</Text>
                            </Pressable>
                        </View>

                        {activeApp ? (
                            <View className="bg-gray-900 p-5 rounded-[28px] shadow-lg shadow-gray-200 relative overflow-hidden">
                                <View className="flex-row justify-between items-start mb-4">
                                    <View className="flex-1 mr-3">
                                        <View className="bg-white/10 self-start px-2 py-0.5 rounded-full mb-2">
                                            <Text className="text-white/80 text-[9px] font-bold tracking-wider">{activeApp.statusLabel || activeApp.status}</Text>
                                        </View>
                                        <Text className="text-white text-base font-bold" numberOfLines={1}>{activeApp.vacancy?.title || 'Application'}</Text>
                                        <Text className="text-white/50 text-[11px] mt-1" numberOfLines={1}>
                                            {activeApp.vacancy?.department?.name || 'Department'}
                                        </Text>
                                    </View>
                                    <View className="bg-white/10 p-3 rounded-2xl">
                                        <Briefcase size={20} color="white" />
                                    </View>
                                </View>

                                <View className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <View className="flex-row justify-between items-center mb-3">
                                        <View className="flex-row items-center">
                                            <View className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2" />
                                            <Text className="text-white/90 font-semibold text-xs">{activeApp.nextStep || 'Application in review'}</Text>
                                        </View>
                                        <Text className="text-white font-bold text-xs">{activeApp.progress || 0}%</Text>
                                    </View>
                                    <View className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <View className="h-full bg-blue-500 rounded-full" style={{ width: `${activeApp.progress || 0}%` }} />
                                    </View>
                                </View>

                                <Pressable
                                    onPress={() => router.push(`/applications/${activeApp.id}`)}
                                    className="flex-row items-center justify-center mt-5 py-1"
                                >
                                    <Text className="text-white font-bold text-xs mr-2">Track Application</Text>
                                    <ChevronRight size={14} color="white" />
                                </Pressable>
                            </View>
                        ) : (
                            <View className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-3xl">
                                <Text className="text-gray-900 dark:text-white font-bold text-sm">
                                    {hasApplicationsError ? 'Unable to load ongoing activity' : 'No ongoing application activity yet'}
                                </Text>
                                <Text className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                                    {hasApplicationsError
                                        ? applicationsErrorMessage
                                        : 'When you submit an application, progress updates will appear here.'}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Recommended Jobs */}
                    <View className="mb-10">
                        <View className="flex-row justify-between items-center mb-6 px-1">
                            <View>
                                <Text className="text-xl font-extrabold text-gray-900 dark:text-white">Recommended Jobs</Text>
                                <Text className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">Based on your preferences</Text>
                            </View>
                            <Pressable
                                onPress={() => router.push('/vacancies')}
                                className="w-9 h-9 rounded-full bg-gray-50 dark:bg-gray-900 items-center justify-center border border-gray-100 dark:border-gray-800"
                            >
                                <ChevronRight size={18} color="#004aad" className="dark:text-blue-400" />
                            </Pressable>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
                            {(vacancies || []).map((item: any, idx: number) => {
                                const expiryDate = new Date(item.closingDate);
                                expiryDate.setHours(23, 59, 59, 999);
                                const isExpired = expiryDate < new Date();
                                const isClosed = item.status?.toUpperCase() === 'CLOSED';
                                const statusLabel = isClosed ? 'Closed' : isExpired ? 'Expired' : 'Open';
                                const statusColor = isClosed ? 'text-red-600' : isExpired ? 'text-orange-600' : 'text-green-600';
                                const statusBg = isClosed ? 'bg-red-50' : isExpired ? 'bg-orange-50' : 'bg-green-50';

                                return (
                                    <View key={idx} className="bg-white dark:bg-gray-900 p-5 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 w-72 mr-4">
                                        <View className="flex-row justify-between items-center mb-4">
                                            <View className={`${statusBg} dark:bg-opacity-10 px-3 py-1 rounded-lg`}>
                                                <Text className={`${statusColor} text-[9px] font-black uppercase tracking-wider`}>{statusLabel}</Text>
                                            </View>
                                            <Pressable className="bg-gray-50 dark:bg-gray-800 p-2 rounded-full">
                                                <Briefcase size={16} color="#94a3b8" />
                                            </Pressable>
                                        </View>
                                        <Text className="text-lg font-extrabold text-gray-900 dark:text-white mb-2 h-12" numberOfLines={2}>{item.title || 'Position Title'}</Text>

                                        <View className="space-y-2.5 mb-6">
                                            <View className="flex-row items-center">
                                                <MapPin size={12} color="#64748b" />
                                                <Text className="text-gray-500 dark:text-gray-400 text-[11px] ml-2 font-medium" numberOfLines={1}>
                                                    {item.department?.name || 'Public Service'}
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center">
                                                <Calendar size={12} color="#64748b" />
                                                <Text className="text-gray-500 dark:text-gray-400 text-[11px] ml-2 font-medium">
                                                    Closing: {new Date(item.closingDate).toLocaleDateString()}
                                                </Text>
                                            </View>
                                        </View>

                                        <Pressable
                                            onPress={() => router.push(`/vacancies/${item.id}`)}
                                            className="bg-gray-900 dark:bg-blue-600 py-3.5 rounded-2xl items-center shadow-md shadow-gray-200 dark:shadow-none"
                                        >
                                            <Text className="text-white font-bold text-xs">View Details</Text>
                                        </Pressable>
                                    </View>
                                );
                            })}
                            {(!vacancies || vacancies.length === 0) && (
                                <View className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-3xl w-72">
                                    <Text className="text-gray-900 dark:text-white font-bold text-sm">
                                        {hasVacanciesError ? 'Unable to load vacancies' : 'No recommended jobs available'}
                                    </Text>
                                    <Text className="text-gray-500 dark:text-gray-400 text-xs mt-2 leading-5">
                                        {hasVacanciesError
                                            ? vacanciesErrorMessage
                                            : 'Try refreshing later to see new opportunities.'}
                                    </Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>

                    <View className="items-center mb-5">
                        <Text className="text-gray-300 dark:text-gray-700 text-[9px] font-bold uppercase tracking-widest">
                            Meru County PSB • 2026
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
