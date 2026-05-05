import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormField } from '@/components/ui/form-field';
import { FormDatePicker } from '@/components/ui/form-date-picker';
import { Award, ShieldCheck, Calendar } from 'lucide-react-native';

const professionalDetailSchema = z.object({
    licenseType: z.string().min(1, 'License type is required'),
    issuingBody: z.string().min(1, 'Issuing body is required'),
    registrationNumber: z.string().min(1, 'Registration number is required'),
    issueDate: z.string().min(1, 'Issue date is required'),
    expiryDate: z.string().optional().nullable(),
});

export type ProfessionalDetailData = z.infer<typeof professionalDetailSchema>;

interface ProfessionalDetailFormProps {
    initialData?: Partial<ProfessionalDetailData>;
    onSubmit: (data: ProfessionalDetailData) => void;
}

export interface FormHandle {
    submit: () => void;
}

export const ProfessionalDetailForm = forwardRef<FormHandle, ProfessionalDetailFormProps>(({ initialData, onSubmit }, ref) => {
    const { control, handleSubmit, formState: { errors }, reset } = useForm<ProfessionalDetailData>({
        resolver: zodResolver(professionalDetailSchema),
        defaultValues: {
            licenseType: '',
            issuingBody: '',
            registrationNumber: '',
            issueDate: '',
            expiryDate: '',
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

    const licenseTypeRef = useRef<TextInput>(null);
    const issuingBodyRef = useRef<TextInput>(null);
    const registrationNumberRef = useRef<TextInput>(null);

    return (
        <View className="space-y-4">
            <Controller
                control={control}
                name="licenseType"
                render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                        ref={licenseTypeRef}
                        label="License / Certificate Type"
                        placeholder="e.g. Practicing License"
                        icon={Award}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.licenseType?.message}
                    />
                )}
            />

            <Controller
                control={control}
                name="issuingBody"
                render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                        ref={issuingBodyRef}
                        label="Issuing Body"
                        placeholder="e.g. Medical Practitioners Board"
                        icon={ShieldCheck}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.issuingBody?.message}
                    />
                )}
            />

            <Controller
                control={control}
                name="registrationNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                        ref={registrationNumberRef}
                        label="Registration / License Number"
                        placeholder="Enter your registration number"
                        icon={ShieldCheck}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.registrationNumber?.message}
                    />
                )}
            />

            <Controller
                control={control}
                name="issueDate"
                render={({ field: { onChange, value } }) => (
                    <FormDatePicker
                        label="Issue Date"
                        value={value}
                        onChange={onChange}
                        error={errors.issueDate?.message}
                        maximumDate={new Date()}
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
    );
});
