import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

export function useJobGroups() {
    return useQuery({
        queryKey: ['job-groups'],
        queryFn: async () => {
            const response = await apiClient.get('/job-groups');
            return response.data.data;
        }
    });
}
