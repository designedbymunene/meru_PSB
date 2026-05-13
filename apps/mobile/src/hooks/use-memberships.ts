import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { apiClient, getApiErrorMessage } from '@/lib/api/client';
import { runOfflineCapableMutation } from '@/lib/offline-mutations/mutation-strategy';

export function useMemberships() {
    const queryClient = useQueryClient();

    const { data: memberships, isLoading, refetch } = useQuery({
        queryKey: ['memberships'],
        queryFn: async () => {
            const response = await apiClient.get('/applicant-profiles/me/professional-memberships');
            return response.data.data || [];
        },
    });

    const addMembership = useMutation({
        mutationFn: async (data: any) => {
            return runOfflineCapableMutation({
                request: () => apiClient.post('/applicant-profiles/me/professional-memberships', data),
                method: 'post',
                path: '/applicant-profiles/me/professional-memberships',
                body: data,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['memberships'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (result.queued) {
                toast.info('Queued', { description: 'Saved offline and will sync later.' });
            } else {
                toast.success('Success', { description: 'Membership added successfully' });
            }
        },
        onError: (error) => {
            toast.error('Error', { description: getApiErrorMessage(error, 'Failed to add membership') });
        }
    });

    const updateMembership = useMutation({
        mutationFn: async ({ id, data }: { id: string | number, data: any }) => {
            return runOfflineCapableMutation({
                request: () => apiClient.put(`/applicant-profiles/me/professional-memberships/${id}`, data),
                method: 'put',
                path: `/applicant-profiles/me/professional-memberships/${id}`,
                body: data,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['memberships'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (result.queued) {
                toast.info('Queued', { description: 'Updates saved offline.' });
            } else {
                toast.success('Success', { description: 'Membership updated successfully' });
            }
        },
        onError: (error) => {
            toast.error('Error', { description: getApiErrorMessage(error, 'Failed to update membership') });
        }
    });

    const deleteMembership = useMutation({
        mutationFn: async (id: string | number) => {
            return runOfflineCapableMutation({
                request: () => apiClient.delete(`/applicant-profiles/me/professional-memberships/${id}`),
                method: 'delete',
                path: `/applicant-profiles/me/professional-memberships/${id}`,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['memberships'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (!result.queued) {
                toast.success('Success', { description: 'Membership deleted successfully' });
            }
        },
        onError: (error) => {
            toast.error('Error', { description: getApiErrorMessage(error, 'Failed to delete membership') });
        }
    });

    return {
        memberships,
        isLoading,
        refetch,
        addMembership: addMembership.mutateAsync,
        updateMembership: (id: string | number, data: any) => updateMembership.mutateAsync({ id, data }),
        deleteMembership: deleteMembership.mutateAsync,
        isAdding: addMembership.isPending,
        isUpdating: updateMembership.isPending,
        isDeleting: deleteMembership.isPending,
    };
}
