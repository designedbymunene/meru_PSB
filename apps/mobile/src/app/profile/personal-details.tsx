import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNetInfo } from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, TextInput, View, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { toast } from 'sonner-native';
import * as z from 'zod';
import { FormField } from '@/components/ui/form-field';
import { FormPicker } from '@/components/ui/form-picker';
import { FormDatePicker } from '@/components/ui/form-date-picker';
import { apiClient, getApiErrorMessage, getNormalizedApiError } from '@/lib/api/client';
import { runOfflineCapableMutation } from '@/lib/offline-mutations/mutation-strategy';
import { User, Phone, Mail, Fingerprint, Heart } from 'lucide-react-native';
import { ProfileFormLoadingState } from '@/components/ui/loading-skeletons';
import { Header } from '@/components/ui/header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const personalDetailsSchema = z.object({
    fullName: z.string().min(2, 'Full Name is required'),
    idNumber: z.string().min(6, 'ID Number is required'),
    phoneNumber: z.string().min(10, 'Valid phone number is required'),
    email: z.string().email('Valid email is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['Male', 'Female', 'Other']),
    impairment: z.boolean().default(false),
    impairmentDetails: z.string().optional(),
});

type PersonalDetailsData = z.infer<typeof personalDetailsSchema>;

export default function PersonalDetailsScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const netInfo = useNetInfo();
    const insets = useSafeAreaInsets();
     
    const [hasInitialReset, setHasInitialReset] = React.useState(false);

    // Refs for keyboard "Next" navigation
    const emailRef = useRef<TextInput>(null);
    const idNumberRef = useRef<TextInput>(null);
    const phoneRef = useRef<TextInput>(null);

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
                description: 'Personal details updated successfully' 
            });
            router.back();
        },
        onError: (mutationError: unknown) => {
            toast.error('Error', { 
                description: getApiErrorMessage(mutationError, 'Failed to update personal details') 
            });
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
            impairment: false,
            impairmentDetails: '',
        },
    });

    useEffect(() => {
        if (profile && !hasInitialReset) {
            reset({
                fullName: profile.fullName || '',
                idNumber: profile.idNumber || '',
                phoneNumber: profile.phoneNumber || '',
                email: profile.email || '',
                dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
                gender: (profile.gender as any) || 'Male',
                impairment: !!profile.impairment,
                impairmentDetails: profile.impairmentDetails || '',
            });
            setHasInitialReset(true);
        }
    }, [profile, reset, hasInitialReset]);

    const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
    const normalizedError = error ? getNormalizedApiError(error) : null;
    const showOfflineBanner = isOffline || normalizedError?.isOffline;
    const loadErrorMessage = isError ? getApiErrorMessage(error, 'Unable to load profile details right now.') : null;

    if (isLoading && !profile && !isError) {
        return <ProfileFormLoadingState title="Personal Details" />;
    }

    const handleSubmitForm = async (data: PersonalDetailsData) => {
        mutation.mutate(data);
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-950">
            <Header title="Personal Details" onBack={() => router.back()} />

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

                {/* Basic Information Section */}
                <View className="pb-4">
                    <Text className="text-gray-900 dark:text-white font-black text-base mb-4">Basic Information</Text>
                    <View className="space-y-2">
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
                                    icon={Mail}
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
                                    icon={Fingerprint}
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
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="dateOfBirth"
                            render={({ field: { onChange, value } }) => (
                                <FormDatePicker
                                    label="Date of Birth"
                                    placeholder="Select your birth date"
                                    onChange={onChange}
                                    value={value}
                                    error={errors.dateOfBirth?.message}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="gender"
                            render={({ field: { onChange, value } }) => (
                                <FormPicker
                                    label="Gender"
                                    items={[
                                        { label: 'Male', value: 'Male' },
                                        { label: 'Female', value: 'Female' },
                                        { label: 'Other', value: 'Other' },
                                    ]}
                                    icon={User}
                                    onValueChange={onChange}
                                    value={value}
                                    error={errors.gender?.message}
                                    placeholder="Select gender"
                                />
                            )}
                        />
                    </View>
                </View>

                {/* Health & Accessibility Section */}
                <View className="pb-4">
                    <View className="pb-2">
                        <Text className="text-gray-900 dark:text-white font-black text-base">Health & Accessibility</Text>
                    </View>

                    <View className="space-y-2">
                        <Controller
                            control={control}
                            name="impairment"
                            render={({ field: { onChange, value } }) => (
                                <FormPicker
                                    label="Do you have any impairment?"
                                    items={[
                                        { label: 'No', value: false },
                                        { label: 'Yes', value: true },
                                    ]}
                                    icon={Heart}
                                    onValueChange={onChange}
                                    value={value}
                                    error={errors.impairment?.message}
                                />
                            )}
                        />

                        {watch('impairment') && (
                            <Controller
                                control={control}
                                name="impairmentDetails"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <FormField
                                        label="Impairment Details"
                                        placeholder="Please describe your impairment"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        error={errors.impairmentDetails?.message}
                                        multiline
                                        numberOfLines={3}
                                    />
                                )}
                            />
                        )}
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
