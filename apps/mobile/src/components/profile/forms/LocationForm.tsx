import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormPicker } from '@/components/ui/form-picker';
import { useCounties, useConstituencies, useWards, useEthnicities } from '@/lib/api/reference';
import { Globe, MapPin, Users } from 'lucide-react-native';

const locationSchema = z.object({
    ethnicityId: z.coerce.number().min(1, 'Ethnicity is required'),
    homeCountyId: z.coerce.number().min(1, 'Home County is required'),
    homeSubCountyId: z.coerce.number().min(1, 'Home Sub-County is required'),
    wardId: z.coerce.number().min(1, 'Ward is required'),
});

export type LocationData = z.infer<typeof locationSchema>;

interface LocationFormProps {
    initialData?: Partial<LocationData>;
    onSubmit: (data: LocationData) => void;
}

export interface FormHandle {
    submit: () => void;
}

export const LocationForm = forwardRef<FormHandle, LocationFormProps>(({ initialData, onSubmit }, ref) => {
    const [hasInitialReset, setHasInitialReset] = React.useState(false);

    const { control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<LocationData>({
        resolver: zodResolver(locationSchema),
        defaultValues: {
            ethnicityId: null as any,
            homeCountyId: null as any,
            homeSubCountyId: null as any,
            wardId: null as any,
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
                ethnicityId: initialData.ethnicityId || null,
                homeCountyId: initialData.homeCountyId || null,
                homeSubCountyId: initialData.homeSubCountyId || null,
                wardId: initialData.wardId || null,
            });
            setHasInitialReset(true);
        }
    }, [initialData, reset, hasInitialReset]);

    useImperativeHandle(ref, () => ({
        submit: () => {
            handleSubmit(onSubmit)();
        }
    }));

    return (
        <ScrollView className="space-y-4" showsVerticalScrollIndicator={false}>
            {/* Location Section */}
            <View className="space-y-2">
                <Text className="text-gray-900 dark:text-white font-black text-sm">Location & Origin</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-xs">These details are required for statutory reporting.</Text>

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
                            onValueChange={onChange}
                            value={value}
                            error={errors.wardId?.message}
                            placeholder="Select ward"
                            enabled={!!selectedSubCountyId && selectedSubCountyId > 0}
                            isLoading={isFetchingWards && !!selectedSubCountyId}
                        />
                    )}
                />
            </View>

            {/* Ethnicity Section */}
            <View className="space-y-2">
                <Text className="text-gray-900 dark:text-white font-black text-sm">Ethnicity</Text>

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
            </View>
        </ScrollView>
    );
});
