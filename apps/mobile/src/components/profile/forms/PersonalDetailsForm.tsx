import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormField } from '@/components/ui/form-field';
import { FormDatePicker } from '@/components/ui/form-date-picker';
import { FormPicker } from '@/components/ui/form-picker';
import { User, Mail, Fingerprint, Phone, Heart } from 'lucide-react-native';

const personalDetailsSchema = z.object({
    fullName: z.string().min(2, 'Full Name is required'),
    idNumber: z.string().min(6, 'ID Number is required'),
    phoneNumber: z.string().min(10, 'Valid phone number is required'),
    email: z.string().email('Valid email is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['Male', 'Female', 'Other']).default('Male'),
    impairment: z.boolean().default(false),
    impairmentDetails: z.string().optional(),
});

export type PersonalDetailsData = z.infer<typeof personalDetailsSchema>;

interface PersonalDetailsFormProps {
    initialData?: Partial<PersonalDetailsData>;
    onSubmit: (data: PersonalDetailsData) => void;
}

export interface FormHandle {
    submit: () => void;
}

export const PersonalDetailsForm = forwardRef<FormHandle, PersonalDetailsFormProps>(({ initialData, onSubmit }, ref) => {
    const [hasInitialReset, setHasInitialReset] = React.useState(false);

    const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<PersonalDetailsData>({
        resolver: zodResolver(personalDetailsSchema),
        defaultValues: {
            fullName: '',
            idNumber: '',
            phoneNumber: '',
            email: '',
            dateOfBirth: '',
            gender: 'Male',
            impairment: false,
            impairmentDetails: '',
        },
    });

    useEffect(() => {
        if (initialData && !hasInitialReset) {
            reset({
                ...initialData,
                dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
                impairment: !!initialData.impairment,
                impairmentDetails: initialData.impairmentDetails || '',
            } as any);
            setHasInitialReset(true);
        }
    }, [initialData, reset, hasInitialReset]);

    useImperativeHandle(ref, () => ({
        submit: () => {
            handleSubmit(onSubmit)();
        }
    }));

    const emailRef = useRef<TextInput>(null);
    const idNumberRef = useRef<TextInput>(null);
    const phoneRef = useRef<TextInput>(null);

    return (
        <ScrollView className="space-y-4" showsVerticalScrollIndicator={false}>
            <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                        label="Full Name"
                        placeholder="Your full name"
                        icon={User}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.fullName?.message}
                        nextFieldRef={emailRef}
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
                        placeholder="your.email@example.com"
                        icon={Mail}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.email?.message}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        nextFieldRef={idNumberRef}
                    />
                )}
            />
            <Controller
                control={control}
                name="idNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                        ref={idNumberRef}
                        label="ID / Passport Number"
                        placeholder="Enter ID number"
                        icon={Fingerprint}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.idNumber?.message}
                        nextFieldRef={phoneRef}
                    />
                )}
            />
            <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                        ref={phoneRef}
                        label="Phone Number"
                        placeholder="e.g. 0712345678"
                        icon={Phone}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.phoneNumber?.message}
                        keyboardType="phone-pad"
                    />
                )}
            />
            <Controller
                control={control}
                name="dateOfBirth"
                render={({ field: { onChange, value } }) => (
                    <FormDatePicker
                        label="Date of Birth"
                        placeholder="Select your birth date"
                        onChange={onChange}
                        value={value}
                        error={errors.dateOfBirth?.message}
                        maximumDate={new Date()}
                    />
                )}
            />

            <Controller
                control={control}
                name="gender"
                render={({ field: { onChange, value } }) => (
                    <FormPicker
                        label="Gender"
                        items={[
                            { label: 'Male', value: 'Male' },
                            { label: 'Female', value: 'Female' },
                            { label: 'Other', value: 'Other' },
                        ]}
                        icon={User}
                        onValueChange={onChange}
                        value={value}
                        error={errors.gender?.message}
                        placeholder="Select gender"
                    />
                )}
            />

            <Controller
                control={control}
                name="impairment"
                render={({ field: { onChange, value } }) => (
                    <FormPicker
                        label="Do you have any impairment?"
                        items={[
                            { label: 'No', value: false },
                            { label: 'Yes', value: true },
                        ]}
                        icon={Heart}
                        onValueChange={onChange}
                        value={value}
                        error={errors.impairment?.message}
                    />
                )}
            />

            {watch('impairment') && (
                <Controller
                    control={control}
                    name="impairmentDetails"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <FormField
                            label="Impairment Details"
                            placeholder="Please describe your impairment"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            error={errors.impairmentDetails?.message}
                            multiline
                            numberOfLines={3}
                        />
                    )}
                />
            )}
        </ScrollView>
    );
});
