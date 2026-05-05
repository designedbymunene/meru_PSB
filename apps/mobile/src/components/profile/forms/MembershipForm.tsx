import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormField } from '@/components/ui/form-field';
import { FormPicker } from '@/components/ui/form-picker';
import { FormDatePicker } from '@/components/ui/form-date-picker';
import { Award, ShieldCheck, Calendar } from 'lucide-react-native';

const membershipSchema = z.object({
    membershipBody: z.string().min(1, 'Membership body is required'),
    membershipType: z.string().min(1, 'Membership type is required'),
    registrationNumber: z.string().optional(),
    expiryDate: z.string().optional().nullable(),
});

export type MembershipData = z.infer<typeof membershipSchema>;

interface MembershipFormProps {
    initialData?: Partial<MembershipData>;
    onSubmit: (data: MembershipData) => void;
}

export interface FormHandle {
    submit: () => void;
}

export const MembershipForm = forwardRef<FormHandle, MembershipFormProps>(({ initialData, onSubmit }, ref) => {
    const { control, handleSubmit, formState: { errors }, reset } = useForm<MembershipData>({
        resolver: zodResolver(membershipSchema),
        defaultValues: {
            membershipBody: '',
            membershipType: '',
            registrationNumber: '',
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

    const bodyRef = useRef<TextInput>(null);
    const registrationRef = useRef<TextInput>(null);

    return (
        <View className="space-y-4">
            <Controller
                control={control}
                name="membershipBody"
                render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                        ref={bodyRef}
                        label="Membership Body"
                        placeholder="e.g. Kenya Institute of Management"
                        icon={ShieldCheck}
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
                render={({ field: { onChange, value } }) => (
                    <FormPicker
                        label="Membership Type"
                        icon={Award}
                        value={value}
                        onValueChange={onChange}
                        items={[
                            { label: 'Full Member', value: 'Full Member' },
                            { label: 'Associate Member', value: 'Associate Member' },
                            { label: 'Student Member', value: 'Student Member' },
                            { label: 'Fellow', value: 'Fellow' },
                            { label: 'Honorary', value: 'Honorary' },
                            { label: 'Practitioner', value: 'Practitioner' },
                            { label: 'Other', value: 'Other' },
                        ]}
                        placeholder="Select membership type"
                        error={errors.membershipType?.message}
                    />
                )}
            />

            <Controller
                control={control}
                name="registrationNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                        ref={registrationRef}
                        label="Membership Number (Optional)"
                        placeholder="Enter your membership ID"
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
