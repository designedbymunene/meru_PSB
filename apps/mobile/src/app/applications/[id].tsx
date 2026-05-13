import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useNetInfo } from '@react-native-community/netinfo';
import { Clock, CheckCircle2, FileText, Calendar, MapPin, ShieldCheck, AlertCircle, ChevronRight } from 'lucide-react-native';
import { Header } from '@/components/ui/header';
import { apiClient, getApiErrorMessage, getNormalizedApiError } from '@/lib/api/client';
import { ApplicationDetailsLoadingState } from '@/components/ui/loading-skeletons';
import { SnapshotCVViewer } from '@/components/profile/SnapshotCVViewer';

// LayoutAnimation is handled automatically in the New Architecture or can be omitted if not used.
export default function TrackApplicationScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const netInfo = useNetInfo();
    const [showSnapshot, setShowSnapshot] = useState(false);
    const isActivePlaceholder = id === 'active';

    const { data: application, isLoading, error, isError, refetch } = useQuery({
        queryKey: ['application', id],
        queryFn: async () => {
            const response = await apiClient.get(`/applications/${id}`);
            return response.data.data;
        },
        enabled: !!id && !isActivePlaceholder,
    });

    const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
    const normalizedError = error ? getNormalizedApiError(error) : null;
    const showOfflineBanner = isOffline || normalizedError?.isOffline;
    const errorMessage = isError ? getApiErrorMessage(error, 'Unable to load this application right now.') : null;

    const displayData = application;

    // Use steps from API or default empty
    const steps = application?.steps || [];

    if (isLoading && !displayData && !isError) {
        return <ApplicationDetailsLoadingState />;
    }

    return (
        <View className="flex-1 bg-white">
            <Header 
                title="Track Application" 
                showBackButton={true}
                onBackPress={() => router.back()}
            />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="p-6">
                    {showOfflineBanner && (
                        <View className="mb-6 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50">
                            <Text className="text-amber-700 text-xs font-semibold">
                                You&apos;re offline. Showing cached application details where available.
                            </Text>
                        </View>
                    )}

                    {!displayData ? (
                        <View className="bg-gray-50 border border-gray-100 p-6 rounded-3xl mb-8">
                            <Text className="text-gray-900 font-bold text-base">Application details unavailable</Text>
                            <Text className="text-gray-500 text-xs mt-2 leading-5">
                                {errorMessage || 'We could not load this application at the moment.'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => refetch()}
                                className="self-start mt-4 px-4 py-2.5 rounded-full bg-[#004aad]"
                            >
                                <Text className="text-white font-semibold text-xs">Try Again</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                    {/* Job Summary Header */}
                    <View className="bg-gray-900 p-6 rounded-[32px] shadow-xl shadow-gray-200 mb-8 overflow-hidden">
                        <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
                        
                        <View className="bg-white/10 self-start px-3 py-1 rounded-full mb-4">
                            <Text className="text-white/80 text-[10px] font-bold uppercase tracking-widest">{displayData.status}</Text>
                        </View>
                            <Text className="text-white text-2xl font-bold leading-tight mb-2">{displayData.vacancy?.title || 'Application'}</Text>
                            <View className="flex-row items-center mb-6">
                                <MapPin size={14} color="#94a3b8" />
                                <Text className="text-gray-400 text-xs ml-2 font-medium">{displayData.vacancy?.department?.name || 'Department'}</Text>
                            </View>

                        <View className="bg-white/10 h-[1px] w-full mb-6" />

                        <View className="flex-row justify-between items-center">
                            <View>
                                <Text className="text-white/50 text-[10px] font-bold uppercase tracking-tighter">Reference No.</Text>
                                    <Text className="text-white font-bold text-sm mt-1">{displayData.vacancy?.advertisementNumber || 'N/A'}</Text>
                                </View>
                            <View className="items-end">
                                <Text className="text-white/50 text-[10px] font-bold uppercase tracking-tighter">Applied On</Text>
                                <Text className="text-white font-bold text-sm mt-1">{new Date(displayData.appliedAt).toLocaleDateString()}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Progress Timeline */}
                    <View className="mb-10">
                        <Text className="text-xl font-bold text-gray-900 mb-6">Application Status</Text>
                        
                        <View className="pl-2">
                            {steps.map((step, index) => (
                                <View key={index} className="flex-row mb-8 last:mb-0">
                                    {/* Timeline Line & Icon */}
                                    <View className="items-center mr-4">
                                        <View 
                                            className={`w-10 h-10 rounded-full items-center justify-center z-10 ${
                                                step.status === 'completed' ? 'bg-green-500' : 
                                                step.status === 'current' ? 'bg-[#004aad]' : 'bg-gray-200'
                                            }`}
                                        >
                                            {step.status === 'completed' ? (
                                                <CheckCircle2 size={20} color="white" />
                                            ) : step.icon}
                                        </View>
                                        {index < steps.length - 1 && (
                                            <View 
                                                className={`w-0.5 h-12 -mb-2 mt-2 ${
                                                    step.status === 'completed' ? 'bg-green-200' : 'bg-gray-100'
                                                }`} 
                                            />
                                        )}
                                    </View>

                                    {/* Step Content */}
                                    <View className="flex-1 pt-1">
                                        <Text className={`text-base font-bold ${
                                            step.status === 'upcoming' ? 'text-gray-400' : 'text-gray-900'
                                        }`}>
                                            {step.title}
                                        </Text>
                                        <View className="flex-row items-center mt-1">
                                            {step.status === 'current' && (
                                                <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                                            )}
                                            <Text className={`text-xs ${
                                                step.status === 'upcoming' ? 'text-gray-300' : 'text-gray-500'
                                            }`}>
                                                {step.date}
                                            </Text>
                                        </View>
                                        {step.status === 'current' && (
                                            <View className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mt-4">
                                                <View className="flex-row items-start">
                                                    <AlertCircle size={16} color="#004aad" className="mt-0.5" />
                                                    <View className="ml-3 flex-1">
                                                        <Text className="text-[#004aad] font-bold text-sm">Action Required</Text>
                                                        <Text className="text-blue-700/80 text-xs mt-1 leading-4">
                                                            Your documents have been verified. We are now reviewing your technical qualifications. No further action needed.
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                    
                    {/* Snapshot Section */}
                    {displayData?.profileSnapshot && (
                        <View className="mb-10">
                            <TouchableOpacity 
                                onPress={() => {
                                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                    setShowSnapshot(!showSnapshot);
                                }}
                                className="flex-row items-center justify-between bg-blue-50 dark:bg-blue-900/10 p-5 rounded-[32px] border border-blue-100 dark:border-blue-800"
                            >
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 items-center justify-center">
                                        <FileText size={20} color="#004aad" />
                                    </View>
                                    <View className="ml-3">
                                        <Text className="text-blue-900 dark:text-blue-200 font-black text-base">Submitted CV</Text>
                                        <Text className="text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase">View Snapshot</Text>
                                    </View>
                                </View>
                                <View className={`w-8 h-8 rounded-full bg-white dark:bg-gray-800 items-center justify-center border border-blue-100 dark:border-blue-800 transition-transform ${showSnapshot ? 'rotate-180' : ''}`}>
                                    <ChevronRight size={16} color="#004aad" style={{ transform: [{ rotate: showSnapshot ? '90deg' : '0deg' }] }} />
                                </View>
                            </TouchableOpacity>

                            {showSnapshot && (
                                <View className="mt-6 px-2">
                                    <SnapshotCVViewer snapshot={displayData.profileSnapshot} />
                                </View>
                            )}
                        </View>
                    )}

                    {/* Support / Contact Section */}
                    <View className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 items-center mb-10">
                        <View className="bg-white p-3 rounded-2xl shadow-sm mb-4">
                            <Clock size={24} color="#64748b" />
                        </View>
                        <Text className="text-gray-900 font-bold text-base text-center">Need help with this application?</Text>
                        <Text className="text-gray-500 text-xs text-center mt-2 leading-5 px-4">
                            If you have any questions regarding the recruitment process, please reach out to our support team.
                        </Text>
                        <TouchableOpacity className="mt-6 bg-white px-8 py-3 rounded-2xl border border-gray-200 shadow-sm">
                            <Text className="text-gray-900 font-bold text-sm">Contact Support</Text>
                        </TouchableOpacity>
                    </View>
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
