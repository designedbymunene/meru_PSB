import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { apiClient, getApiErrorMessage } from '@/lib/api/client';
import { runOfflineCapableMutation } from '@/lib/offline-mutations/mutation-strategy';

export function useProfessionalDetails() {
    const queryClient = useQueryClient();

    const { data: professionalDetails, isLoading, refetch } = useQuery({
        queryKey: ['professional-details'],
        queryFn: async () => {
            const response = await apiClient.get('/applicant-profiles/me/professional-details');
            return response.data.data || [];
        },
    });

    const addProfessionalDetail = useMutation({
        mutationFn: async (data: any) => {
            return runOfflineCapableMutation({
                request: () => apiClient.post('/applicant-profiles/me/professional-details', data),
                method: 'post',
                path: '/applicant-profiles/me/professional-details',
                body: data,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['professional-details'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (result.queued) {
                toast.info('Queued', { description: 'Saved offline and will sync later.' });
            } else {
                toast.success('Success', { description: 'Professional detail added successfully' });
            }
        },
        onError: (error) => {
            toast.error('Error', { description: getApiErrorMessage(error, 'Failed to add professional detail') });
        }
    });

    const updateProfessionalDetail = useMutation({
        mutationFn: async ({ id, data }: { id: string | number, data: any }) => {
            return runOfflineCapableMutation({
                request: () => apiClient.put(`/applicant-profiles/me/professional-details/${id}`, data),
                method: 'put',
                path: `/applicant-profiles/me/professional-details/${id}`,
                body: data,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['professional-details'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (result.queued) {
                toast.info('Queued', { description: 'Updates saved offline.' });
            } else {
                toast.success('Success', { description: 'Professional detail updated successfully' });
            }
        },
        onError: (error) => {
            toast.error('Error', { description: getApiErrorMessage(error, 'Failed to update professional detail') });
        }
    });

    const deleteProfessionalDetail = useMutation({
        mutationFn: async (id: string | number) => {
            return runOfflineCapableMutation({
                request: () => apiClient.delete(`/applicant-profiles/me/professional-details/${id}`),
                method: 'delete',
                path: `/applicant-profiles/me/professional-details/${id}`,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['professional-details'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (!result.queued) {
                toast.success('Success', { description: 'Professional detail deleted successfully' });
            }
        },
        onError: (error) => {
            toast.error('Error', { description: getApiErrorMessage(error, 'Failed to delete professional detail') });
        }
    });

    return {
        professionalDetails,
        isLoading,
        refetch,
        addProfessionalDetail: addProfessionalDetail.mutateAsync,
        updateProfessionalDetail: (id: string | number, data: any) => updateProfessionalDetail.mutateAsync({ id, data }),
        deleteProfessionalDetail: deleteProfessionalDetail.mutateAsync,
        isAdding: addProfessionalDetail.isPending,
        isUpdating: updateProfessionalDetail.isPending,
        isDeleting: deleteProfessionalDetail.isPending,
    };
}
