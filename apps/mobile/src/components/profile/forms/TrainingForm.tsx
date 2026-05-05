import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormField } from '@/components/ui/form-field';
import { BookOpen, School, Calendar, FileText } from 'lucide-react-native';

const trainingCourseSchema = z.object({
    courseName: z.string().min(1, 'Course name is required'),
    institution: z.string().optional(),
    grade: z.string().optional(),
    year: z.coerce.number().min(1950, 'Invalid year').optional(),
    description: z.string().optional(),
});

export type TrainingCourseData = z.infer<typeof trainingCourseSchema>;

interface TrainingFormProps {
    initialData?: Partial<TrainingCourseData>;
    onSubmit: (data: TrainingCourseData) => void;
}

export interface FormHandle {
    submit: () => void;
}

export const TrainingForm = forwardRef<FormHandle, TrainingFormProps>(({ initialData, onSubmit }, ref) => {
    const { control, handleSubmit, formState: { errors }, reset } = useForm<TrainingCourseData>({
        resolver: zodResolver(trainingCourseSchema),
        defaultValues: {
            courseName: '',
            institution: '',
            grade: '',
            year: new Date().getFullYear(),
            description: '',
            ...initialData
        },
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

    useImperativeHandle(ref, () => ({
        submit: () => {
            handleSubmit(onSubmit)();
        }
    }));

    const courseRef = useRef<TextInput>(null);
    const institutionRef = useRef<TextInput>(null);

    return (
        <View className="space-y-4">
            <Controller
                control={control}
                name="courseName"
                render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                        ref={courseRef}
                        label="Course Name"
                        placeholder="e.g. Strategic Leadership"
                        icon={BookOpen}
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
                        ref={institutionRef}
                        label="Institution"
                        placeholder="e.g. Kenya School of Government"
                        icon={School}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.institution?.message}
                    />
                )}
            />

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

            <Controller
                control={control}
                name="year"
                render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                        label="Year"
                        placeholder="YYYY"
                        icon={Calendar}
                        keyboardType="number-pad"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value?.toString()}
                        error={errors.year?.message}
                    />
                )}
            />

            <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                        label="Description"
                        placeholder="Briefly describe the course content..."
                        icon={FileText}
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
    );
});
