import { useVacancy } from '@/hooks/use-vacancies';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ChevronLeft,
    Download,
    FileText,
    Share2,
    CheckCircle2,
    Info,
    Building2,
    ArrowRight
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import {
    ScrollView,
    Text,
    Pressable,
    View,
    Share,
    Dimensions,
    StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VacancyDetailsLoadingState } from '@/components/ui/loading-skeletons';

const { width } = Dimensions.get('window');

export default function JobDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    const { data: job, isLoading, error, refetch } = useVacancy(id as string);

    const handleShare = async () => {
        const webUrl = 'https://recruitment.merupublicserviceboard.or.ke';
        const shareUrl = `${webUrl}/vacancies/${id}`;
        
        try {
            await Share.share({
                message: `Check out this job opening: ${job.title} at Meru County Government. \n\nApply here: ${shareUrl} \n\nApply before ${new Date(job.closingDate).toLocaleDateString()}`,
                title: job.title,
                url: shareUrl, 
            });
        } catch (error) {
            console.error(error);
        }
    };

    const getStatusInfo = (status: string, closingDate: string) => {
        const isClosed = status?.toUpperCase() === 'CLOSED';
        const expiryDate = new Date(closingDate);
        expiryDate.setHours(23, 59, 59, 999);
        const isExpired = expiryDate < new Date();

        if (isClosed) return { label: 'Closed', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/20' };
        if (isExpired) return { label: 'Expired', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20' };
        return { label: 'Active', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' };
    };

    if (isLoading) {
        return <VacancyDetailsLoadingState />;
    }

    if (error || !job) {
        return (
            <View className="flex-1 justify-center items-center bg-white dark:bg-gray-950 p-6">
                <View className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full mb-4">
                    <Info size={40} color="#ef4444" />
                </View>
                <Text className="text-gray-900 dark:text-white font-bold text-lg text-center">Failed to load job details</Text>
                <Text className="text-gray-500 text-sm text-center mt-2 mb-6">
                    We couldn't retrieve the information for this vacancy.
                </Text>
                <Pressable
                    className="bg-gray-900 dark:bg-white px-8 py-3 rounded-2xl"
                    onPress={() => refetch()}
                    testID="vacancy-retry"
                >
                    <Text className="text-white dark:text-gray-900 font-bold">Try Again</Text>
                </Pressable>
            </View>
        );
    }

    const status = getStatusInfo(job.status, job.closingDate);
    const expiryDate = new Date(job.closingDate);
    expiryDate.setHours(23, 59, 59, 999);
    const isExpired = expiryDate < new Date() || job.status?.toUpperCase() === 'CLOSED';

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(parseFloat(amount));
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-950">
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            
            {/* Minimal Header - Adjusted height */}
            <View
                style={{ paddingTop: insets.top + 8 }}
                className="bg-white dark:bg-gray-950 px-6 pb-2 flex-row items-center justify-between border-b border-gray-50 dark:border-gray-900"
            >
                <Pressable
                    onPress={() => router.back()}
                    className="w-9 h-9 items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-full"
                    testID="vacancy-back"
                >
                    <ChevronLeft size={20} color={isDarkMode ? '#ffffff' : '#0f172a'} />
                </Pressable>

                <Text className="text-gray-900 dark:text-white font-bold text-sm">Vacancy Details</Text>

                <Pressable
                    onPress={handleShare}
                    className="w-9 h-9 items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-full"
                    testID="vacancy-share"
                >
                    <Share2 size={18} color={isDarkMode ? '#ffffff' : '#0f172a'} />
                </Pressable>
            </View>
            
            <ScrollView 
                className="flex-1" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Hero Section */}
                <View className="p-6">
                    <View className="flex-row items-center mb-4">
                        <View className={`px-2.5 py-0.5 rounded-full ${status.bg}`}>
                            <Text className={`text-[9px] font-black uppercase tracking-widest ${status.color}`}>
                                {status.label}
                            </Text>
                        </View>
                        <Text className="ml-3 text-gray-400 dark:text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                            REF: {job.advertisementNumber}
                        </Text>
                    </View>

                    <Text className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                        {job.title}
                    </Text>
                    
                    <View className="mt-4 flex-row items-center">
                        <View className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 items-center justify-center mr-3">
                            <Building2 size={16} color="#004aad" />
                        </View>
                        <Text className="text-gray-600 dark:text-gray-400 font-medium text-sm">
                            {job.department?.name}
                        </Text>
                    </View>
                </View>

                {/* Info Bar - Minimal Grid */}
                <View className="px-6 py-5 border-y border-gray-50 dark:border-gray-900 flex-row justify-between">
                    <View className="flex-1 items-start">
                        <Text className="text-gray-400 dark:text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-1">Deadline</Text>
                        <Text className="text-gray-900 dark:text-white font-bold text-sm">
                            {new Date(job.closingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Text>
                    </View>
                    <View className="flex-1 items-center border-x border-gray-50 dark:border-gray-900">
                        <Text className="text-gray-400 dark:text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-1">Openings</Text>
                        <Text className="text-gray-900 dark:text-white font-bold text-sm">{job.openPositions} Slots</Text>
                    </View>
                    <View className="flex-1 items-end">
                        <Text className="text-gray-400 dark:text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-1">Job Group</Text>
                        <Text className="text-gray-900 dark:text-white font-bold text-sm">{job.jobGroup?.name || 'N/A'}</Text>
                    </View>
                </View>

                <View className="p-6">
                    {/* Salary Info */}
                    {job.jobGroup?.salaryMin && (
                        <View className="mb-10 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl">
                            <Text className="text-gray-400 dark:text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-2">Monthly Remuneration</Text>
                            <View className="flex-row items-baseline">
                                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(job.jobGroup.salaryMin)}
                                </Text>
                                <Text className="mx-2 text-gray-400">-</Text>
                                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(job.jobGroup.salaryMax)}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Job Summary */}
                    <View className="mb-10">
                        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">Job Summary</Text>
                        <Text className="text-gray-600 dark:text-gray-400 leading-7 text-[16px]">
                            {job.description}
                        </Text>
                    </View>

                    {/* Qualifications */}
                    {job.jobRequirements && job.jobRequirements.length > 0 && (
                        <View className="mb-10">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Requirements</Text>
                            <View className="space-y-5">
                                {job.jobRequirements.map((req, index) => (
                                    <View key={index} className="flex-row items-start">
                                        <View className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-600 mr-4" />
                                        <Text className="flex-1 text-gray-600 dark:text-gray-400 leading-7 text-[16px]">
                                            {req}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Key Duties */}
                    {job.jobResponsibilities && job.jobResponsibilities.length > 0 && (
                        <View className="mb-10">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Responsibilities</Text>
                            <View className="space-y-5">
                                {job.jobResponsibilities.map((resp, index) => (
                                    <View key={index} className="flex-row items-start">
                                        <Text className="w-8 text-blue-600 dark:text-blue-500 font-bold text-[16px]">{(index + 1).toString().padStart(2, '0')}</Text>
                                        <Text className="flex-1 text-gray-600 dark:text-gray-400 leading-7 text-[16px]">
                                            {resp}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Official Documents */}
                    {job.documents && job.documents.length > 0 && (
                        <View className="mb-6">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Attachments</Text>
                            {job.documents.map((doc) => (
                                <Pressable
                                    key={doc.id}
                                    className="flex-row items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl mb-3"
                                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                                    testID={`vacancy-download-${doc.id}`}
                                >
                                    <FileText size={20} color={isDarkMode ? '#94a3b8' : '#64748b'} />
                                    <View className="flex-1 ml-4">
                                        <Text className="text-gray-900 dark:text-white font-bold text-xs" numberOfLines={1}>{doc.originalName}</Text>
                                        <Text className="text-gray-400 dark:text-gray-600 text-[10px] mt-0.5">
                                            PDF • {(doc.fileSize / 1024).toFixed(1)} KB
                                        </Text>
                                    </View>
                                    <Download size={18} color="#004aad" />
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Premium Sticky Bottom Bar */}
            <View
                className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-950/80 px-6 py-6 border-t border-gray-50 dark:border-gray-900"
                style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            >
                {job.hasApplied ? (
                    <View className="h-14 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl flex-row items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
                        <CheckCircle2 size={20} color="#10b981" />
                        <Text className="text-emerald-700 dark:text-emerald-500 font-bold ml-2">Application Submitted</Text>
                    </View>
                ) : (
                    <Pressable
                        className={`h-14 rounded-2xl items-center justify-center flex-row ${isExpired ? 'bg-gray-100 dark:bg-gray-900' : 'bg-gray-900 dark:bg-white'}`}
                        disabled={isExpired}
                        onPress={() => router.push(`/apply/${job.id}`)}
                        style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
                        testID="vacancy-apply"
                    >
                        <Text className={`font-bold tracking-widest text-sm ${isExpired ? 'text-gray-400' : 'text-white dark:text-gray-900'}`}>
                            {isExpired ? 'CLOSED' : 'APPLY FOR THIS ROLE'}
                        </Text>
                        {!isExpired && <ArrowRight size={18} color={isDarkMode ? '#0f172a' : '#ffffff'} className="ml-2" />}
                    </Pressable>
                )}
            </View>
        </View>
    );
}
