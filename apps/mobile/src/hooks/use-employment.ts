import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { apiClient, getApiErrorMessage } from '@/lib/api/client';
import { runOfflineCapableMutation } from '@/lib/offline-mutations/mutation-strategy';

export function useEmployment() {
    const queryClient = useQueryClient();

    const { data: employmentHistory, isLoading, refetch } = useQuery({
        queryKey: ['employment-history'],
        queryFn: async () => {
            const response = await apiClient.get('/applicant-profiles/me/employment-history');
            return response.data.data || [];
        },
    });

    const addEmployment = useMutation({
        mutationFn: async (data: any) => {
            return runOfflineCapableMutation({
                request: () => apiClient.post('/applicant-profiles/me/employment-history', data),
                method: 'post',
                path: '/applicant-profiles/me/employment-history',
                body: data,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['employment-history'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (result.queued) {
                Alert.alert('Queued', 'Saved offline and will sync later.');
            } else {
                Alert.alert('Success', 'Employment record added successfully');
            }
        },
        onError: (error) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to add employment record'));
        }
    });

    const updateEmployment = useMutation({
        mutationFn: async ({ id, data }: { id: string | number, data: any }) => {
            return runOfflineCapableMutation({
                request: () => apiClient.put(`/applicant-profiles/me/employment-history/${id}`, data),
                method: 'put',
                path: `/applicant-profiles/me/employment-history/${id}`,
                body: data,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['employment-history'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (result.queued) {
                Alert.alert('Queued', 'Updates saved offline.');
            } else {
                Alert.alert('Success', 'Employment record updated successfully');
            }
        },
        onError: (error) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to update employment record'));
        }
    });

    const deleteEmployment = useMutation({
        mutationFn: async (id: string | number) => {
            return runOfflineCapableMutation({
                request: () => apiClient.delete(`/applicant-profiles/me/employment-history/${id}`),
                method: 'delete',
                path: `/applicant-profiles/me/employment-history/${id}`,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['employment-history'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (!result.queued) {
                Alert.alert('Success', 'Employment record deleted successfully');
            }
        },
        onError: (error) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to delete employment record'));
        }
    });

    return {
        employmentHistory,
        isLoading,
        refetch,
        addEmployment: addEmployment.mutateAsync,
        updateEmployment: (id: string | number, data: any) => updateEmployment.mutateAsync({ id, data }),
        deleteEmployment: deleteEmployment.mutateAsync,
        isAdding: addEmployment.isPending,
        isUpdating: updateEmployment.isPending,
        isDeleting: deleteEmployment.isPending,
    };
}
