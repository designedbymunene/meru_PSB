import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, LayoutAnimation, ImageBackground, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApplication } from '@/hooks/use-applications';
import { useNetInfo } from '@react-native-community/netinfo';
import { 
    Clock, CheckCircle2, FileText, Calendar, MapPin, 
    ShieldCheck, AlertCircle, ChevronRight, Search, 
    ListFilter, Users, Award, Flag, ChevronDown, 
    Download, Info, Building2, Briefcase
} from 'lucide-react-native';
import { Header } from '@/components/ui/header';
import { getApiErrorMessage, getNormalizedApiError } from '@/lib/api/client';
import { ApplicationDetailsLoadingState } from '@/components/ui/loading-skeletons';
import { SnapshotCVViewer } from '@/components/profile/SnapshotCVViewer';
import { LinearGradient } from 'expo-linear-gradient';

export default function TrackApplicationScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const netInfo = useNetInfo();
    const [showSnapshot, setShowSnapshot] = useState(false);
    const isActivePlaceholder = id === 'active';

    const { data: application, isLoading, error, isError, refetch } = useApplication(id as string, {
        enabled: !!id && !isActivePlaceholder
    });

    const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
    const normalizedError = error ? getNormalizedApiError(error) : null;
    const showOfflineBanner = isOffline || normalizedError?.isOffline;
    const errorMessage = isError ? getApiErrorMessage(error, 'Unable to load this application right now.') : null;

    const displayData = application;

    // Derived recruitment stages
    const stages = useMemo(() => {
        if (!displayData) return [];
        const status = displayData.status.toLowerCase();
        
        return [
            { id: 1, title: 'Submitted', subtitle: 'Application received', status: 'completed', icon: CheckCircle2 },
            { id: 2, title: 'Screening', subtitle: 'Document verification', status: status === 'pending' ? 'current' : 'completed', icon: Search },
            { id: 3, title: 'Shortlisting', subtitle: 'Candidate selection', status: status === 'reviewed' ? 'current' : (status === 'accepted' || status === 'rejected' ? 'completed' : 'upcoming'), icon: ListFilter },
            { id: 4, title: 'Interview', subtitle: 'Technical assessment', status: (status === 'accepted' && !displayData.feedbackToApplicant) ? 'current' : (status === 'accepted' || status === 'rejected' ? 'completed' : 'upcoming'), icon: Users },
            { id: 5, title: 'Outcome', subtitle: 'Final decision', status: (status === 'accepted' || status === 'rejected') ? 'completed' : 'upcoming', icon: Flag },
        ];
    }, [displayData]);

    const currentStageIndex = stages.findIndex(s => s.status === 'current');
    const displayStageIndex = currentStageIndex !== -1 ? currentStageIndex : (stages.every(s => s.status === 'completed') ? stages.length - 1 : 0);

    if (isLoading && !displayData && !isError) {
        return <ApplicationDetailsLoadingState />;
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return '#f59e0b';
            case 'reviewed': return '#3b82f6';
            case 'accepted': return '#10b981';
            case 'rejected': return '#ef4444';
            default: return '#64748b';
        }
    };

    return (
        <View className="flex-1 bg-[#F8FAFC]">
            <StatusBar barStyle="light-content" />
            
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
                {/* Custom Header with Background */}
                <View>
                    <ImageBackground 
                        source={require('../../../assets/images/track-header-bg.png')}
                        className="h-72 w-full"
                    >
                        <LinearGradient
                            colors={['rgba(0,0,0,0.4)', 'rgba(248,250,252,1)']}
                            className="flex-1"
                        >
                            <View className="flex-1 p-6 justify-end pb-10">
                                <TouchableOpacity 
                                    onPress={() => router.back()}
                                    className="absolute top-12 left-6 w-10 h-10 rounded-full bg-black/20 items-center justify-center border border-white/20"
                                >
                                    <ChevronRight size={20} color="white" style={{ transform: [{ rotate: '180deg' }] }} />
                                </TouchableOpacity>

                                <View className="bg-white/20 self-start px-3 py-1 rounded-full mb-3 backdrop-blur-md border border-white/30">
                                    <Text className="text-white text-[10px] font-black uppercase tracking-widest">
                                        {displayData?.status || 'Processing'}
                                    </Text>
                                </View>
                                
                                <Text className="text-white text-3xl font-black leading-tight mb-2 shadow-sm">
                                    {displayData?.vacancy?.title || 'Application'}
                                </Text>
                                
                                <View className="flex-row items-center mb-1">
                                    <Building2 size={14} color="rgba(255,255,255,0.7)" />
                                    <Text className="text-white/70 text-sm ml-2 font-bold">{displayData?.vacancy?.department?.name || 'Public Service Board'}</Text>
                                </View>
                                
                                <View className="flex-row items-center">
                                    <Briefcase size={14} color="rgba(255,255,255,0.7)" />
                                    <Text className="text-white/70 text-xs ml-2 font-medium">Ref: {displayData?.vacancy?.advertisementNumber || 'N/A'}</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </ImageBackground>
                </View>

                <View className="px-6 -mt-8 pb-20">
                    {showOfflineBanner && (
                        <View className="mb-6 px-4 py-3 rounded-2xl border border-amber-200 bg-amber-50 flex-row items-center">
                            <AlertCircle size={16} color="#b45309" />
                            <Text className="text-amber-800 text-[10px] font-bold ml-2">
                                Offline Mode: Showing cached data.
                            </Text>
                        </View>
                    )}

                    {!displayData ? (
                        <View className="bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm items-center">
                            <View className="w-16 h-16 bg-rose-50 rounded-full items-center justify-center mb-4">
                                <AlertCircle size={32} color="#ef4444" />
                            </View>
                            <Text className="text-gray-900 font-black text-xl text-center">Data Unavailable</Text>
                            <Text className="text-gray-500 text-sm mt-2 text-center leading-5 px-4">
                                {errorMessage || 'We could not fetch your application details at this time.'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => refetch()}
                                className="mt-8 px-10 py-4 rounded-3xl bg-[#004aad] shadow-lg shadow-blue-200"
                            >
                                <Text className="text-white font-black text-xs uppercase tracking-widest">Retry Connection</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            {/* Current Status Card */}
                            <View className="bg-white rounded-[40px] p-6 shadow-sm border border-gray-100 mb-6">
                                <View className="flex-row justify-between items-center mb-6">
                                    <View>
                                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Current Status</Text>
                                        <Text className="text-gray-900 text-2xl font-black mt-1" style={{ color: getStatusColor(displayData.status) }}>
                                            {displayData.status.charAt(0).toUpperCase() + displayData.status.slice(1)}
                                        </Text>
                                    </View>
                                    <View className="w-12 h-12 rounded-2xl bg-gray-50 items-center justify-center">
                                        <Calendar size={24} color="#64748b" />
                                    </View>
                                </View>

                                <View className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
                                    <View className="flex-row items-start">
                                        <Info size={18} color="#004aad" className="mt-0.5" />
                                        <View className="ml-3 flex-1">
                                            <Text className="text-gray-900 font-bold text-sm">Status Update</Text>
                                            <Text className="text-gray-500 text-xs mt-1 leading-5">
                                                {displayData.feedbackToApplicant || (
                                                    displayData.status === 'pending' ? 'Your application is currently undergoing preliminary screening by the board.' :
                                                    displayData.status === 'reviewed' ? 'Your profile has been reviewed and moved to the shortlisting phase.' :
                                                    displayData.status === 'accepted' ? 'Congratulations! Your application has been successful. Please check your email for further instructions.' :
                                                    'Your application has been processed and a decision has been reached.'
                                                )}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Stage Indicator (Stepper) */}
                            <View className="mb-8">
                                <Text className="text-xl font-black text-gray-900 mb-6 px-2">Recruitment Pipeline</Text>
                                <View className="flex-row justify-between items-start px-2">
                                    {stages.map((stage, index) => (
                                        <View key={stage.id} className="items-center flex-1">
                                            <View className="relative items-center justify-center">
                                                {/* Connector Line */}
                                                {index > 0 && (
                                                    <View 
                                                        className={`absolute right-[50%] top-5 w-full h-[2px] -z-10 ${
                                                            index <= (currentStageIndex === -1 ? stages.length : currentStageIndex) ? 'bg-[#004aad]' : 'bg-gray-200'
                                                        }`}
                                                    />
                                                )}
                                                
                                                <View 
                                                    className={`w-10 h-10 rounded-full items-center justify-center border-4 ${
                                                        stage.status === 'completed' ? 'bg-[#004aad] border-blue-100' : 
                                                        stage.status === 'current' ? 'bg-white border-[#004aad]' : 
                                                        'bg-white border-gray-100'
                                                    }`}
                                                >
                                                    {stage.status === 'completed' ? (
                                                        <CheckCircle2 size={14} color="white" />
                                                    ) : (
                                                        <stage.icon size={14} color={stage.status === 'current' ? '#004aad' : '#cbd5e1'} />
                                                    )}
                                                </View>
                                            </View>
                                            <Text className={`text-[8px] font-black uppercase mt-3 text-center px-1 ${
                                                stage.status === 'current' ? 'text-[#004aad]' : 
                                                stage.status === 'completed' ? 'text-gray-900' : 'text-gray-400'
                                            }`}>
                                                {stage.title}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Document Checklist */}
                            <View className="bg-white rounded-[40px] p-6 shadow-sm border border-gray-100 mb-6">
                                <View className="flex-row items-center justify-between mb-6">
                                    <Text className="text-lg font-black text-gray-900">Document Status</Text>
                                    <View className="bg-blue-50 px-3 py-1 rounded-full">
                                        <Text className="text-[#004aad] text-[10px] font-black uppercase">Verified</Text>
                                    </View>
                                </View>

                                {[
                                    { name: 'National ID / Passport', status: 'verified' },
                                    { name: 'Academic Certificates', status: 'verified' },
                                    { name: 'Professional Memberships', status: 'verified' },
                                    { name: 'Chapter 6 Clearances', status: 'pending' },
                                ].map((doc, idx) => (
                                    <View key={idx} className="flex-row items-center justify-between mb-4 last:mb-0">
                                        <View className="flex-row items-center">
                                            <View className={`w-8 h-8 rounded-xl items-center justify-center ${doc.status === 'verified' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                                                {doc.status === 'verified' ? (
                                                    <ShieldCheck size={16} color="#10b981" />
                                                ) : (
                                                    <Clock size={16} color="#f59e0b" />
                                                )}
                                            </View>
                                            <Text className="ml-3 text-sm font-bold text-gray-700">{doc.name}</Text>
                                        </View>
                                        <View className={`w-2 h-2 rounded-full ${doc.status === 'verified' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    </View>
                                ))}
                            </View>

                            {/* Submitted Profile Action */}
                            <TouchableOpacity 
                                onPress={() => {
                                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                    setShowSnapshot(!showSnapshot);
                                }}
                                activeOpacity={0.7}
                                className="bg-[#004aad] rounded-[40px] p-6 shadow-lg shadow-blue-200 mb-6 flex-row items-center justify-between overflow-hidden"
                            >
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.1)', 'transparent']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    className="absolute inset-0"
                                />
                                <View className="flex-row items-center">
                                    <View className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center">
                                        <FileText size={24} color="white" />
                                    </View>
                                    <View className="ml-4">
                                        <Text className="text-white font-black text-lg">Submitted CV</Text>
                                        <Text className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Snapshot at submission</Text>
                                    </View>
                                </View>
                                <View className={`w-10 h-10 rounded-full bg-white/20 items-center justify-center ${showSnapshot ? 'rotate-180' : ''}`}>
                                    <ChevronDown size={20} color="white" />
                                </View>
                            </TouchableOpacity>

                            {showSnapshot && (
                                <View className="bg-white rounded-[40px] p-8 border border-gray-100 mb-6 shadow-sm">
                                    <SnapshotCVViewer snapshot={displayData.profileSnapshot} />
                                </View>
                            )}

                            {/* Help & Support */}
                            <View className="items-center py-10">
                                <Text className="text-gray-400 text-xs font-bold text-center mb-6">
                                    Applied on {new Date(displayData.appliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </Text>
                                <TouchableOpacity className="flex-row items-center bg-gray-100 px-6 py-3 rounded-2xl">
                                    <Download size={16} color="#64748b" />
                                    <Text className="text-gray-600 font-bold text-xs ml-2 uppercase tracking-widest">Download P.107 Form</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
