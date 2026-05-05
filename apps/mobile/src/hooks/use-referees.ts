import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
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
                Alert.alert('Queued', 'Saved offline and will sync later.');
            } else {
                Alert.alert('Success', 'Referee added successfully');
            }
        },
        onError: (error) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to add referee'));
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
                Alert.alert('Queued', 'Updates saved offline.');
            } else {
                Alert.alert('Success', 'Referee updated successfully');
            }
        },
        onError: (error) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to update referee'));
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
                Alert.alert('Success', 'Referee deleted successfully');
            }
        },
        onError: (error) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to delete referee'));
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
