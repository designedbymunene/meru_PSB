import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { apiClient, getApiErrorMessage } from '@/lib/api/client';
import { runOfflineCapableMutation } from '@/lib/offline-mutations/mutation-strategy';

export function useMemberships() {
    const queryClient = useQueryClient();

    const { data: memberships, isLoading, refetch } = useQuery({
        queryKey: ['memberships'],
        queryFn: async () => {
            const response = await apiClient.get('/applicant-profiles/me/memberships');
            return response.data.data || [];
        },
    });

    const addMembership = useMutation({
        mutationFn: async (data: any) => {
            return runOfflineCapableMutation({
                request: () => apiClient.post('/applicant-profiles/me/memberships', data),
                method: 'post',
                path: '/applicant-profiles/me/memberships',
                body: data,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['memberships'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (result.queued) {
                Alert.alert('Queued', 'Saved offline and will sync later.');
            } else {
                Alert.alert('Success', 'Membership added successfully');
            }
        },
        onError: (error) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to add membership'));
        }
    });

    const updateMembership = useMutation({
        mutationFn: async ({ id, data }: { id: string | number, data: any }) => {
            return runOfflineCapableMutation({
                request: () => apiClient.put(`/applicant-profiles/me/memberships/${id}`, data),
                method: 'put',
                path: `/applicant-profiles/me/memberships/${id}`,
                body: data,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['memberships'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (result.queued) {
                Alert.alert('Queued', 'Updates saved offline.');
            } else {
                Alert.alert('Success', 'Membership updated successfully');
            }
        },
        onError: (error) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to update membership'));
        }
    });

    const deleteMembership = useMutation({
        mutationFn: async (id: string | number) => {
            return runOfflineCapableMutation({
                request: () => apiClient.delete(`/applicant-profiles/me/memberships/${id}`),
                method: 'delete',
                path: `/applicant-profiles/me/memberships/${id}`,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['memberships'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (!result.queued) {
                Alert.alert('Success', 'Membership deleted successfully');
            }
        },
        onError: (error) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to delete membership'));
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
