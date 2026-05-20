import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export function useApplications() {
    return useQuery({
        queryKey: ['applications', 'me'],
        queryFn: async () => {
            const response = await apiClient.get('/applications/me');
            const resData = response.data.data;
            if (resData && !Array.isArray(resData) && Array.isArray(resData.data)) {
                return resData.data;
            }
            return resData;
        },
        select: (data: any) => {
            if (data && !Array.isArray(data) && Array.isArray(data.data)) {
                return data.data;
            }
            return Array.isArray(data) ? data : [];
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
