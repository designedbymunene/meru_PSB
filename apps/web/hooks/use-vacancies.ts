'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as vacancyApi from '@/lib/api/vacancies'
import { QUERY_KEYS } from '@/lib/constants'
import type { VacancyFilters, CreateVacancyData, UpdateVacancyData } from '@/types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// --- Queries ---

export function useVacancies(filters?: VacancyFilters) {
    return useQuery({
        queryKey: [...QUERY_KEYS.VACANCIES, filters],
        queryFn: () => vacancyApi.getVacancies(filters),
    })
}

export function useVacancyStats() {
    return useQuery({
        queryKey: ['vacancy-stats'],
        queryFn: () => vacancyApi.getVacancyStats(),
    })
}

export function useVacancy(id: number) {
    return useQuery({
        queryKey: QUERY_KEYS.VACANCY(id),
        queryFn: () => vacancyApi.getVacancy(id),
        enabled: !!id,
    })
}

export function useVacancyPdfs(id: number) {
    return useQuery({
        queryKey: QUERY_KEYS.VACANCY_PDFS(id),
        queryFn: () => vacancyApi.getVacancyPdfs(id),
        enabled: !!id,
    })
}

export function useCreateVacancy() {
    const queryClient = useQueryClient()
    const router = useRouter()

    return useMutation({
        mutationFn: (data: CreateVacancyData) => vacancyApi.createVacancy(data),
        onSuccess: () => {
            toast.success('Vacancy created successfully')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VACANCIES })
            router.push('/admin/vacancies')
        },
        onError: (error: Error) => {
            toast.error('Failed to create vacancy', {
                description: error.message,
            })
        },
    })
}

export function useUpdateVacancy() {
    const queryClient = useQueryClient()
    const router = useRouter()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateVacancyData }) =>
            vacancyApi.updateVacancy(id, data),
        onSuccess: (data) => {
            toast.success('Vacancy updated successfully')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VACANCIES })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VACANCY(data.data.id) })
            router.push('/admin/vacancies')
        },
        onError: (error: Error) => {
            toast.error('Failed to update vacancy', {
                description: error.message,
            })
        },
    })
}

export function useDeleteVacancy() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => vacancyApi.deleteVacancy(id),
        onSuccess: () => {
            toast.success('Vacancy deleted successfully')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VACANCIES })
        },
        onError: (error: Error) => {
            toast.error('Failed to delete vacancy', {
                description: error.message,
            })
        },
    })
}

export function useUploadVacancyPdf() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, file }: { id: number; file: File }) =>
            vacancyApi.uploadVacancyPdf(id, file),
        onSuccess: (_, variables) => {
            toast.success('PDF uploaded successfully')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VACANCY_PDFS(variables.id) })
        },
        onError: (error: Error) => {
            toast.error('Failed to upload PDF', {
                description: error.message,
            })
        },
    })
}

export function useDeleteVacancyPdf() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, pdfId }: { id: number; pdfId: number }) =>
            vacancyApi.deleteVacancyPdf(id, pdfId),
        onSuccess: (_, variables) => {
            toast.success('PDF deleted successfully')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VACANCY_PDFS(variables.id) })
        },
        onError: (error: Error) => {
            toast.error('Failed to delete PDF', {
                description: error.message,
            })
        },
    })
}
