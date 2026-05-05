import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormField } from '@/components/ui/form-field';
import { FormPicker } from '@/components/ui/form-picker';
import { FormDatePicker } from '@/components/ui/form-date-picker';
import { useJobGroups } from '@/lib/api/job-groups';

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
}).refine((data) => {
    if (data.startDate && data.endDate && !data.isCurrent) {
        return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
}, {
    message: "End date must be after start date",
    path: ["endDate"],
});

export type EmploymentData = z.infer<typeof employmentSchema>;

interface EmploymentFormProps {
    initialData?: Partial<EmploymentData>;
    onSubmit: (data: EmploymentData) => void;
}

export interface FormHandle {
    submit: () => void;
}

export const EmploymentForm = forwardRef<FormHandle, EmploymentFormProps>(({ initialData, onSubmit }, ref) => {
    const { data: jobGroupsResponse } = useJobGroups();
    const jobGroups = (jobGroupsResponse || []).map((jg: any) => ({ 
        label: jg.name, 
        value: jg.id
    }));

    const { control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<EmploymentData>({
        resolver: zodResolver(employmentSchema),
        defaultValues: {
            organization: '',
            jobTitle: '',
            startDate: '',
            endDate: '',
            jobGroup: '',
            isCurrent: false,
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

    const isCurrent = watch('isCurrent');

    const handleToggleCurrent = () => {
        const newValue = !isCurrent;
        setValue('isCurrent', newValue);
        if (newValue) {
            setValue('endDate', null);
        }
    };

    const organizationRef = useRef<TextInput>(null);
    const jobTitleRef = useRef<TextInput>(null);
    const responsibilitiesRef = useRef<TextInput>(null);

    return (
        <View className="space-y-4">
            <Controller
                control={control}
                name="organization"
                render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                        ref={organizationRef}
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
                        ref={jobTitleRef}
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
                            setValue('jobGroup', jg?.label || '');
                        }}
                        value={value}
                        error={errors.jobGroupId?.message}
                        placeholder="Select job group"
                    />
                )}
            />

            <View className="flex-row items-center mb-4 ml-1">
                <TouchableOpacity 
                    onPress={handleToggleCurrent}
                    className={`w-6 h-6 border rounded-lg ${isCurrent ? 'bg-[#004aad] border-[#004aad]' : 'border-gray-300'} items-center justify-center mr-3`}
                >
                    {isCurrent && <View className="w-2.5 h-2.5 bg-white rounded-sm" />}
                </TouchableOpacity>
                <Text className="text-sm font-bold text-gray-700">I currently work here</Text>
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
                        ref={responsibilitiesRef}
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
    );
});
