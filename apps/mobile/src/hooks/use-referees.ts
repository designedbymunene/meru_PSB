import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { apiClient, getApiErrorMessage } from '@/lib/api/client';
import { runOfflineCapableMutation } from '@/lib/offline-mutations/mutation-strategy';

export function useReferees() {
    const queryClient = useQueryClient();

    const { data: referees, isLoading, refetch } = useQuery({
        queryKey: ['referees'],
        queryFn: async () => {
            const response = await apiClient.get('/applicant-profiles/me/referees');
            return response.data.data || [];
        },
    });

    const addReferee = useMutation({
        mutationFn: async (data: any) => {
            return runOfflineCapableMutation({
                request: () => apiClient.post('/applicant-profiles/me/referees', data),
                method: 'post',
                path: '/applicant-profiles/me/referees',
                body: data,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['referees'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (result.queued) {
                toast.info('Queued', { description: 'Saved offline and will sync later.' });
            } else {
                toast.success('Success', { description: 'Referee added successfully' });
            }
        },
        onError: (error) => {
            toast.error('Error', { description: getApiErrorMessage(error, 'Failed to add referee') });
        }
    });

    const updateReferee = useMutation({
        mutationFn: async ({ id, data }: { id: string | number, data: any }) => {
            return runOfflineCapableMutation({
                request: () => apiClient.put(`/applicant-profiles/me/referees/${id}`, data),
                method: 'put',
                path: `/applicant-profiles/me/referees/${id}`,
                body: data,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['referees'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (result.queued) {
                toast.info('Queued', { description: 'Updates saved offline.' });
            } else {
                toast.success('Success', { description: 'Referee updated successfully' });
            }
        },
        onError: (error) => {
            toast.error('Error', { description: getApiErrorMessage(error, 'Failed to update referee') });
        }
    });

    const deleteReferee = useMutation({
        mutationFn: async (id: string | number) => {
            return runOfflineCapableMutation({
                request: () => apiClient.delete(`/applicant-profiles/me/referees/${id}`),
                method: 'delete',
                path: `/applicant-profiles/me/referees/${id}`,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['referees'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (!result.queued) {
                toast.success('Success', { description: 'Referee deleted successfully' });
            }
        },
        onError: (error) => {
            toast.error('Error', { description: getApiErrorMessage(error, 'Failed to delete referee') });
        }
    });

    return {
        referees,
        isLoading,
        refetch,
        addReferee: addReferee.mutateAsync,
        updateReferee: (id: string | number, data: any) => updateReferee.mutateAsync({ id, data }),
        deleteReferee: deleteReferee.mutateAsync,
        isAdding: addReferee.isPending,
        isUpdating: updateReferee.isPending,
        isDeleting: deleteReferee.isPending,
    };
}
