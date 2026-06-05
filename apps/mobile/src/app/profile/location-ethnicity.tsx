import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNetInfo } from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, TextInput, View, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { toast } from 'sonner-native';
import * as z from 'zod';
import { FormPicker } from '@/components/ui/form-picker';
import { apiClient, getApiErrorMessage, getNormalizedApiError } from '@/lib/api/client';
import { useCounties, useConstituencies, useWards, useEthnicities } from '@/lib/api/reference';
import { runOfflineCapableMutation } from '@/lib/offline-mutations/mutation-strategy';
import { Globe, MapPin, Users } from 'lucide-react-native';
import { ProfileFormLoadingState } from '@/components/ui/loading-skeletons';
import { Header } from '@/components/ui/header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const locationEthnicitySchema = z.object({
    ethnicityId: z.coerce.number().min(1, 'Ethnicity is required'),
    homeCountyId: z.coerce.number().min(1, 'Home County is required'),
    homeSubCountyId: z.coerce.number().min(1, 'Home Sub-County is required'),
    wardId: z.coerce.number().min(1, 'Ward is required'),
});

type LocationEthnicityData = z.infer<typeof locationEthnicitySchema>;

export default function LocationEthnicityScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const netInfo = useNetInfo();
    const insets = useSafeAreaInsets();

    const [hasInitialReset, setHasInitialReset] = React.useState(false);

    const { data: profile, isLoading, error, isError, refetch } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await apiClient.get('/applicant-profiles/me');
            return response.data.data;
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            return runOfflineCapableMutation({
                request: () => apiClient.put('/applicant-profiles/me', data),
                method: 'put',
                path: '/applicant-profiles/me',
                data,
            });
        },

        onSuccess: (result, submittedData) => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });

            if (result.queued) {
                queryClient.setQueryData(['profile'], (existingProfile: Record<string, unknown> | undefined) => ({
                    ...(existingProfile ?? {}),
                    ...submittedData,
                }));
                toast.info('Queued', {
                    description: 'Profile changes were saved offline and will sync when you are back online.'
                });
                router.back();
                return;
            }

            toast.success('Success', {
                description: 'Location & ethnicity updated successfully'
            });
            router.back();
        },
        onError: (mutationError: unknown) => {
            toast.error('Error', {
                description: getApiErrorMessage(mutationError, 'Failed to update location & ethnicity')
            });
        }
    });

    const { control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<LocationEthnicityData>({
        resolver: zodResolver(locationEthnicitySchema),
        defaultValues: {
            ethnicityId: null as any,
            homeCountyId: null as any,
            homeSubCountyId: null as any,
            wardId: null as any,
        },
    });

    // Watch for location dependencies
    const selectedCountyId = watch('homeCountyId');
    const selectedSubCountyId = watch('homeSubCountyId');

    // Reference Queries
    const { data: countiesResponse, isLoading: isLoadingCounties } = useCounties();
    const counties = (countiesResponse?.data || []).map((c: any) => ({ label: c.name, value: c.id }));

    const { data: ethnicitiesResponse, isLoading: isLoadingEthnicities } = useEthnicities();
    const ethnicities = (ethnicitiesResponse?.data || []).map((e: any) => ({ label: e.name, value: e.id }));

    const { data: subCountiesResponse, isFetching: isFetchingSubCounties } = useConstituencies(typeof selectedCountyId === 'number' && selectedCountyId > 0 ? selectedCountyId : undefined);
    const subCounties = (subCountiesResponse?.data || []).map((sc: any) => ({ label: sc.name, value: sc.id }));

    const { data: wardsResponse, isFetching: isFetchingWards } = useWards(typeof selectedSubCountyId === 'number' && selectedSubCountyId > 0 ? selectedSubCountyId : undefined);
    const wards = (wardsResponse?.data || []).map((w: any) => ({ label: w.name, value: w.id }));

    // Cascading selection clearing
    useEffect(() => {
        if (!selectedCountyId || selectedCountyId <= 0) {
            setValue('homeSubCountyId', null as any);
            setValue('wardId', null as any);
        }
    }, [selectedCountyId, setValue]);

    useEffect(() => {
        if (!selectedSubCountyId || selectedSubCountyId <= 0) {
            setValue('wardId', null as any);
        }
    }, [selectedSubCountyId, setValue]);

    useEffect(() => {
        if (profile && !hasInitialReset) {
            reset({
                ethnicityId: profile.ethnicityId || null,
                homeCountyId: profile.homeCountyId || null,
                homeSubCountyId: profile.homeSubCountyId || null,
                wardId: profile.wardId || null,
            });
            setHasInitialReset(true);
        }
    }, [profile, reset, hasInitialReset]);

    const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
    const normalizedError = error ? getNormalizedApiError(error) : null;
    const showOfflineBanner = isOffline || normalizedError?.isOffline;
    const loadErrorMessage = isError ? getApiErrorMessage(error, 'Unable to load profile details right now.') : null;

    if (isLoading && !profile && !isError) {
        return <ProfileFormLoadingState title="Location & Ethnicity" />;
    }

    const handleSubmitForm = async (data: LocationEthnicityData) => {
        mutation.mutate(data);
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-950">
            <Header title="Location & Ethnicity" onBack={() => router.back()} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                >
                    {showOfflineBanner && (
                        <View className="mb-5 px-4 py-3 rounded-2xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10">
                            <Text className="text-amber-700 dark:text-amber-400 text-xs font-semibold">
                                You&apos;re offline. Showing cached profile data where available.
                            </Text>
                        </View>
                    )}

                    {isError && (
                        <View className="mb-6 px-4 py-3 rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10">
                            <Text className="text-red-700 dark:text-red-400 text-xs font-semibold">{loadErrorMessage}</Text>
                            <View className="flex-row mt-3">
                                <Pressable onPress={() => refetch()} className="px-4 py-2 rounded-full bg-[#004aad] dark:bg-blue-600">
                                    <Text className="text-white text-xs font-semibold">Try Again</Text>
                                </Pressable>
                            </View>
                        </View>
                    )}

                    <View className="pb-4">
                        <View className="pb-2">
                            <Text className="text-gray-900 dark:text-white font-black text-base">Location & Origin</Text>
                            <Text className="text-gray-500 dark:text-gray-400 text-xs">These details are required for statutory reporting.</Text>
                        </View>

                        <View className="space-y-2">
                            <Controller
                                control={control}
                                name="homeCountyId"
                                render={({ field: { onChange, value } }) => (
                                    <FormPicker
                                        label="Home County"
                                        items={counties}
                                        icon={Globe}
                                        onValueChange={(val) => {
                                            const numVal = val ? Number(val) : null;
                                            onChange(numVal);
                                            if (numVal !== value) {
                                                setValue('homeSubCountyId', null as any);
                                                setValue('wardId', null as any);
                                            }
                                        }}
                                        value={value}
                                        error={errors.homeCountyId?.message}
                                        placeholder="Select your county"
                                        isLoading={isLoadingCounties}
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="homeSubCountyId"
                                render={({ field: { onChange, value } }) => (
                                    <FormPicker
                                        label="Home Sub-County"
                                        items={subCounties}
                                        icon={MapPin}
                                        onValueChange={(val) => {
                                            const numVal = val ? Number(val) : null;
                                            onChange(numVal);
                                            if (numVal !== value) {
                                                setValue('wardId', null as any);
                                            }
                                        }}
                                        value={value}
                                        error={errors.homeSubCountyId?.message}
                                        placeholder="Select sub-county"
                                        enabled={!!selectedCountyId && selectedCountyId > 0}
                                        isLoading={isFetchingSubCounties && !!selectedCountyId}
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="wardId"
                                render={({ field: { onChange, value } }) => (
                                    <FormPicker
                                        label="Ward"
                                        items={wards}
                                        icon={MapPin}
                                        onValueChange={onChange}
                                        value={value}
                                        error={errors.wardId?.message}
                                        placeholder="Select ward"
                                        enabled={!!selectedSubCountyId && selectedSubCountyId > 0}
                                        isLoading={isFetchingWards && !!selectedSubCountyId}
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <View className="pb-4">
                        <View className="pb-2">
                            <Text className="text-gray-900 dark:text-white font-black text-base">Ethnicity</Text>
                        </View>

                        <View className="space-y-2">
                            <Controller
                                control={control}
                                name="ethnicityId"
                                render={({ field: { onChange, value } }) => (
                                    <FormPicker
                                        label="Ethnicity"
                                        items={ethnicities}
                                        icon={Users}
                                        onValueChange={onChange}
                                        value={value}
                                        error={errors.ethnicityId?.message}
                                        placeholder="Select ethnicity"
                                        isLoading={isLoadingEthnicities}
                                    />
                                )}
                            />
                        </View>
                    </View>
                </ScrollView>

                {/* Submit Button */}
                <View className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
                    <Pressable
                        onPress={handleSubmit(handleSubmitForm)}
                        disabled={mutation.isPending}
                        className={`h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none ${
                            mutation.isPending ? 'bg-[#004aad]/70' : 'bg-[#004aad] dark:bg-blue-600'
                        }`}
                    >
                        {mutation.isPending ? (
                            <Text className="text-white font-black text-sm">Saving...</Text>
                        ) : (
                            <Text className="text-white font-black text-sm uppercase tracking-widest">Save Details</Text>
                        )}
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
