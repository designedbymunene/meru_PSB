import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner-native';
import { apiClient, getApiErrorMessage } from '@/lib/api/client';
import { runOfflineCapableMutation } from '@/lib/offline-mutations/mutation-strategy';

export function useProfile() {
    const queryClient = useQueryClient();

    const { data: profile, isLoading, refetch } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await apiClient.get('/applicant-profiles/me');
            return response.data.data;
        },
    });

    const updateProfile = useMutation({
        mutationFn: async (data: any) => {
            return runOfflineCapableMutation({
                request: () => apiClient.put('/applicant-profiles/me', data),
                method: 'put',
                path: '/applicant-profiles/me',
                body: data,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (result.queued) {
                // For offline updates, we might want to optimistically update the cache
                // but the invalidateQueries will handle it when back online
            }
        },
        onError: (error) => {
            toast.error('Error', { description: getApiErrorMessage(error, 'Failed to update profile') });
        }
    });

    const toggleNA = useCallback(async (field: string, value: boolean) => {
        try {
            console.log(`[useProfile] Toggling N/A: ${field} = ${value}`);
            console.trace('[useProfile] toggleNA stack trace');
            await updateProfile.mutateAsync({ [field]: value });
            console.log(`[useProfile] N/A toggle successful for field="${field}"`);
        } catch (error) {
            console.error(`[useProfile] toggleNA failed for field="${field}", value=${value}`, error);
            // Don't re-throw - let the UI handle it gracefully
        }
    }, [updateProfile]);

    return {
        profile,
        isLoading,
        refetch,
        updateProfile: updateProfile.mutateAsync,
        toggleNA,
        isUpdating: updateProfile.isPending,
    };
}
