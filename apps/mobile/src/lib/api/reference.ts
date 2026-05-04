import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

// --- Locations ---

export function useCounties() {
    return useQuery({
        queryKey: ['counties'],
        queryFn: async () => {
            const response = await apiClient.get('/reference/locations/counties');
            return response.data;
        }
    });
}

export function useConstituencies(countyId?: number) {
    return useQuery({
        queryKey: ['constituencies', countyId],
        queryFn: async () => {
            const response = await apiClient.get(`/reference/locations/constituencies?countyId=${countyId}`);
            return response.data;
        },
        enabled: !!countyId
    });
}

export function useWards(constituencyId?: number) {
    return useQuery({
        queryKey: ['wards', constituencyId],
        queryFn: async () => {
            const response = await apiClient.get(`/reference/locations/wards?constituencyId=${constituencyId}`);
            return response.data;
        },
        enabled: !!constituencyId
    });
}

// --- Education ---

export function useEducationLevels() {
    return useQuery({
        queryKey: ['education-levels'],
        queryFn: async () => {
            const response = await apiClient.get('/reference/education/levels');
            return response.data;
        }
    });
}

export function useEducationGrades(levelId?: number) {
    return useQuery({
        queryKey: ['education-grades', levelId],
        queryFn: async () => {
            const response = await apiClient.get(`/reference/education/grades?levelId=${levelId}`);
            return response.data;
        },
        enabled: !!levelId
    });
}

export function useInstitutions() {
    return useQuery({
        queryKey: ['institutions'],
        queryFn: async () => {
            const response = await apiClient.get('/reference/institutions');
            return response.data;
        }
    });
}

export function useCourses() {
    return useQuery({
        queryKey: ['courses'],
        queryFn: async () => {
            const response = await apiClient.get('/reference/courses');
            return response.data;
        }
    });
}

// --- Other ---

export function useEthnicities() {
    return useQuery({
        queryKey: ['ethnicities'],
        queryFn: async () => {
            const response = await apiClient.get('/reference/ethnicities');
            return response.data;
        }
    });
}

export function useProfessionalBodies() {
    return useQuery({
        queryKey: ['professional-bodies'],
        queryFn: async () => {
            const response = await apiClient.get('/reference/professional-bodies');
            return response.data;
        }
    });
}
