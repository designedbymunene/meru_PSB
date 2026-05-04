import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import * as z from 'zod';
import { FormField } from '@/components/ui/form-field';
import { FormLayout } from '@/components/ui/form-layout';
import { apiClient, getApiErrorMessage } from '@/lib/api/client';
import { runOfflineCapableMutation } from '@/lib/offline-mutations/mutation-strategy';

const trainingCourseSchema = z.object({
    courseName: z.string().min(1, 'Course name is required'),
    institution: z.string().optional(),
    grade: z.string().optional(),
    year: z.coerce.number().min(1950, 'Invalid year').optional(),
    description: z.string().optional(),
});

type TrainingCourseData = z.infer<typeof trainingCourseSchema>;

export default function AddTrainingCourseScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: TrainingCourseData) => {
            return runOfflineCapableMutation({
                request: () => apiClient.post('/applicant-profiles/training-courses', data),
                method: 'post',
                path: '/applicant-profiles/training-courses',
                body: data,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['training-courses'] });

            if (result.queued) {
                Alert.alert('Queued', 'Training course saved offline and will sync when you are back online.');
                router.back();
                return;
            }

            Alert.alert('Success', 'Training course added successfully');
            router.back();
        },
        onError: (error: unknown) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to add course'));
        }
    });

    const { control, handleSubmit, formState: { errors } } = useForm<TrainingCourseData>({
        resolver: zodResolver(trainingCourseSchema),
        defaultValues: {
            courseName: '',
            institution: '',
            grade: '',
            year: new Date().getFullYear(),
            description: '',
        },
    });

    return (
        <FormLayout
            title="Add Training"
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
                        <Text className="text-white font-black text-base uppercase tracking-widest">Save Course</Text>
                    )}
                </TouchableOpacity>
            }
        >
            <View className="space-y-4">
                <Controller
                    control={control}
                    name="courseName"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <FormField
                            label="Course Name"
                            placeholder="e.g. Strategic Leadership"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            error={errors.courseName?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="institution"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <FormField
                            label="Institution"
                            placeholder="e.g. Kenya School of Government"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            error={errors.institution?.message}
                        />
                    )}
                />

                <View className="flex-row space-x-4">
                    <View className="flex-1 mr-2">
                        <Controller
                            control={control}
                            name="grade"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <FormField
                                    label="Grade (Optional)"
                                    placeholder="e.g. A"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    error={errors.grade?.message}
                                />
                            )}
                        />
                    </View>
                    <View className="flex-1 ml-2">
                        <Controller
                            control={control}
                            name="year"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <FormField
                                    label="Year"
                                    placeholder="YYYY"
                                    keyboardType="number-pad"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value?.toString()}
                                    error={errors.year?.message}
                                />
                            )}
                        />
                    </View>
                </View>

                <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <FormField
                            label="Description"
                            placeholder="Briefly describe the course content..."
                            multiline
                            numberOfLines={3}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            error={errors.description?.message}
                        />
                    )}
                />
            </View>
        </FormLayout>
    );
}
