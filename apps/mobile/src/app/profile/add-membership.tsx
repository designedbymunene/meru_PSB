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

const membershipSchema = z.object({
    membershipBody: z.string().min(1, 'Membership body is required'),
    membershipType: z.string().min(1, 'Membership type is required'),
    registrationNumber: z.string().optional(),
    expiryDate: z.string().optional().nullable(),
});

type MembershipData = z.infer<typeof membershipSchema>;

export default function AddMembershipScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: MembershipData) => {
            return runOfflineCapableMutation({
                request: () => apiClient.post('/applicant-profiles/memberships', data),
                method: 'post',
                path: '/applicant-profiles/memberships',
                body: data,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['memberships'] });

            if (result.queued) {
                Alert.alert('Queued', 'Membership saved offline and will sync when you are back online.');
                router.back();
                return;
            }

            Alert.alert('Success', 'Membership added successfully');
            router.back();
        },
        onError: (error: unknown) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to add membership'));
        }
    });

    const { control, handleSubmit, formState: { errors } } = useForm<MembershipData>({
        resolver: zodResolver(membershipSchema),
        defaultValues: {
            membershipBody: '',
            membershipType: '',
            registrationNumber: '',
            expiryDate: '',
        },
    });

    return (
        <FormLayout
            title="Add Membership"
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
                        <Text className="text-white font-black text-base uppercase tracking-widest">Save Membership</Text>
                    )}
                </TouchableOpacity>
            }
        >
            <View className="space-y-4">
                <Controller
                    control={control}
                    name="membershipBody"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <FormField
                            label="Membership Body"
                            placeholder="e.g. Kenya Institute of Management"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            error={errors.membershipBody?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="membershipType"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <FormField
                            label="Membership Type"
                            placeholder="e.g. Full, Associate, Student"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            error={errors.membershipType?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="registrationNumber"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <FormField
                            label="Membership Number (Optional)"
                            placeholder="Enter your membership ID"
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
