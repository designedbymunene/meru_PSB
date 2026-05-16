import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

export function useDepartments() {
    return useQuery({
        queryKey: ['departments'],
        queryFn: async () => {
            const response = await apiClient.get('/departments');
            return response.data.data;
        }
    });
}
