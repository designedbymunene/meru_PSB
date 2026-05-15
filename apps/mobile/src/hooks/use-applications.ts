import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export function useApplications() {
    return useQuery({
        queryKey: ['applications'],
        queryFn: async () => {
            const response = await apiClient.get('/applications');
            return response.data.data;
        },
    });
}

export function useApplication(id: string | number, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ['applications', id],
        queryFn: async () => {
            const response = await apiClient.get(`/applications/${id}`);
            return response.data.data;
        },
        enabled: (options?.enabled ?? true) && !!id,
    });
}
