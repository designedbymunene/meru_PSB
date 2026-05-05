import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormField } from '@/components/ui/form-field';
import { FormPicker } from '@/components/ui/form-picker';
import { useEducationLevels, useEducationGrades, useInstitutions, useCourses } from '@/lib/api/reference';
import { GraduationCap, School, Award, Calendar, CheckCircle2 } from 'lucide-react-native';

const qualificationSchema = z.object({
    level: z.enum(['DOCTORATE', 'MASTERS', 'BACHELORS', 'DIPLOMA', 'CERTIFICATE', 'KCSE', 'KCPE', 'OTHER']),
    course: z.string().min(1, 'Course name is required'),
    courseId: z.coerce.number().optional(),
    institution: z.string().min(1, 'Institution is required'),
    institutionId: z.coerce.number().optional(),
    grade: z.string().optional(),
    yearStart: z.coerce.number().min(1950, 'Invalid year').optional(),
    yearEnd: z.coerce.number().min(1950, 'Invalid year').optional().nullable(),
    stillStudying: z.boolean().default(false),
})
.refine((data) => {
    if (data.yearStart && data.yearEnd && !data.stillStudying) {
        return data.yearEnd >= data.yearStart;
    }
    return true;
}, {
    message: "Year End must be greater than or equal to Year Start",
    path: ["yearEnd"],
});

export type QualificationData = z.infer<typeof qualificationSchema>;

interface QualificationFormProps {
    initialData?: Partial<QualificationData>;
    onSubmit: (data: QualificationData) => void;
}

export interface FormHandle {
    submit: () => void;
}

export const QualificationForm = forwardRef<FormHandle, QualificationFormProps>(({ initialData, onSubmit }, ref) => {
    // Reference Queries
    const { data: levelsResponse } = useEducationLevels();
    const levels = (levelsResponse?.data || []).map((l: any) => ({ label: l.name, value: l.code, id: l.id }));

    const { data: institutionsResponse } = useInstitutions();
    const institutions = (institutionsResponse?.data || []).map((i: any) => ({ label: i.name, value: i.id }));

    const { data: coursesResponse } = useCourses();
    const courses = (coursesResponse?.data || []).map((c: any) => ({ label: c.name, value: c.id }));

    const { control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<QualificationData>({
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
            stillStudying: false,
            ...initialData
        },
    });

    useEffect(() => {
        if (initialData) {
            const formattedData = {
                ...initialData,
                stillStudying: initialData.stillStudying ?? !initialData.yearEnd
            };
            reset(formattedData);
        }
    }, [initialData, reset]);

    useImperativeHandle(ref, () => ({
        submit: () => {
            handleSubmit(onSubmit)();
        }
    }));

    const selectedLevelCode = watch('level');
    const stillStudying = watch('stillStudying');
    const isBasicLevel = ['KCPE', 'KCSE'].includes(selectedLevelCode);
    const selectedLevelId = levels.find(l => l.value === selectedLevelCode)?.id;

    const { data: gradesResponse } = useEducationGrades(selectedLevelId);
    const apiGrades = (gradesResponse?.data || []).map((g: any) => ({ label: g.grade, value: g.grade }));

    const getDefaultGrades = (level: string) => {
        switch (level) {
            case 'KCSE': return ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'].map(g => ({ label: g, value: g }));
            case 'KCPE': return ['A', 'B', 'C', 'D', 'E'].map(g => ({ label: g, value: g }));
            case 'DOCTORATE':
            case 'MASTERS':
            case 'BACHELORS':
            case 'DIPLOMA':
            case 'CERTIFICATE':
                return [
                    { label: 'First Class Honours', value: 'First Class Honours' },
                    { label: 'Second Class Honours (Upper Division)', value: 'Second Class Honours (Upper Division)' },
                    { label: 'Second Class Honours (Lower Division)', value: 'Second Class Honours (Lower Division)' },
                    { label: 'Pass', value: 'Pass' },
                    { label: 'Credit', value: 'Credit' },
                    { label: 'Distinction', value: 'Distinction' },
                ];
            default: return [];
        }
    };

    const gradeOptions = apiGrades.length > 0 ? apiGrades : getDefaultGrades(selectedLevelCode);

    const courseRef = useRef<TextInput>(null);
    const institutionRef = useRef<TextInput>(null);
    const gradeRef = useRef<TextInput>(null);
    const yearStartRef = useRef<TextInput>(null);
    const yearEndRef = useRef<TextInput>(null);

    const [useCustomInstitution, setUseCustomInstitution] = React.useState(!!initialData?.institution && !initialData?.institutionId);
    const [useCustomCourse, setUseCustomCourse] = React.useState(!!initialData?.course && !initialData?.courseId);

    // Auto-fill course for basic levels
    useEffect(() => {
        if (isBasicLevel) {
            setValue('course', selectedLevelCode);
            setValue('courseId', undefined);
            setUseCustomCourse(false);
        }
    }, [selectedLevelCode, isBasicLevel, setValue]);

    // Auto-clear yearEnd when still studying is toggled
    useEffect(() => {
        if (stillStudying) {
            setValue('yearEnd', null);
        }
    }, [stillStudying, setValue]);

    return (
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

            {!isBasicLevel && (
                <>
                    <Controller
                        control={control}
                        name="courseId"
                        render={({ field: { onChange, value } }) => (
                            <FormPicker
                                label="Course / Field of Study"
                                value={value}
                                onValueChange={(val) => {
                                    if (val === 'other') {
                                        setUseCustomCourse(true);
                                        onChange(undefined);
                                        setValue('course', '');
                                        setTimeout(() => courseRef.current?.focus(), 100);
                                    } else {
                                        setUseCustomCourse(false);
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

                    {useCustomCourse && (
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
                                />
                            )}
                        />
                    )}
                </>
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
                                setUseCustomInstitution(true);
                                onChange(undefined);
                                setValue('institution', '');
                                setTimeout(() => institutionRef.current?.focus(), 100);
                            } else {
                                setUseCustomInstitution(false);
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

            {useCustomInstitution && (
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
                    />
                )}
            />

            {!stillStudying && (
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
            )}

            <Controller
                control={control}
                name="stillStudying"
                render={({ field: { onChange, value } }) => (
                    <View className="flex-row items-center gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <CheckCircle2 size={20} color={value ? '#2563eb' : '#cbd5e1'} />
                        <View className="flex-1">
                            <View className="flex-row items-center">
                                <Text className="text-gray-900 dark:text-white font-medium flex-1">Currently Studying</Text>
                                <View className={`w-10 h-6 rounded-full ${value ? 'bg-blue-600' : 'bg-gray-300'} justify-center items-center`}>
                                    <View className={`w-5 h-5 rounded-full bg-white transition-all ${value ? 'translate-x-2' : '-translate-x-2'}`} />
                                </View>
                            </View>
                            <Text className="text-gray-600 dark:text-gray-400 text-xs mt-1">Toggle if you're still studying this qualification</Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
});
