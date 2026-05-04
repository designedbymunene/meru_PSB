import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, TextInput, View } from 'react-native';
import * as z from 'zod';
import { FormField } from '@/components/ui/form-field';
import { FormLayout } from '@/components/ui/form-layout';
import { FormPicker } from '@/components/ui/form-picker';
import { apiClient, getApiErrorMessage } from '@/lib/api/client';
import { 
    useEducationLevels, 
    useEducationGrades, 
    useInstitutions, 
    useCourses 
} from '@/lib/api/reference';
import { runOfflineCapableMutation } from '@/lib/offline-mutations/mutation-strategy';
import { GraduationCap, School, Award, Calendar } from 'lucide-react-native';

const qualificationSchema = z.object({
    level: z.enum(['DOCTORATE', 'MASTERS', 'BACHELORS', 'DIPLOMA', 'CERTIFICATE', 'KCSE', 'KCPE', 'OTHER']),
    course: z.string().min(1, 'Course name is required'),
    courseId: z.coerce.number().optional(),
    institution: z.string().min(1, 'Institution is required'),
    institutionId: z.coerce.number().optional(),
    grade: z.string().optional(),
    yearStart: z.coerce.number().min(1950, 'Invalid year').optional(),
    yearEnd: z.coerce.number().min(1950, 'Invalid year').optional(),
})
.refine((data) => {
    if (data.yearStart && data.yearEnd) {
        return data.yearEnd >= data.yearStart;
    }
    return true;
}, {
    message: "Year End must be greater than or equal to Year Start",
    path: ["yearEnd"],
});

type QualificationData = z.infer<typeof qualificationSchema>;

export default function AddQualificationScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Reference Queries
    const { data: levelsResponse } = useEducationLevels();
    const levels = (levelsResponse?.data || []).map((l: any) => ({ label: l.name, value: l.code, id: l.id }));

    const { data: institutionsResponse } = useInstitutions();
    const institutions = (institutionsResponse?.data || []).map((i: any) => ({ label: i.name, value: i.id }));

    const { data: coursesResponse } = useCourses();
    const courses = (coursesResponse?.data || []).map((c: any) => ({ label: c.name, value: c.id }));

    // Refs for keyboard navigation
    const courseRef = useRef<TextInput>(null);
    const institutionRef = useRef<TextInput>(null);
    const gradeRef = useRef<TextInput>(null);
    const yearStartRef = useRef<TextInput>(null);
    const yearEndRef = useRef<TextInput>(null);

    const mutation = useMutation({
        mutationFn: async (data: QualificationData) => {
            return runOfflineCapableMutation({
                request: () => apiClient.post('/applicant-profiles/qualifications', data),
                method: 'post',
                path: '/applicant-profiles/qualifications',
                body: data,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['qualifications'] });

            if (result.queued) {
                Alert.alert('Queued', 'Qualification saved offline and will sync when you are back online.');
                router.back();
                return;
            }

            Alert.alert('Success', 'Qualification added successfully');
            router.back();
        },
        onError: (error: unknown) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to add qualification'));
        }
    });

    const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<QualificationData>({
        resolver: zodResolver(qualificationSchema),
        defaultValues: {
            level: 'BACHELORS',
            course: '',
            courseId: undefined,
            institution: '',
            institutionId: undefined,
            grade: '',
            yearStart: new Date().getFullYear() - 4,
            yearEnd: new Date().getFullYear(),
        },
    });

    const selectedLevelCode = watch('level');
    const selectedLevelId = levels.find(l => l.value === selectedLevelCode)?.id;

    const { data: gradesResponse } = useEducationGrades(selectedLevelId);
    const gradeOptions = (gradesResponse?.data || []).map((g: any) => ({ label: g.grade, value: g.grade }));

    const institutionId = watch('institutionId');
    const courseId = watch('courseId');

    return (
        <FormLayout
            title="Add Qualification"
            onBack={() => router.back()}
            isLoading={mutation.isPending}
            submitLabel="Save Qualification"
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
        >
            <View className="space-y-4">
                <Controller
                    control={control}
                    name="level"
                    render={({ field: { onChange, value } }) => (
                        <FormPicker
                            label="Qualification Level"
                            value={value}
                            onValueChange={(val) => {
                                onChange(val);
                                setValue('grade', '');
                            }}
                            items={[
                                ...levels,
                                { label: 'Other', value: 'OTHER' },
                            ]}
                            error={errors.level?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="courseId"
                    render={({ field: { onChange, value } }) => (
                        <FormPicker
                            label="Course / Field of Study"
                            value={value}
                            onValueChange={(val) => {
                                if (val === 'other') {
                                    onChange(undefined);
                                } else {
                                    const course = courses.find(c => c.value === val);
                                    onChange(val);
                                    setValue('course', course?.label || '');
                                }
                            }}
                            items={[
                                ...courses,
                                { label: 'Other (Type manually)', value: 'other' },
                            ]}
                            error={errors.courseId?.message}
                            placeholder="Select course"
                        />
                    )}
                />

                {(!courseId || watch('course')) && (
                    <Controller
                        control={control}
                        name="course"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <FormField
                                ref={courseRef}
                                label="Course Name (Custom)"
                                placeholder="Enter course name"
                                icon={GraduationCap}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                error={errors.course?.message}
                                editable={!courseId}
                            />
                        )}
                    />
                )}

                <Controller
                    control={control}
                    name="institutionId"
                    render={({ field: { onChange, value } }) => (
                        <FormPicker
                            label="Institution"
                            value={value}
                            onValueChange={(val) => {
                                if (val === 'other') {
                                    onChange(undefined);
                                } else {
                                    const inst = institutions.find(i => i.value === val);
                                    onChange(val);
                                    setValue('institution', inst?.label || '');
                                }
                            }}
                            items={[
                                ...institutions,
                                { label: 'Other (Type manually)', value: 'other' },
                            ]}
                            error={errors.institutionId?.message}
                            placeholder="Select institution"
                        />
                    )}
                />

                {(!institutionId || watch('institution')) && (
                    <Controller
                        control={control}
                        name="institution"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <FormField
                                ref={institutionRef}
                                label="Institution Name (Custom)"
                                placeholder="Enter institution name"
                                icon={School}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                error={errors.institution?.message}
                                editable={!institutionId}
                            />
                        )}
                    />
                )}

                <Controller
                    control={control}
                    name="grade"
                    render={({ field: { onChange, value } }) => (
                        gradeOptions.length > 0 ? (
                            <FormPicker
                                label="Grade"
                                value={value}
                                onValueChange={onChange}
                                items={[
                                    ...gradeOptions,
                                    { label: 'Other', value: 'OTHER' },
                                ]}
                                error={errors.grade?.message}
                                placeholder="Select grade"
                            />
                        ) : (
                            <FormField
                                ref={gradeRef}
                                label="Grade"
                                placeholder="e.g. First Class"
                                icon={Award}
                                onChangeText={onChange}
                                value={value}
                                error={errors.grade?.message}
                            />
                        )
                    )}
                />


                <View className="flex-row gap-4">
                    <View className="flex-1">
                        <Controller
                            control={control}
                            name="yearStart"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <FormField
                                    ref={yearStartRef}
                                    label="Year Started"
                                    placeholder="YYYY"
                                    icon={Calendar}
                                    keyboardType="number-pad"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value?.toString()}
                                    error={errors.yearStart?.message}
                                    nextFieldRef={yearEndRef}
                                />
                            )}
                        />
                    </View>
                    <View className="flex-1">
                        <Controller
                            control={control}
                            name="yearEnd"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <FormField
                                    ref={yearEndRef}
                                    label="Year Completed"
                                    placeholder="YYYY"
                                    icon={Calendar}
                                    keyboardType="number-pad"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value?.toString()}
                                    error={errors.yearEnd?.message}
                                />
                            )}
                        />
                    </View>
                </View>
            </View>
            <View className="h-6" />
        </FormLayout>
    );
}
