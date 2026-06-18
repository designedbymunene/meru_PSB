import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { extractQueryPaginatedData, normalizeArraySelect } from '@meru/shared';

export function useApplications() {
    return useQuery({
        queryKey: ['applications', 'me'],
        queryFn: async () => {
            const response = await apiClient.get('/applications/me');
            return extractQueryPaginatedData(response);
        },
        select: (data) => {
            return data.data || [];
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
