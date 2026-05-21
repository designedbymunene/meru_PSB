import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormField } from '@/components/ui/form-field';
import { FormDatePicker } from '@/components/ui/form-date-picker';
import { FormPicker } from '@/components/ui/form-picker';
import { useCounties, useConstituencies, useWards, useEthnicities } from '@/lib/api/reference';
import { User, Mail, Fingerprint, Phone, Globe, MapPin, Users, Heart } from 'lucide-react-native';

const personalDetailsSchema = z.object({
    fullName: z.string().min(2, 'Full Name is required'),
    idNumber: z.string().min(6, 'ID Number is required'),
    phoneNumber: z.string().min(10, 'Valid phone number is required'),
    email: z.string().email('Valid email is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['Male', 'Female', 'Other']).default('Male'),
    ethnicityId: z.coerce.number().min(1, 'Ethnicity is required'),
    homeCountyId: z.coerce.number().min(1, 'Home County is required'),
    homeSubCountyId: z.coerce.number().min(1, 'Home Sub-County is required'),
    wardId: z.coerce.number().min(1, 'Ward is required'),
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

    const { control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<PersonalDetailsData>({
        resolver: zodResolver(personalDetailsSchema),
        defaultValues: {
            fullName: '',
            idNumber: '',
            phoneNumber: '',
            email: '',
            dateOfBirth: '',
            gender: 'Male',
            ethnicityId: null as any,
            homeCountyId: null as any,
            homeSubCountyId: null as any,
            wardId: null as any,
            impairment: false,
            impairmentDetails: '',
        },
    });

    // Watch for location dependencies
    const selectedCountyId = watch('homeCountyId');
    const selectedSubCountyId = watch('homeSubCountyId');

    // Reference Queries
    const { data: countiesResponse, isLoading: isLoadingCounties } = useCounties();
    const counties = (countiesResponse?.data || []).map((c: any) => ({ label: c.name, value: c.id }));

    const { data: ethnicitiesResponse, isLoading: isLoadingEthnicities } = useEthnicities();
    const ethnicities = (ethnicitiesResponse?.data || []).map((e: any) => ({ label: e.name, value: e.id }));

    const { data: subCountiesResponse, isFetching: isFetchingSubCounties } = useConstituencies(typeof selectedCountyId === 'number' && selectedCountyId > 0 ? selectedCountyId : undefined);
    const subCounties = (subCountiesResponse?.data || []).map((sc: any) => ({ label: sc.name, value: sc.id }));

    const { data: wardsResponse, isFetching: isFetchingWards } = useWards(typeof selectedSubCountyId === 'number' && selectedSubCountyId > 0 ? selectedSubCountyId : undefined);
    const wards = (wardsResponse?.data || []).map((w: any) => ({ label: w.name, value: w.id }));

    // Cascading selection clearing
    useEffect(() => {
        if (!selectedCountyId || selectedCountyId <= 0) {
            setValue('homeSubCountyId', null as any);
            setValue('wardId', null as any);
        }
    }, [selectedCountyId, setValue]);

    useEffect(() => {
        if (!selectedSubCountyId || selectedSubCountyId <= 0) {
            setValue('wardId', null as any);
        }
    }, [selectedSubCountyId, setValue]);

    useEffect(() => {
        if (initialData && !hasInitialReset) {
            reset({
                ...initialData,
                dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
                homeCountyId: initialData.homeCountyId || null,
                homeSubCountyId: initialData.homeSubCountyId || null,
                wardId: initialData.wardId || null,
                ethnicityId: initialData.ethnicityId || null,
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
        <View className="space-y-4">
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

            <View className="pt-4 pb-2">
                <Text className="text-gray-900 dark:text-white font-black text-lg">Location & Ethnicity</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-xs">These details are required for statutory reporting.</Text>
            </View>

            <Controller
                control={control}
                name="homeCountyId"
                render={({ field: { onChange, value } }) => (
                    <FormPicker
                        label="Home County"
                        items={counties}
                        icon={Globe}
                        onValueChange={(val) => {
                            const numVal = val ? Number(val) : null;
                            onChange(numVal);
                            if (numVal !== value) {
                                setValue('homeSubCountyId', null as any);
                                setValue('wardId', null as any);
                            }
                        }}
                        value={value}
                        error={errors.homeCountyId?.message}
                        placeholder="Select your county"
                        isLoading={isLoadingCounties}
                    />
                )}
            />

            <Controller
                control={control}
                name="homeSubCountyId"
                render={({ field: { onChange, value } }) => (
                    <FormPicker
                        label="Home Sub-County"
                        items={subCounties}
                        icon={MapPin}
                        onValueChange={(val) => {
                            const numVal = val ? Number(val) : null;
                            onChange(numVal);
                            if (numVal !== value) {
                                setValue('wardId', null as any);
                            }
                        }}
                        value={value}
                        error={errors.homeSubCountyId?.message}
                        placeholder="Select sub-county"
                        enabled={!!selectedCountyId && selectedCountyId > 0}
                        isLoading={isFetchingSubCounties && !!selectedCountyId}
                    />
                )}
            />

            <Controller
                control={control}
                name="wardId"
                render={({ field: { onChange, value } }) => (
                    <FormPicker
                        label="Ward"
                        items={wards}
                        icon={MapPin}
                        onValueChange={(val) => onChange(val ? Number(val) : null)}
                        value={value}
                        error={errors.wardId?.message}
                        placeholder="Select ward"
                        enabled={!!selectedSubCountyId && selectedSubCountyId > 0}
                        isLoading={isFetchingWards && !!selectedSubCountyId}
                    />
                )}
            />

            <Controller
                control={control}
                name="ethnicityId"
                render={({ field: { onChange, value } }) => (
                    <FormPicker
                        label="Ethnicity"
                        items={ethnicities}
                        icon={Users}
                        onValueChange={onChange}
                        value={value}
                        error={errors.ethnicityId?.message}
                        placeholder="Select ethnicity"
                        isLoading={isLoadingEthnicities}
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
        </View>
    );
});
