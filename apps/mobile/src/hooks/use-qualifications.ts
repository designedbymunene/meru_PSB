import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { apiClient, getApiErrorMessage } from '@/lib/api/client';
import { runOfflineCapableMutation } from '@/lib/offline-mutations/mutation-strategy';
import { 
    useEducationLevels, 
    useEducationGrades, 
    useInstitutions, 
    useCourses 
} from '@/lib/api/reference';

export function useQualifications() {
    const queryClient = useQueryClient();

    // Data Fetching
    const { data: qualifications, isLoading, refetch } = useQuery({
        queryKey: ['qualifications'],
        queryFn: async () => {
            const response = await apiClient.get('/applicant-profiles/me/qualifications');
            return response.data.data || [];
        },
    });

    // Mutations
    const addMutation = useMutation({
        mutationFn: async (data: any) => {
            const { stillStudying, ...submitData } = data;
            if (stillStudying) submitData.yearEnd = null;
            
            return runOfflineCapableMutation({
                request: () => apiClient.post('/applicant-profiles/me/qualifications', submitData),
                method: 'post',
                path: '/applicant-profiles/me/qualifications',
                body: submitData,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['qualifications'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (result.queued) {
                Alert.alert('Queued', 'Saved offline and will sync later.');
            } else {
                Alert.alert('Success', 'Qualification added successfully');
            }
        },
        onError: (error) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to add qualification'));
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string | number, data: any }) => {
            const { stillStudying, ...submitData } = data;
            if (stillStudying) submitData.yearEnd = null;

            return runOfflineCapableMutation({
                request: () => apiClient.put(`/applicant-profiles/me/qualifications/${id}`, submitData),
                method: 'put',
                path: `/applicant-profiles/me/qualifications/${id}`,
                body: submitData,
            });
        },
        onSuccess: (result, variables) => {
            queryClient.invalidateQueries({ queryKey: ['qualifications'] });
            queryClient.invalidateQueries({ queryKey: ['qualification', variables.id.toString()] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (result.queued) {
                Alert.alert('Queued', 'Updates saved offline.');
            } else {
                Alert.alert('Success', 'Qualification updated successfully');
            }
        },
        onError: (error) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to update qualification'));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string | number) => {
            return runOfflineCapableMutation({
                request: () => apiClient.delete(`/applicant-profiles/me/qualifications/${id}`),
                method: 'delete',
                path: `/applicant-profiles/me/qualifications/${id}`,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['qualifications'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (!result.queued) {
                Alert.alert('Success', 'Qualification deleted successfully');
            }
        },
        onError: (error) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to delete qualification'));
        }
    });

    return {
        qualifications,
        isLoading,
        refetch,
        addQualification: addMutation.mutateAsync,
        updateQualification: (id: string | number, data: any) => updateMutation.mutateAsync({ id, data }),
        deleteQualification: deleteMutation.mutateAsync,
        isAdding: addMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
