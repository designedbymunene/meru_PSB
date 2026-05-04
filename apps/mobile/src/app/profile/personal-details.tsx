import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNetInfo } from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Text, TextInput, View } from 'react-native';
import * as z from 'zod';
import { FormLayout } from '@/components/ui/form-layout';
import { FormField } from '@/components/ui/form-field';
import { FormPicker } from '@/components/ui/form-picker';
import { SectionCard } from '@/components/account';
import { apiClient, getApiErrorMessage, getNormalizedApiError } from '@/lib/api/client';
import { 
    useCounties, 
    useConstituencies, 
    useWards, 
    useEthnicities 
} from '@/lib/api/reference';
import { runOfflineCapableMutation } from '@/lib/offline-mutations/mutation-strategy';
import { User, MapPin, Phone, Calendar } from 'lucide-react-native';
import { ProfileFormLoadingState } from '@/components/ui/loading-skeletons';

const personalDetailsSchema = z.object({
    fullName: z.string().min(2, 'Full Name is required'),
    idNumber: z.string().min(6, 'ID Number is required'),
    phoneNumber: z.string().min(10, 'Valid phone number is required'),
    email: z.string().email('Valid email is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['Male', 'Female', 'Other']),
    ethnicityId: z.coerce.number().optional(),
    homeCountyId: z.coerce.number().optional(),
    homeSubCountyId: z.coerce.number().optional(),
    wardId: z.coerce.number().optional(),
    impairment: z.boolean().default(false),
    impairmentDetails: z.string().optional(),
});

type PersonalDetailsData = z.infer<typeof personalDetailsSchema>;

export default function PersonalDetailsScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const netInfo = useNetInfo();

    // Location & Reference Queries
    const { data: countiesResponse } = useCounties();
    const counties = (countiesResponse?.data || []).map((c: any) => ({ label: c.name, value: c.id }));

    const { data: ethnicitiesResponse } = useEthnicities();
    const ethnicities = (ethnicitiesResponse?.data || []).map((e: any) => ({ label: e.name, value: e.id }));

    // Refs for keyboard "Next" navigation
    const emailRef = useRef<TextInput>(null);
    const idNumberRef = useRef<TextInput>(null);
    const phoneRef = useRef<TextInput>(null);
    const dobRef = useRef<TextInput>(null);
    const countyRef = useRef<TextInput>(null);
    const subCountyRef = useRef<TextInput>(null);
    const wardRef = useRef<TextInput>(null);
    const ethnicityRef = useRef<TextInput>(null);

    const { data: profile, isLoading, error, isError, refetch } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await apiClient.get('/applicant-profiles');
            return response.data.data;
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: PersonalDetailsData) => {
            return runOfflineCapableMutation({
                request: () => apiClient.put('/applicant-profiles', data),
                method: 'put',
                path: '/applicant-profiles',
                body: data,
            });
        },
        onSuccess: (result, submittedData) => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });

            if (result.queued) {
                queryClient.setQueryData(['profile'], (existingProfile: Record<string, unknown> | undefined) => ({
                    ...(existingProfile ?? {}),
                    ...submittedData,
                }));
                Alert.alert('Queued', 'Profile changes were saved offline and will sync when you are back online.');
                router.back();
                return;
            }

            Alert.alert('Success', 'Personal details updated successfully');
            router.back();
        },
        onError: (mutationError: unknown) => {
            Alert.alert('Error', getApiErrorMessage(mutationError, 'Failed to update personal details'));
        }
    });

    const { control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<PersonalDetailsData>({
        resolver: zodResolver(personalDetailsSchema),
        defaultValues: {
            fullName: '',
            idNumber: '',
            phoneNumber: '',
            email: '',
            dateOfBirth: '',
            gender: 'Male',
            ethnicityId: undefined,
            homeCountyId: undefined,
            homeSubCountyId: undefined,
            wardId: undefined,
            impairment: false,
            impairmentDetails: '',
        },
    });

    const selectedCountyId = watch('homeCountyId');
    const selectedSubCountyId = watch('homeSubCountyId');

    const { data: subCountiesResponse } = useConstituencies(selectedCountyId);
    const subCounties = (subCountiesResponse?.data || []).map((sc: any) => ({ label: sc.name, value: sc.id }));

    const { data: wardsResponse } = useWards(selectedSubCountyId);
    const wards = (wardsResponse?.data || []).map((w: any) => ({ label: w.name, value: w.id }));

    React.useEffect(() => {
        if (profile) {
            reset({
                fullName: profile.fullName || '',
                idNumber: profile.idNumber || '',
                phoneNumber: profile.phoneNumber || '',
                email: profile.email || '',
                dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
                gender: (profile.gender as any) || 'Male',
                ethnicityId: profile.ethnicityId || undefined,
                homeCountyId: profile.homeCountyId || undefined,
                homeSubCountyId: profile.homeSubCountyId || undefined,
                wardId: profile.wardId || undefined,
                impairment: !!profile.impairment,
                impairmentDetails: profile.impairmentDetails || '',
            });
        }
    }, [profile, reset]);

    const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
    const normalizedError = error ? getNormalizedApiError(error) : null;
    const showOfflineBanner = isOffline || normalizedError?.isOffline;
    const loadErrorMessage = isError ? getApiErrorMessage(error, 'Unable to load profile details right now.') : null;

    if (isLoading && !profile && !isError) {
        return <ProfileFormLoadingState title="Personal Details" />;
    }

    return (
        <FormLayout
            title="Personal Details"
            onBack={() => router.back()}
            isLoading={mutation.isPending}
            submitLabel="Save Details"
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
        >
            {showOfflineBanner && (
                <View className="mb-5 px-4 py-3 rounded-2xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10">
                    <Text className="text-amber-700 dark:text-amber-400 text-xs font-semibold">
                        You&apos;re offline. Showing cached profile data where available.
                    </Text>
                </View>
            )}

            {isError && (
                <View className="mb-5 px-4 py-3 rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10">
                    <Text className="text-red-700 dark:text-red-400 text-xs font-semibold">{loadErrorMessage}</Text>
                    <View className="flex-row mt-3">
                        <View className="px-4 py-2 rounded-full bg-[#004aad] dark:bg-blue-600">
                            <Text onPress={() => refetch()} className="text-white text-xs font-semibold">Try Again</Text>
                        </View>
                    </View>
                </View>
            )}

            <SectionCard
                title="Essential Information"
                icon={<User size={22} color="#004aad" className="dark:text-blue-400" />}
                collapsible={false}
            >
                <View className="space-y-4">
                    <Controller
                        control={control}
                        name="fullName"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <FormField
                                label="Full Name"
                                placeholder="Your full name"
                                icon={User}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                error={errors.fullName?.message}
                                nextFieldRef={emailRef}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <FormField
                                ref={emailRef}
                                label="Email Address"
                                placeholder="your.email@example.com"
                                icon={User}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                error={errors.email?.message}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                nextFieldRef={idNumberRef}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="idNumber"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <FormField
                                ref={idNumberRef}
                                label="ID / Passport Number"
                                placeholder="Enter ID number"
                                icon={User}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                error={errors.idNumber?.message}
                                nextFieldRef={phoneRef}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="phoneNumber"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <FormField
                                ref={phoneRef}
                                label="Phone Number"
                                placeholder="e.g. 0712345678"
                                icon={Phone}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                error={errors.phoneNumber?.message}
                                keyboardType="phone-pad"
                                nextFieldRef={dobRef}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="dateOfBirth"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <FormField
                                ref={dobRef}
                                label="Date of Birth"
                                placeholder="YYYY-MM-DD"
                                icon={Calendar}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                error={errors.dateOfBirth?.message}
                                nextFieldRef={countyRef}
                            />
                        )}
                    />
                </View>
            </SectionCard>

            <View className="h-4" />

            <SectionCard
                title="Location & Demographic"
                icon={<MapPin size={22} color="#004aad" className="dark:text-blue-400" />}
                collapsible={false}
            >
                <View className="space-y-4">
                    <Controller
                        control={control}
                        name="homeCountyId"
                        render={({ field: { onChange, value } }) => (
                            <FormPicker
                                label="Home County"
                                items={counties}
                                onValueChange={(val) => {
                                    onChange(val);
                                    setValue('homeSubCountyId', undefined);
                                    setValue('wardId', undefined);
                                }}
                                value={value}
                                error={errors.homeCountyId?.message}
                                placeholder="Select your county"
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
                                onValueChange={(val) => {
                                    onChange(val);
                                    setValue('wardId', undefined);
                                }}
                                value={value}
                                error={errors.homeSubCountyId?.message}
                                placeholder="Select sub-county"
                                enabled={!!selectedCountyId}
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
                                onValueChange={onChange}
                                value={value}
                                error={errors.wardId?.message}
                                placeholder="Select ward"
                                enabled={!!selectedSubCountyId}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="ethnicityId"
                        render={({ field: { onChange, value } }) => (
                            <FormPicker
                                label="Ethnicity"
                                items={ethnicities}
                                onValueChange={onChange}
                                value={value}
                                error={errors.ethnicityId?.message}
                                placeholder="Select ethnicity"
                            />
                        )}
                    />

                </View>
            </SectionCard>
            
            <View className="h-6" />
        </FormLayout>
    );
}
