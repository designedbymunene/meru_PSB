import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
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
                Alert.alert('Queued', 'Saved offline and will sync later.');
            } else {
                Alert.alert('Success', 'Training course added successfully');
            }
        },
        onError: (error) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to add training course'));
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
                Alert.alert('Queued', 'Updates saved offline.');
            } else {
                Alert.alert('Success', 'Training course updated successfully');
            }
        },
        onError: (error) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to update training course'));
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
                Alert.alert('Success', 'Training course deleted successfully');
            }
        },
        onError: (error) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to delete training course'));
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
