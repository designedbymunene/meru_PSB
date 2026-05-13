import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
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
                toast.info('Queued', { description: 'Saved offline and will sync later.' });
            } else {
                toast.success('Success', { description: 'Employment record added successfully' });
            }
        },
        onError: (error) => {
            toast.error('Error', { description: getApiErrorMessage(error, 'Failed to add employment record') });
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
                toast.info('Queued', { description: 'Updates saved offline.' });
            } else {
                toast.success('Success', { description: 'Employment record updated successfully' });
            }
        },
        onError: (error) => {
            toast.error('Error', { description: getApiErrorMessage(error, 'Failed to update employment record') });
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
                toast.success('Success', { description: 'Employment record deleted successfully' });
            }
        },
        onError: (error) => {
            toast.error('Error', { description: getApiErrorMessage(error, 'Failed to delete employment record') });
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
