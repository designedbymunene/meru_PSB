import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { apiClient, getApiErrorMessage } from '@/lib/api/client';
import { runOfflineCapableMutation } from '@/lib/offline-mutations/mutation-strategy';

export function useTraining() {
    const queryClient = useQueryClient();

    const { data: trainingCourses, isLoading, refetch } = useQuery({
        queryKey: ['training-courses'],
        queryFn: async () => {
            const response = await apiClient.get('/applicant-profiles/me/training-courses');
            return response.data.data || [];
        },
    });

    const addTraining = useMutation({
        mutationFn: async (data: any) => {
            return runOfflineCapableMutation({
                request: () => apiClient.post('/applicant-profiles/me/training-courses', data),
                method: 'post',
                path: '/applicant-profiles/me/training-courses',
                body: data,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['training-courses'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (result.queued) {
                toast.info('Queued', { description: 'Saved offline and will sync later.' });
            } else {
                toast.success('Success', { description: 'Training course added successfully' });
            }
        },
        onError: (error) => {
            toast.error('Error', { description: getApiErrorMessage(error, 'Failed to add training course') });
        }
    });

    const updateTraining = useMutation({
        mutationFn: async ({ id, data }: { id: string | number, data: any }) => {
            return runOfflineCapableMutation({
                request: () => apiClient.put(`/applicant-profiles/me/training-courses/${id}`, data),
                method: 'put',
                path: `/applicant-profiles/me/training-courses/${id}`,
                body: data,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['training-courses'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (result.queued) {
                toast.info('Queued', { description: 'Updates saved offline.' });
            } else {
                toast.success('Success', { description: 'Training course updated successfully' });
            }
        },
        onError: (error) => {
            toast.error('Error', { description: getApiErrorMessage(error, 'Failed to update training course') });
        }
    });

    const deleteTraining = useMutation({
        mutationFn: async (id: string | number) => {
            return runOfflineCapableMutation({
                request: () => apiClient.delete(`/applicant-profiles/me/training-courses/${id}`),
                method: 'delete',
                path: `/applicant-profiles/me/training-courses/${id}`,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['training-courses'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (!result.queued) {
                toast.success('Success', { description: 'Training course deleted successfully' });
            }
        },
        onError: (error) => {
            toast.error('Error', { description: getApiErrorMessage(error, 'Failed to delete training course') });
        }
    });

    return {
        trainingCourses,
        isLoading,
        refetch,
        addTraining: addTraining.mutateAsync,
        updateTraining: (id: string | number, data: any) => updateTraining.mutateAsync({ id, data }),
        deleteTraining: deleteTraining.mutateAsync,
        isAdding: addTraining.isPending,
        isUpdating: updateTraining.isPending,
        isDeleting: deleteTraining.isPending,
    };
}
