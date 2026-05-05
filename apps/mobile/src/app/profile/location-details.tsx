import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Text, View, TouchableOpacity } from 'react-native';
import * as z from 'zod';
import { FormLayout } from '@/components/ui/form-layout';
import { FormPicker } from '@/components/ui/form-picker';
import { apiClient, getApiErrorMessage } from '@/lib/api/client';
import { 
    useCounties, 
    useConstituencies, 
    useWards, 
    useEthnicities 
} from '@/lib/api/reference';
import { runOfflineCapableMutation } from '@/lib/offline-mutations/mutation-strategy';
import { MapPin, Globe, Users } from 'lucide-react-native';
import { ProfileFormLoadingState } from '@/components/ui/loading-skeletons';

const locationDetailsSchema = z.object({
    ethnicityId: z.coerce.number().min(1, 'Ethnicity is required'),
    homeCountyId: z.coerce.number().min(1, 'Home County is required'),
    homeSubCountyId: z.coerce.number().min(1, 'Home Sub-County is required'),
    wardId: z.coerce.number().min(1, 'Ward is required'),
});

type LocationDetailsData = z.infer<typeof locationDetailsSchema>;

export default function LocationDetailsScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Reference Queries
    const { data: countiesResponse } = useCounties();
    const counties = (countiesResponse?.data || []).map((c: any) => ({ label: c.name, value: c.id }));

    const { data: ethnicitiesResponse } = useEthnicities();
    const ethnicities = (ethnicitiesResponse?.data || []).map((e: any) => ({ label: e.name, value: e.id }));

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await apiClient.get('/applicant-profiles/me');
            return response.data.data;
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            return runOfflineCapableMutation({
                request: () => apiClient.put('/applicant-profiles/me', data),
                method: 'put',
                path: '/applicant-profiles/me',
                data,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            Alert.alert('Success', 'Location details updated successfully');
            router.back();
        },
        onError: (error: unknown) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to update location details'));
        }
    });

    const { control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<LocationDetailsData>({
        resolver: zodResolver(locationDetailsSchema),
        defaultValues: {
            ethnicityId: undefined,
            homeCountyId: undefined,
            homeSubCountyId: undefined,
            wardId: undefined,
        },
    });

    const selectedCountyId = watch('homeCountyId');
    const selectedSubCountyId = watch('homeSubCountyId');

    const { data: subCountiesResponse } = useConstituencies(selectedCountyId);
    const subCounties = (subCountiesResponse?.data || []).map((sc: any) => ({ label: sc.name, value: sc.id }));

    const { data: wardsResponse } = useWards(selectedSubCountyId);
    const wards = (wardsResponse?.data || []).map((w: any) => ({ label: w.name, value: w.id }));

    useEffect(() => {
        if (profile) {
            reset({
                ethnicityId: profile.ethnicityId || undefined,
                homeCountyId: profile.homeCountyId || undefined,
                homeSubCountyId: profile.homeSubCountyId || undefined,
                wardId: profile.wardId || undefined,
            });
        }
    }, [profile, reset]);

    if (isLoading) {
        return <ProfileFormLoadingState title="Location & Ethnicity" />;
    }

    return (
        <FormLayout
            title="Location & Ethnicity"
            onBack={() => router.back()}
            isLoading={mutation.isPending}
            submitLabel="Save Details"
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
        >
            <View className="px-4 space-y-2">
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
        </FormLayout>
    );
}
