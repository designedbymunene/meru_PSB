'use client'

import { useQuery } from '@tanstack/react-query'
import * as reportsApi from '@/lib/api/reports'
import type { 
    ApiResponse, 
    DiversityReport, 
    KPIReport, 
    ReportFilters, 
    FunnelDataPoint, 
    TimeSeriesDataPoint 
} from '@meru/shared'

export function useDiversityReport(filters?: ReportFilters) {
    return useQuery<ApiResponse<DiversityReport>>({
        queryKey: ['reports', 'diversity', filters],
        queryFn: () => reportsApi.getDiversityReport(filters),
    })
}

export function useKPIReport(filters?: ReportFilters) {
    return useQuery<ApiResponse<KPIReport>>({
        queryKey: ['reports', 'kpis', filters],
        queryFn: () => reportsApi.getKPIReport(filters),
    })
}

export function useFunnelReport(filters?: ReportFilters) {
    return useQuery<ApiResponse<FunnelDataPoint[]>>({
        queryKey: ['reports', 'funnel', filters],
        queryFn: () => reportsApi.getFunnelReport(filters),
    })
}

export function useApplicationsTimeReport(filters?: ReportFilters) {
    return useQuery<ApiResponse<TimeSeriesDataPoint[]>>({
        queryKey: ['reports', 'time-series', filters],
        queryFn: () => reportsApi.getApplicationsTimeReport(filters),
    })
}

export function useVacancyPerformance(filters?: ReportFilters) {
    return useQuery<ApiResponse<any[]>>({
        queryKey: ['reports', 'vacancy-performance', filters],
        queryFn: () => reportsApi.getVacancyPerformance(filters),
    })
}

export function useConversionTrends(filters?: ReportFilters) {
    return useQuery<ApiResponse<any[]>>({
        queryKey: ['reports', 'conversion-trends', filters],
        queryFn: () => reportsApi.getConversionTrends(filters),
    })
}
