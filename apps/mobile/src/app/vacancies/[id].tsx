import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
    Briefcase, 
    Calendar, 
    ChevronLeft, 
    Clock, 
    Download, 
    FileText, 
    MapPin, 
    Share2, 
    Users,
    CheckCircle2,
    DollarSign,
    Info,
    Award,
    Building2,
    Clock3,
    ArrowRight,
    Scale
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { 
    ScrollView, 
    Text, 
    TouchableOpacity, 
    View, 
    Share,
    Alert,
    Dimensions,
    StatusBar
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '@/lib/api/client';
import { Header } from '@/components/ui/header';
import { VacancyDetailsLoadingState } from '@/components/ui/loading-skeletons';

const { width } = Dimensions.get('window');

export default function JobDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    const { data: job, isLoading, error, refetch } = useQuery({
        queryKey: ['vacancy', id],
        queryFn: async () => {
            const response = await apiClient.get(`/vacancies/${id}`);
            return response.data.data;
        },
    });

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this job opening: ${job.title} at Meru County Government. Apply before ${new Date(job.closingDate).toLocaleDateString()}`,
                title: job.title,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const getStatusInfo = (status: string, closingDate: string) => {
        const isClosed = status?.toUpperCase() === 'CLOSED';
        const isExpired = new Date(closingDate) < new Date();

        if (isClosed) return { label: 'Closed', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/40', border: 'border-red-200 dark:border-red-800' };
        if (isExpired) return { label: 'Expired', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/40', border: 'border-amber-200 dark:border-amber-800' };
        return { label: 'Active', color: 'text-white', bg: 'bg-emerald-600 dark:bg-emerald-500', border: 'border-emerald-700 dark:border-emerald-400' };
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
                    We couldn&apos;t retrieve the information for this vacancy. It may have been removed or you may be offline.
                </Text>
                <TouchableOpacity 
                    className="bg-[#004aad] px-8 py-3 rounded-2xl"
                    onPress={() => refetch()}
                >
                    <Text className="text-white font-bold">Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const status = getStatusInfo(job.status, job.closingDate);
    const isExpired = new Date(job.closingDate) < new Date() || job.status?.toUpperCase() === 'CLOSED';

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(parseFloat(amount));
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-950">
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <Header 
                title="Public Service Vacancy" 
                rightAction={
                    <TouchableOpacity onPress={handleShare} className="p-2">
                        <Share2 size={20} color={isDarkMode ? '#ffffff' : '#0f172a'} />
                    </TouchableOpacity>
                }
            />
            
            <ScrollView 
                className="flex-1" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 160 }}
            >
                {/* Official Title Card */}
                <View className="bg-[#004aad] dark:bg-blue-900 px-6 pt-8 pb-12 rounded-b-[40px] shadow-lg">
                    <View className="flex-row items-center mb-6">
                        <View className={`px-4 py-1.5 rounded-full ${status.bg} ${status.border} border shadow-sm`}>
                            <Text className={`text-[11px] font-black uppercase tracking-widest ${status.color}`}>
                                {status.label}
                            </Text>
                        </View>
                        <View className="ml-auto bg-blue-800/40 px-3 py-1.5 rounded-lg border border-blue-400/20">
                            <Text className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">
                                REF: {job.advertisementNumber}
                            </Text>
                        </View>
                    </View>

                    <Text className="text-3xl font-black text-white leading-[38px] mb-6">
                        {job.title}
                    </Text>

                    <View className="flex-row items-center">
                        <View className="bg-white/10 p-3 rounded-2xl mr-4 border border-white/10">
                            <Building2 size={24} color="#ffffff" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-blue-50 font-bold text-[16px]" numberOfLines={1}>
                                {job.department?.name}
                            </Text>
                            <Text className="text-blue-200/80 text-[11px] font-bold uppercase tracking-[1px] mt-0.5">
                                Meru County Public Service Board
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Priority Info Banner - Critical Info Pops Out Here */}
                <View className="px-4 -mt-8">
                    <View className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-2 flex-row border border-gray-100 dark:border-gray-800">
                        <View className="flex-1 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 items-center">
                            <Clock3 size={20} color="#d97706" />
                            <Text className="text-amber-800 dark:text-amber-400 text-[10px] font-black uppercase mt-1 mb-0.5">Deadline</Text>
                            <Text className="text-gray-900 dark:text-white font-black text-[14px]">
                                {new Date(job.closingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                            </Text>
                        </View>
                        <View className="w-[2px] bg-gray-50 dark:bg-gray-800 my-4" />
                        <View className="flex-1 p-4 items-center">
                            <Users size={20} color="#004aad" />
                            <Text className="text-gray-400 text-[10px] font-black uppercase mt-1 mb-0.5">Openings</Text>
                            <Text className="text-gray-900 dark:text-white font-black text-[14px]">{job.openPositions}</Text>
                        </View>
                        <View className="w-[2px] bg-gray-50 dark:bg-gray-800 my-4" />
                        <View className="flex-1 p-4 items-center">
                            <DollarSign size={20} color="#059669" />
                            <Text className="text-gray-400 text-[10px] font-black uppercase mt-1 mb-0.5">Scale</Text>
                            <Text className="text-gray-900 dark:text-white font-black text-[14px]">{job.jobGroup?.name || 'CPSB'}</Text>
                        </View>
                    </View>
                </View>

                {/* Main Content Sections */}
                <View className="px-6 mt-8">
                    {/* Salary Detail Box */}
                    {job.jobGroup?.salaryMin && (
                        <View className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 flex-row items-center mb-8 shadow-sm">
                            <View className="bg-emerald-600 p-3 rounded-2xl mr-4">
                                <Scale size={24} color="#ffffff" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-emerald-800 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-0.5">Monthly Remuneration</Text>
                                <Text className="text-gray-900 dark:text-white font-black text-[16px]">
                                    {formatCurrency(job.jobGroup.salaryMin)} - {formatCurrency(job.jobGroup.salaryMax)}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Description Card */}
                    <View className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 mb-8 shadow-sm">
                        <View className="flex-row items-center mb-5">
                            <View className="w-1.5 h-6 bg-blue-600 rounded-full mr-3" />
                            <Text className="text-xl font-black text-gray-900 dark:text-white">Job Summary</Text>
                        </View>
                        <Text className="text-gray-600 dark:text-gray-400 leading-7 text-[15px]">
                            {job.description}
                        </Text>
                    </View>

                    {/* Requirements Card - High Visibility */}
                    {job.jobRequirements && job.jobRequirements.length > 0 && (
                        <View className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 mb-8 shadow-sm">
                            <View className="flex-row items-center mb-5">
                                <View className="w-1.5 h-6 bg-emerald-600 rounded-full mr-3" />
                                <Text className="text-xl font-black text-gray-900 dark:text-white">Qualifications</Text>
                            </View>
                            <View className="space-y-4">
                                {job.jobRequirements.map((req, index) => (
                                    <View key={index} className="flex-row items-start bg-gray-50/80 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <View className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-lg mr-3 mt-0.5">
                                            <CheckCircle2 size={14} color="#059669" />
                                        </View>
                                        <Text className="flex-1 text-gray-700 dark:text-gray-300 leading-6 text-[14px] font-bold">{req}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Responsibilities Card */}
                    {job.jobResponsibilities && job.jobResponsibilities.length > 0 && (
                        <View className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 mb-8 shadow-sm">
                            <View className="flex-row items-center mb-5">
                                <View className="w-1.5 h-6 bg-amber-600 rounded-full mr-3" />
                                <Text className="text-xl font-black text-gray-900 dark:text-white">Key Duties</Text>
                            </View>
                            <View className="space-y-4">
                                {job.jobResponsibilities.map((resp, index) => (
                                    <View key={index} className="flex-row items-start">
                                        <Text className="text-blue-600 dark:text-blue-400 font-black mr-3 mt-0.5">0{index + 1}.</Text>
                                        <Text className="flex-1 text-gray-600 dark:text-gray-400 leading-6 text-[14px]">{resp}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Documents Section */}
                    {job.documents && job.documents.length > 0 && (
                        <View className="mb-12">
                            <Text className="text-lg font-black text-gray-900 dark:text-white mb-4 px-2">Official Documents</Text>
                            {job.documents.map((doc) => (
                                <TouchableOpacity 
                                    key={doc.id}
                                    className="flex-row items-center p-5 bg-white dark:bg-gray-900 rounded-[24px] border border-gray-100 dark:border-gray-800 mb-3 shadow-sm"
                                    activeOpacity={0.7}
                                >
                                    <View className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl mr-4">
                                        <FileText size={24} color="#ef4444" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-900 dark:text-white font-black text-sm" numberOfLines={1}>{doc.originalName}</Text>
                                        <Text className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-black mt-1">
                                            Official PDF • {(doc.fileSize / 1024).toFixed(1)} KB
                                        </Text>
                                    </View>
                                    <View className="bg-blue-50 dark:bg-blue-900/30 p-2.5 rounded-xl">
                                        <Download size={20} color="#004aad" />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* High-Impact Bottom Action Area */}
            <View 
                className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] px-6"
                style={{ paddingBottom: Math.max(insets.bottom, 24), paddingTop: 20 }}
            >
                <View className="flex-row items-center justify-between mb-4">
                    <View>
                        <Text className="text-gray-400 text-[10px] font-black uppercase">Closing Date</Text>
                        <Text className="text-gray-900 dark:text-white font-black text-[15px]">
                            {new Date(job.closingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </Text>
                    </View>
                    {!isExpired && !job.hasApplied && (
                        <View className="bg-amber-100 px-3 py-1 rounded-full">
                            <Text className="text-amber-700 text-[9px] font-black uppercase">Limited Spots</Text>
                        </View>
                    )}
                </View>

                {job.hasApplied ? (
                    <View className="bg-emerald-600 flex-row items-center justify-center h-[64px] rounded-2xl shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 size={24} color="#ffffff" />
                        <Text className="text-white font-black ml-3 uppercase tracking-widest text-sm">Application Received</Text>
                    </View>
                ) : (
                    <TouchableOpacity 
                        className={`h-[64px] rounded-2xl items-center justify-center flex-row shadow-2xl ${isExpired ? 'bg-gray-200 dark:bg-gray-800' : 'bg-[#004aad] shadow-blue-500/40'}`}
                        disabled={isExpired}
                        onPress={() => router.push(`/apply/${job.id}`)}
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-black uppercase tracking-[3px] text-[15px]">
                            {isExpired ? 'CLOSED' : 'APPLY NOW'}
                        </Text>
                        {!isExpired && <ArrowRight size={20} color="#ffffff" className="ml-3" />}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
