import React, { useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApplication } from '@/hooks/use-applications';
import { useNetInfo } from '@react-native-community/netinfo';
import { useColorScheme } from 'nativewind';
import { 
    Clock, Calendar, Building2, 
    ChevronLeft, Navigation, 
    CheckCircle2, ArrowRight,
    Info, AlertCircle, WifiOff
} from 'lucide-react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withRepeat, 
    withTiming, 
    withSequence
} from 'react-native-reanimated';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ApplicationDetailsLoadingState } from '@/components/ui/loading-skeletons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LIGHT_THEME = {
    bg: '#f9fafb',
    card: '#ffffff',
    border: 'rgba(229, 231, 235, 0.8)',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    accentBlue: '#3b82f6',
    accentGreen: '#10b981',
    accentPurple: '#8b5cf6',
    accentOrange: '#f59e0b',
};

const DARK_THEME = {
    bg: '#0f172a',
    card: '#1e293b',
    border: 'rgba(30, 41, 59, 0.6)',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    accentBlue: '#3b82f6',
    accentGreen: '#10b981',
    accentPurple: '#8b5cf6',
    accentOrange: '#f59e0b',
};

const PulseCircle = ({ color }: { color: string }) => {
    const pulse = useSharedValue(1);

    useEffect(() => {
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            true
        );
    }, [pulse]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
        opacity: 0.6 / pulse.value,
        backgroundColor: color,
    }));

    return (
        <View className="items-center justify-center">
            <Animated.View 
                style={[{ width: 24, height: 24, borderRadius: 12, position: 'absolute' }, animatedStyle]} 
            />
            <View 
                style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color, borderWidth: 2, borderColor: '#fff' }} 
            />
        </View>
    );
};

const ScreenState = ({
    icon: Icon,
    title,
    description,
    primaryLabel,
    primaryAction,
    secondaryLabel,
    secondaryAction,
}: {
    icon: React.ComponentType<{ size?: number; color?: string }>;
    title: string;
    description: string;
    primaryLabel: string;
    primaryAction: () => void;
    secondaryLabel?: string;
    secondaryAction?: () => void;
}) => (
    <View className="flex-1 bg-[#0a0c10] items-center justify-center px-6">
        <View className="w-full max-w-md rounded-[32px] border border-slate-800 bg-[#11141d] p-6">
            <View className="w-16 h-16 rounded-2xl items-center justify-center bg-blue-500/10 border border-blue-500/20 mb-5">
                <Icon size={28} color={THEME.accentBlue} />
            </View>
            <Text className="text-white text-2xl font-black">{title}</Text>
            <Text className="text-slate-400 text-sm mt-3 leading-6">{description}</Text>
            <View className="mt-6 flex-row gap-3">
                <TouchableOpacity
                    onPress={primaryAction}
                    className="flex-1 rounded-2xl bg-blue-600 px-4 py-4 items-center justify-center"
                >
                    <Text className="text-white font-black text-xs uppercase tracking-wider">{primaryLabel}</Text>
                </TouchableOpacity>
                {secondaryLabel && secondaryAction && (
                    <TouchableOpacity
                        onPress={secondaryAction}
                        className="flex-1 rounded-2xl bg-white/5 px-4 py-4 items-center justify-center border border-white/10"
                    >
                        <Text className="text-white font-black text-xs uppercase tracking-wider">{secondaryLabel}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    </View>
);

export default function TrackApplicationScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const netInfo = useNetInfo();
    const insets = useSafeAreaInsets();
    const { colorScheme } = useColorScheme();
    
    // Robust ID handling
    const applicationId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);
    const isValidId = !!applicationId && applicationId !== 'active' && applicationId !== 'undefined';

    const { data: application, isLoading, isError, refetch } = useApplication(applicationId as string, {
        enabled: isValidId
    });

    const isDarkMode = colorScheme === 'dark';
    const THEME = isDarkMode ? DARK_THEME : LIGHT_THEME;
    const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
    const displayData = application;

    const safeParseDate = (dateStr: string | undefined) => {
        if (!dateStr) return null;
        try {
            const parsed = parseISO(dateStr);
            return isNaN(parsed.getTime()) ? null : parsed;
        } catch {
            return null;
        }
    };

    const daysSinceApplied = useMemo(() => {
        const date = safeParseDate(displayData?.appliedAt);
        if (!date) return 0;
        return Math.max(0, differenceInDays(new Date(), date));
    }, [displayData]);

    const stages = useMemo(() => {
        if (!displayData) return [];
        const status = (displayData.status || 'pending').toLowerCase();
        
        const steps = [
            { title: 'Submitted', est: 'Day 0', rank: 0 },
            { title: 'Under Review', est: '2-5 days', rank: 1 },
            { title: 'Shortlisted', est: '7-14 days', rank: 2 },
            { title: 'Interview', est: '14-21 days', rank: 3 },
            { title: 'Final Decision', est: '30 days', rank: 4 }
        ];

        const statusRankMap: Record<string, number> = {
            pending: 1,
            under_review: 1,
            reviewed: 1,
            shortlisted: 2,
            interviewed: 3,
            offered: 4,
            accepted: 4,
            rejected: 4
        };

        const currentRank = statusRankMap[status] ?? 1;

        return steps.map((step) => {
            let state: 'completed' | 'current' | 'upcoming' = 'upcoming';
            
            if (currentRank > step.rank) {
                state = 'completed';
            } else if (currentRank === step.rank) {
                state = 'current';
            } else {
                state = 'upcoming';
            }

            return { ...step, state };
        });
    }, [displayData]);

    const progressValue = useMemo(() => {
        if (!stages || stages.length === 0) return 0;
        const completedCount = stages.filter(s => s.state === 'completed').length;
        const currentIdx = stages.findIndex(s => s.state === 'current');
        const value = ((completedCount + (currentIdx !== -1 ? 0.5 : 0)) / stages.length) * 100;
        return isNaN(value) ? 0 : Math.min(100, Math.max(0, value));
    }, [stages]);

    if (isLoading && !displayData) {
        return <ApplicationDetailsLoadingState />;
    }

    if (!isValidId) {
        return (
            <ScreenState
                icon={AlertCircle}
                title="Invalid application"
                description="We couldn’t identify that application from the link you opened."
                primaryLabel="Go back"
                primaryAction={() => router.back()}
            />
        );
    }

    if ((isOffline || isError) && !displayData) {
        return (
            <ScreenState
                icon={WifiOff}
                title="Connection paused"
                description="This application can’t be refreshed right now. Once you’re back online, tap retry to continue."
                primaryLabel="Retry"
                primaryAction={() => refetch()}
                secondaryLabel="Go back"
                secondaryAction={() => router.back()}
            />
        );
    }

    const getStatusColor = (status: string | undefined) => {
        if (!status) return THEME.textSecondary;
        switch (status.toLowerCase()) {
            case 'pending': return THEME.accentBlue;
            case 'reviewed': return THEME.accentPurple;
            case 'accepted': return THEME.accentGreen;
            case 'rejected': return '#ef4444';
            default: return THEME.textSecondary;
        }
    };

    const currentStatus = displayData?.status?.toLowerCase() || 'pending';
    const displayStatusLabel = displayData?.statusLabel || displayData?.status || 'Pending';
    const isShortlisted = currentStatus === 'reviewed' || currentStatus === 'shortlisted';
    const isPending = currentStatus === 'pending';

    return (
        <View style={{ flex: 1, backgroundColor: THEME.bg }}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            
            {/* Custom Header */}
            <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 24, paddingBottom: 16 }}>
                <TouchableOpacity 
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full items-center justify-center mb-4"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: THEME.border }}
                >
                    <ChevronLeft size={20} color="#fff" />
                </TouchableOpacity>

                {/* Music Player Style Header */}
                <View style={{ backgroundColor: THEME.card, borderColor: THEME.border }} className="rounded-3xl p-4 border overflow-hidden">
                    <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2px] mb-2">
                        {displayData?.vacancy?.department?.name || 'PUBLIC SERVICE BOARD'}
                    </Text>
                    <Text className="text-white text-xl font-bold leading-tight">
                        {displayData?.vacancy?.title || 'Job Application'}
                    </Text>
                </View>
            </View>

            <ScrollView 
                className="flex-1 px-6" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Position Overview Card (2x2 Grid) */}
                <View 
                    style={{ backgroundColor: THEME.card, borderColor: THEME.border }}
                    className="rounded-3xl p-5 border mb-6"
                >
                    <View className="flex-row flex-wrap">
                        <View className="w-1/2 mb-5 pr-2">
                            <View className="flex-row items-center mb-1">
                                <Building2 size={14} color={THEME.accentBlue} />
                                <Text className="text-slate-500 text-[10px] font-bold uppercase ml-2 tracking-wider">Reference</Text>
                            </View>
                            <Text className="text-white text-xs font-bold ml-5">{displayData?.vacancy?.advertisementNumber || 'MCPSB/2024/001'}</Text>
                        </View>
                        
                        <View className="w-1/2 mb-5 pl-2">
                            <View className="flex-row items-center mb-1">
                                <Navigation size={14} color={THEME.accentPurple} />
                                <Text className="text-slate-500 text-[10px] font-bold uppercase ml-2 tracking-wider">Location</Text>
                            </View>
                            <Text className="text-white text-xs font-bold ml-5">{displayData?.vacancy?.location || 'Meru County'}</Text>
                        </View>

                        <View className="w-1/2 pr-2">
                            <View className="flex-row items-center mb-1">
                                <Clock size={14} color={THEME.accentOrange} />
                                <Text className="text-slate-500 text-[10px] font-bold uppercase ml-2 tracking-wider">Type</Text>
                            </View>
                            <Text className="text-white text-xs font-bold ml-5">Full Time</Text>
                        </View>

                        <View className="w-1/2 pl-2">
                            <View className="flex-row items-center mb-1">
                                <Calendar size={14} color={THEME.accentGreen} />
                                <Text className="text-slate-500 text-[10px] font-bold uppercase ml-2 tracking-wider">Applied</Text>
                            </View>
                            <Text className="text-white text-xs font-bold ml-5">
                                {displayData?.appliedAt ? format(parseISO(displayData.appliedAt), 'MMM dd, yyyy') : 'N/A'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Quick Stats Card */}
                <View 
                    style={{ backgroundColor: THEME.card, borderColor: THEME.border }}
                    className="rounded-3xl p-5 border mb-6"
                >
                    <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-slate-800/50">
                        <Text className="text-slate-400 text-sm font-medium">Current Status</Text>
                        <View 
                            className="px-3 py-1 rounded-full"
                            style={{ backgroundColor: getStatusColor(currentStatus) + '20' }}
                        >
                            <Text 
                                className="text-[10px] font-black tracking-wider"
                                style={{ color: getStatusColor(currentStatus) }}
                            >
                                {displayStatusLabel}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-slate-400 text-sm font-medium">Applied Date</Text>
                        <Text className="text-white text-sm font-bold">
                            {displayData?.appliedAt ? format(parseISO(displayData.appliedAt), 'MMM dd, yyyy') : 'N/A'}
                        </Text>
                    </View>

                    <View className="flex-row items-center justify-between">
                        <Text className="text-slate-400 text-sm font-medium">Days Since</Text>
                        <Text className="text-white text-sm font-bold">{daysSinceApplied} Days</Text>
                    </View>
                </View>

                {/* "What's Next?" Action Card */}
                {(isShortlisted || isPending) && (
                    <View
                        style={{ backgroundColor: isShortlisted ? '#059669' : '#2563eb' }}
                        className="rounded-3xl p-6 mb-6 overflow-hidden shadow-lg"
                    >
                        <View className="flex-row items-center mb-3">
                            <Info size={20} color="#fff" />
                            <Text className="text-white text-lg font-black ml-2">What&apos;s Next?</Text>
                        </View>
                        
                        <Text className="text-white/90 text-sm mb-6 leading-5">
                            {isShortlisted 
                                ? "Congratulations! Your profile has been shortlisted. We've prepared a comprehensive guide to help you ace your upcoming interview."
                                : "Your application is currently being reviewed by our HR department. This process typically takes between 7 to 14 business days."
                            }
                        </Text>

                        {isShortlisted ? (
                            <TouchableOpacity 
                                className="bg-white px-6 py-4 rounded-2xl flex-row items-center justify-center"
                                activeOpacity={0.8}
                                onPress={() => router.push(`/applications/prep-guide?id=${applicationId}`)}
                            >
                                <Text className="text-[#059669] font-black text-xs uppercase tracking-wider">View Interview Prep Guide</Text>
                                <ArrowRight size={16} color="#059669" className="ml-2" />
                            </TouchableOpacity>
                        ) : (
                            <View className="bg-white/20 px-4 py-3 rounded-2xl border border-white/30">
                                <Text className="text-white text-[10px] font-black uppercase tracking-widest text-center">
                                    EST. COMPLETION: {format(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Application Progress Timeline */}
                <View className="mt-4">
                    <Text className="text-white text-xl font-bold mb-6">Application Journey</Text>
                    
                    {/* Overall Progress Bar */}
                    <View className="h-1.5 w-full bg-slate-800 rounded-full mb-8 overflow-hidden">
                        <View 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${progressValue}%` }}
                        />
                    </View>

                    <View className="relative">
                        {/* Timeline Line */}
                        <View 
                            className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-slate-800"
                        />

                        {stages.map((stage, idx) => (
                            <View key={idx} className="flex-row mb-8 items-start">
                                <View className="z-10 bg-[#0a0c10] py-1">
                                    {stage.state === 'completed' ? (
                                        <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center">
                                            <CheckCircle2 size={14} color="#fff" />
                                        </View>
                                    ) : stage.state === 'current' ? (
                                        <PulseCircle color={THEME.accentBlue} />
                                    ) : (
                                        <View className="w-6 h-6 rounded-full border-2 border-slate-700 bg-slate-900" />
                                    )}
                                </View>
                                
                                <View className="ml-4 flex-1">
                                    <View className="flex-row items-center justify-between">
                                        <Text className={`font-bold ${stage.state === 'upcoming' ? 'text-slate-500' : 'text-white'}`}>
                                            {stage.title}
                                        </Text>
                                        <Text className="text-slate-500 text-[10px] font-medium">{stage.est}</Text>
                                    </View>
                                    
                                    {stage.state === 'current' && (
                                        <Text className="text-blue-400 text-xs mt-1">
                                            Active Stage • Undergoing Review
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
