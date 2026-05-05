import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import * as z from 'zod';
import { FormDatePicker } from '@/components/ui/form-date-picker';
import { FormField } from '@/components/ui/form-field';
import { FormLayout } from '@/components/ui/form-layout';
import { apiClient, getApiErrorMessage } from '@/lib/api/client';
import { runOfflineCapableMutation } from '@/lib/offline-mutations/mutation-strategy';

const professionalDetailsSchema = z.object({
    registrationBody: z.string().min(1, 'Registration body is required'),
    registrationNumber: z.string().min(1, 'Registration number is required'),
    expiryDate: z.string().optional().nullable(),
});

type ProfessionalDetailsData = z.infer<typeof professionalDetailsSchema>;

export default function AddProfessionalDetailsScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            return runOfflineCapableMutation({
                request: () => apiClient.post('/applicant-profiles/me/professional-details', data),
                method: 'post',
                path: '/applicant-profiles/me/professional-details',
                data,
            });
        },

        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['professional-details'] });

            if (result.queued) {
                Alert.alert('Queued', 'Professional registration saved offline and will sync when you are back online.');
                router.back();
                return;
            }

            Alert.alert('Success', 'Professional registration added successfully');
            router.back();
        },
        onError: (error: unknown) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to add registration'));
        }
    });

    const { control, handleSubmit, formState: { errors } } = useForm<ProfessionalDetailsData>({
        resolver: zodResolver(professionalDetailsSchema),
        defaultValues: {
            registrationBody: '',
            registrationNumber: '',
            expiryDate: '',
        },
    });

    return (
        <FormLayout
            title="Add Registration"
            onBack={() => router.back()}
            bottomAction={
                <TouchableOpacity
                    className="bg-[#004aad] p-4 rounded-2xl items-center shadow-sm active:bg-blue-900"
                    onPress={handleSubmit((data) => mutation.mutate(data))}
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-black text-base uppercase tracking-widest">Save Registration</Text>
                    )}
                </TouchableOpacity>
            }
        >
            <View className="space-y-4">
                <Controller
                    control={control}
                    name="registrationBody"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <FormField
                            label="Registration Body"
                            placeholder="e.g. Kenya Medical Practitioners Board"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            error={errors.registrationBody?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="registrationNumber"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <FormField
                            label="Registration Number"
                            placeholder="Enter your license/reg number"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            error={errors.registrationNumber?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="expiryDate"
                    render={({ field: { onChange, value } }) => (
                        <FormDatePicker
                            label="Expiry Date (Optional)"
                            value={value || ''}
                            onChange={onChange}
                            error={errors.expiryDate?.message}
                        />
                    )}
                />
            </View>
        </FormLayout>
    );
}
