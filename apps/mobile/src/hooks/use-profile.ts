import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

    const toggleNA = async (field: string, value: boolean) => {
        try {
            await updateProfile.mutateAsync({ [field]: value });
        } catch (error) {
            // Error handled in mutation
        }
    };

    return {
        profile,
        isLoading,
        refetch,
        updateProfile: updateProfile.mutateAsync,
        toggleNA,
        isUpdating: updateProfile.isPending,
    };
}
