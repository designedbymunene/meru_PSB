import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export function useVacancies() {
    return useQuery({
        queryKey: ['vacancies'],
        queryFn: async () => {
            const response = await apiClient.get('/vacancies');
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
