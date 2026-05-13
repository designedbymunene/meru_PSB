'use client'

import { useQuery } from '@tanstack/react-query'
import * as dashboardApi from '@/lib/api/dashboard'
import { QUERY_KEYS } from '@/lib/constants'

export function useDashboard() {
    return useQuery({
        queryKey: ['dashboard'],
        queryFn: () => dashboardApi.getDashboardData(),
    })
}
