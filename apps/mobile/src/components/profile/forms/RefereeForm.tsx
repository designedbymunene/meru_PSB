import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormField } from '@/components/ui/form-field';
import { FormPicker } from '@/components/ui/form-picker';
import { User, Briefcase, Phone, Mail, Link2 } from 'lucide-react-native';

const refereeSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    organization: z.string().min(1, 'Organization is required'),
    designation: z.string().min(1, 'Designation is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    email: z.string().email('Valid email is required'),
    relationship: z.string().min(1, 'Relationship is required'),
});

export type RefereeData = z.infer<typeof refereeSchema>;

interface RefereeFormProps {
    initialData?: Partial<RefereeData>;
    onSubmit: (data: RefereeData) => void;
}

export interface FormHandle {
    submit: () => void;
}

export const RefereeForm = forwardRef<FormHandle, RefereeFormProps>(({ initialData, onSubmit }, ref) => {
    const { control, handleSubmit, formState: { errors }, reset } = useForm<RefereeData>({
        resolver: zodResolver(refereeSchema),
        defaultValues: {
            fullName: '',
            organization: '',
            designation: '',
            phone: '',
            email: '',
            relationship: '',
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

    const organizationRef = useRef<any>(null);
    const designationRef = useRef<any>(null);
    const phoneRef = useRef<any>(null);
    const emailRef = useRef<any>(null);

    return (
        <View className="space-y-4">
            <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                        label="Full Name"
                        placeholder="Referee's full name"
                        icon={User}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.fullName?.message}
                    />
                )}
            />

            <Controller
                control={control}
                name="organization"
                render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                        ref={organizationRef}
                        label="Organization"
                        placeholder="e.g. Meru County Govt"
                        icon={Briefcase}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.organization?.message}
                    />
                )}
            />

            <Controller
                control={control}
                name="designation"
                render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                        ref={designationRef}
                        label="Designation / Title"
                        placeholder="e.g. Chief Officer"
                        icon={Briefcase}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.designation?.message}
                    />
                )}
            />

            <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                        ref={phoneRef}
                        label="Phone Number"
                        placeholder="07..."
                        icon={Phone}
                        keyboardType="phone-pad"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.phone?.message}
                    />
                )}
            />

            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                        ref={emailRef}
                        label="Email Address"
                        placeholder="referee@example.com"
                        icon={Mail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.email?.message}
                    />
                )}
            />

            <Controller
                control={control}
                name="relationship"
                render={({ field: { onChange, value } }) => (
                    <FormPicker
                        label="Relationship"
                        icon={Link2}
                        value={value}
                        onValueChange={onChange}
                        items={[
                            { label: 'Supervisor', value: 'Supervisor' },
                            { label: 'Colleague', value: 'Colleague' },
                            { label: 'Academic Mentor', value: 'Academic Mentor' },
                            { label: 'Professional Reference', value: 'Professional Reference' },
                            { label: 'Other', value: 'Other' },
                        ]}
                        placeholder="Select relationship"
                        error={errors.relationship?.message}
                    />
                )}
            />
        </View>
    );
});
