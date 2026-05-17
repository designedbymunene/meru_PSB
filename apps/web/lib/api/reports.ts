import apiClient from './client'
import type { 
    ApiResponse, 
    DiversityReport, 
    KPIReport, 
    ReportFilters, 
    FunnelDataPoint, 
    TimeSeriesDataPoint 
} from '@meru/shared'

export async function getDiversityReport(filters?: ReportFilters): Promise<ApiResponse<DiversityReport>> {
    const { data } = await apiClient.get<ApiResponse<DiversityReport>>('/reports/diversity', { params: filters })
    return data
}

export async function getKPIReport(filters?: ReportFilters): Promise<ApiResponse<KPIReport>> {
    const { data } = await apiClient.get<ApiResponse<KPIReport>>('/reports/kpis', { params: filters })
    return data
}

export async function getFunnelReport(filters?: ReportFilters): Promise<ApiResponse<FunnelDataPoint[]>> {
    const { data } = await apiClient.get<ApiResponse<FunnelDataPoint[]>>('/reports/funnel', { params: filters })
    return data
}

export async function getApplicationsTimeReport(filters?: ReportFilters): Promise<ApiResponse<TimeSeriesDataPoint[]>> {
    const { data } = await apiClient.get<ApiResponse<TimeSeriesDataPoint[]>>('/reports/applications-over-time', { params: filters })
    return data
}

export async function getVacancyPerformance(filters?: ReportFilters): Promise<ApiResponse<any[]>> {
    const { data } = await apiClient.get<ApiResponse<any[]>>('/reports/vacancy-performance', { params: filters })
    return data
}

export async function getConversionTrends(filters?: ReportFilters): Promise<ApiResponse<any[]>> {
    const { data } = await apiClient.get<ApiResponse<any[]>>('/reports/conversion-trends', { params: filters })
    return data
}
