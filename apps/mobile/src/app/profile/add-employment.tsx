import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import * as z from 'zod';
import { FormDatePicker } from '@/components/ui/form-date-picker';
import { FormField } from '@/components/ui/form-field';
import { FormPicker } from '@/components/ui/form-picker';
import { FormLayout } from '@/components/ui/form-layout';
import { apiClient, getApiErrorMessage } from '@/lib/api/client';
import { useJobGroups } from '@/lib/api/job-groups';
import { useInstitutions } from '@/lib/api/reference';
import { runOfflineCapableMutation } from '@/lib/offline-mutations/mutation-strategy';

const employmentSchema = z.object({
    organization: z.string().min(1, 'Organization name is required'),
    organizationId: z.coerce.number().optional(),
    jobTitle: z.string().min(1, 'Job title is required'),
    jobTitleId: z.coerce.number().optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional().nullable(),
    jobGroup: z.string().optional(),
    jobGroupId: z.coerce.number().optional(),
    responsibilities: z.string().optional(),
    isCurrent: z.boolean().default(false),
});

type EmploymentData = z.infer<typeof employmentSchema>;

export default function AddEmploymentScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: jobGroupsResponse } = useJobGroups();
    const jobGroups = (jobGroupsResponse || []).map((jg: any) => ({ label: `${jg.code} - ${jg.name}`, value: jg.id, code: jg.code }));

    const mutation = useMutation({
        mutationFn: async (data: EmploymentData) => {
            return runOfflineCapableMutation({
                request: () => apiClient.post('/applicant-profiles/employment', data),
                method: 'post',
                path: '/applicant-profiles/employment',
                body: data,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['employment'] });
            queryClient.invalidateQueries({ queryKey: ['employment-history'] });

            if (result.queued) {
                Alert.alert('Queued', 'Employment record saved offline and will sync when you are back online.');
                router.back();
                return;
            }

            Alert.alert('Success', 'Employment record added successfully');
            router.back();
        },
        onError: (error: unknown) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to add employment record'));
        }
    });

    const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<EmploymentData>({
        resolver: zodResolver(employmentSchema),
        defaultValues: {
            organization: '',
            organizationId: undefined,
            jobTitle: '',
            jobTitleId: undefined,
            startDate: '',
            endDate: '',
            jobGroup: '',
            jobGroupId: undefined,
            responsibilities: '',
            isCurrent: false,
        },
    });

    const isCurrent = watch('isCurrent');
    const jobGroupId = watch('jobGroupId');

    return (
        <FormLayout
            title="Add Employment"
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
                        <Text className="text-white font-black text-base uppercase tracking-widest">Save Record</Text>
                    )}
                </TouchableOpacity>
            }
        >
            <View className="space-y-4">
                <Controller
                    control={control}
                    name="organization"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <FormField
                            label="Organization / Employer"
                            placeholder="e.g. Meru County Government"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            error={errors.organization?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="jobTitle"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <FormField
                            label="Job Title"
                            placeholder="e.g. Senior Dental Officer"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            error={errors.jobTitle?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="jobGroupId"
                    render={({ field: { onChange, value } }) => (
                        <FormPicker
                            label="Job Group"
                            items={jobGroups}
                            onValueChange={(val) => {
                                const jg = jobGroups.find(j => j.value === val);
                                onChange(val);
                                setValue('jobGroup', jg?.code || '');
                            }}
                            value={value}
                            error={errors.jobGroupId?.message}
                            placeholder="Select job group"
                        />
                    )}
                />

                <View className="flex-row items-center mb-4 ml-1">
                    <TouchableOpacity 
                        onPress={() => control._names.mount.add('isCurrent')}
                        className={`w-5 h-5 border rounded ${isCurrent ? 'bg-[#004aad] border-[#004aad]' : 'border-gray-300'} items-center justify-center mr-2`}
                    >
                        {isCurrent && <View className="w-2 h-2 bg-white rounded-full" />}
                    </TouchableOpacity>
                    <Text className="text-sm font-medium text-gray-700">I currently work here</Text>
                </View>

                <Controller
                    control={control}
                    name="startDate"
                    render={({ field: { onChange, value } }) => (
                        <FormDatePicker
                            label="Start Date"
                            value={value}
                            onChange={onChange}
                            error={errors.startDate?.message}
                        />
                    )}
                />

                {!isCurrent && (
                    <Controller
                        control={control}
                        name="endDate"
                        render={({ field: { onChange, value } }) => (
                            <FormDatePicker
                                label="End Date"
                                value={value || ''}
                                onChange={onChange}
                                error={errors.endDate?.message}
                            />
                        )}
                    />
                )}

                <Controller
                    control={control}
                    name="responsibilities"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <FormField
                            label="Responsibilities"
                            placeholder="Describe your key roles..."
                            multiline
                            numberOfLines={4}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            error={errors.responsibilities?.message}
                        />
                    )}
                />
            </View>
        </FormLayout>
    );
}
