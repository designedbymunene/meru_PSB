import React, { useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormPicker } from '@/components/ui/form-picker';
import { useCounties, useConstituencies, useWards, useEthnicities } from '@/lib/api/reference';
import { MapPin, Globe, Users } from 'lucide-react-native';

const locationDetailsSchema = z.object({
    ethnicityId: z.coerce.number().min(1, 'Ethnicity is required'),
    homeCountyId: z.coerce.number().min(1, 'Home County is required'),
    homeSubCountyId: z.coerce.number().min(1, 'Home Sub-County is required'),
    wardId: z.coerce.number().min(1, 'Ward is required'),
});

export type LocationDetailsData = z.infer<typeof locationDetailsSchema>;

interface LocationDetailsFormProps {
    initialData?: Partial<LocationDetailsData>;
    onSubmit: (data: LocationDetailsData) => void;
}

export interface FormHandle {
    submit: () => void;
}

export const LocationDetailsForm = forwardRef<FormHandle, LocationDetailsFormProps>(({ initialData, onSubmit }, ref) => {
    // Reference Queries
    const { data: countiesResponse } = useCounties();
    const counties = (countiesResponse?.data || []).map((c: any) => ({ label: c.name, value: c.id }));

    const { data: ethnicitiesResponse } = useEthnicities();
    const ethnicities = (ethnicitiesResponse?.data || []).map((e: any) => ({ label: e.name, value: e.id }));

    const { control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<LocationDetailsData>({
        resolver: zodResolver(locationDetailsSchema),
        defaultValues: {
            ethnicityId: undefined,
            homeCountyId: undefined,
            homeSubCountyId: undefined,
            wardId: undefined,
            ...initialData
        },
    });

    const selectedCountyId = watch('homeCountyId');
    const selectedSubCountyId = watch('homeSubCountyId');

    const { data: subCountiesResponse } = useConstituencies(selectedCountyId);
    const subCounties = (subCountiesResponse?.data || []).map((sc: any) => ({ label: sc.name, value: sc.id }));

    const { data: wardsResponse } = useWards(selectedSubCountyId);
    const wards = (wardsResponse?.data || []).map((w: any) => ({ label: w.name, value: w.id }));

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

    return (
        <View className="space-y-4">
            <Controller
                control={control}
                name="homeCountyId"
                render={({ field: { onChange, value } }) => (
                    <FormPicker
                        label="Home County"
                        items={counties}
                        icon={Globe}
                        onValueChange={(val) => {
                            onChange(val);
                            setValue('homeSubCountyId', undefined);
                            setValue('wardId', undefined);
                        }}
                        value={value}
                        error={errors.homeCountyId?.message}
                        placeholder="Select your county"
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
                            onChange(val);
                            setValue('wardId', undefined);
                        }}
                        value={value}
                        error={errors.homeSubCountyId?.message}
                        placeholder="Select sub-county"
                        enabled={!!selectedCountyId}
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
                        onValueChange={onChange}
                        value={value}
                        error={errors.wardId?.message}
                        placeholder="Select ward"
                        enabled={!!selectedSubCountyId}
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
                    />
                )}
            />
        </View>
    );
});
