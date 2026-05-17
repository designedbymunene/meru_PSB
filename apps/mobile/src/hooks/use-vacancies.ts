import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface VacancyFilters {
    status?: 'open' | 'closed' | 'all';
    departmentId?: number | string | null;
    jobGroupId?: number | string | null;
    search?: string;
}

export function useVacancies(filters?: VacancyFilters) {
    return useQuery({
        queryKey: ['vacancies', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.status && filters.status !== 'all') {
                params.append('status', filters.status);
            }
            if (filters?.departmentId) {
                params.append('departmentId', filters.departmentId.toString());
            }
            if (filters?.jobGroupId) {
                params.append('jobGroupId', filters.jobGroupId.toString());
            }
            if (filters?.search) {
                params.append('search', filters.search);
            }

            const queryString = params.toString();
            const url = `/vacancies${queryString ? `?${queryString}` : ''}`;
            
            const response = await apiClient.get(url);
            return response.data.data;
        },
    });
}

export function useVacancy(id: string | number, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ['vacancies', id],
        queryFn: async () => {
            const response = await apiClient.get(`/vacancies/${id}`);
            return response.data.data;
        },
        enabled: (options?.enabled ?? true) && !!id,
    });
}
