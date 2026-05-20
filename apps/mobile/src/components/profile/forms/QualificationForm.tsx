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
    level: z.string().min(1, 'Level is required'),
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
    const allLevels = levelsResponse?.data || [];
    const levels = allLevels
        .filter((l: any) => l.name.toLowerCase().includes('level'))
        .map((l: any) => ({ label: l.name, value: l.code, id: l.id }));

    const { data: institutionsResponse } = useInstitutions();
    const institutions = (institutionsResponse?.data || []).map((i: any) => ({ label: i.name, value: i.id }));

    const { data: coursesResponse } = useCourses();
    const courses = (coursesResponse?.data || []).map((c: any) => ({ label: c.name, value: c.id }));

    const { control, handleSubmit, formState: { errors: formErrors }, reset, watch, setValue } = useForm<any>({
        resolver: zodResolver(qualificationSchema),
        defaultValues: {
            level: 'KNQF_LEVEL_7',
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

    const errors = formErrors as Record<string, any>;

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

    const isLevel1To4 = (levelCode: string) => {
        return ['KNQF_LEVEL_1', 'KNQF_LEVEL_2', 'KNQF_LEVEL_3', 'KNQF_LEVEL_4'].includes(levelCode);
    };

    const isBasicLevel = ['KCPE', 'KCSE'].includes(selectedLevelCode) || isLevel1To4(selectedLevelCode);
    const selectedLevelId = allLevels.find((l: any) => l.code === selectedLevelCode)?.id;

    const { data: gradesResponse } = useEducationGrades(selectedLevelId);
    const apiGrades = (gradesResponse?.data || []).map((g: any) => ({ label: g.grade, value: g.grade }));

    const getDefaultGrades = (level: string) => {
        if (isLevel1To4(level) || ['KCSE', 'KCPE'].includes(level)) {
            return ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'].map(g => ({ label: g, value: g }));
        }

        switch (level) {
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

    const gradeOptions = isLevel1To4(selectedLevelCode) 
        ? ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'].map(g => ({ label: g, value: g }))
        : (apiGrades.length > 0 ? apiGrades : getDefaultGrades(selectedLevelCode));

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
            let courseVal = selectedLevelCode;
            if (selectedLevelCode === 'KNQF_LEVEL_1' || selectedLevelCode === 'KCPE') {
                courseVal = 'Primary Education';
            } else if (selectedLevelCode === 'KNQF_LEVEL_2') {
                courseVal = 'Junior Secondary Education';
            } else if (selectedLevelCode === 'KNQF_LEVEL_3' || selectedLevelCode === 'KCSE') {
                courseVal = 'Secondary Education';
            } else if (selectedLevelCode === 'KNQF_LEVEL_4') {
                courseVal = 'Artisan Certificate';
            }
            setValue('course', courseVal);
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
                                        const course = courses.find((c: any) => c.value === val);
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

            {isBasicLevel ? (
                <Controller
                    control={control}
                    name="institution"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <FormField
                            ref={institutionRef}
                            label="School / Institution"
                            placeholder={
                                selectedLevelCode === 'KNQF_LEVEL_1' || selectedLevelCode === 'KCPE' 
                                    ? "Enter primary school name" 
                                    : selectedLevelCode === 'KNQF_LEVEL_2'
                                    ? "Enter junior secondary school name"
                                    : selectedLevelCode === 'KNQF_LEVEL_3' || selectedLevelCode === 'KCSE'
                                    ? "Enter secondary school name"
                                    : "Enter artisan school name"
                            }
                            icon={School}
                            onBlur={onBlur}
                            onChangeText={(val) => {
                                setValue('institutionId', undefined);
                                onChange(val);
                            }}
                            value={value}
                            error={errors.institution?.message}
                        />
                    )}
                />
            ) : (
                <>
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
                                        const inst = institutions.find((i: any) => i.value === val);
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
                </>
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
