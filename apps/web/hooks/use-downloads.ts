'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as downloadsApi from '@/lib/api/downloads'

// ============ CATEGORIES ============

export function useDownloadCategories(activeOnly = false) {
    return useQuery({
        queryKey: ['downloads', 'categories', { active: activeOnly }],
        queryFn: () => downloadsApi.getDownloadCategories(activeOnly)
    })
}

export function useDownloadCategory(id: number) {
    return useQuery({
        queryKey: ['downloads', 'categories', id],
        queryFn: () => downloadsApi.getDownloadCategory(id),
        enabled: !!id
    })
}

export function useCreateDownloadCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: Parameters<typeof downloadsApi.createDownloadCategory>[0]) =>
            downloadsApi.createDownloadCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['downloads'] })
        }
    })
}

export function useUpdateDownloadCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Parameters<typeof downloadsApi.updateDownloadCategory>[1] }) =>
            downloadsApi.updateDownloadCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['downloads'] })
        }
    })
}

export function useDeleteDownloadCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => downloadsApi.deleteDownloadCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['downloads'] })
        }
    })
}

// ============ FILES ============

export function useDownloadFiles(categoryId?: number, activeOnly = false) {
    return useQuery({
        queryKey: ['downloads', 'files', { categoryId, active: activeOnly }],
        queryFn: () => downloadsApi.getDownloadFiles(categoryId, activeOnly),
        enabled: !categoryId || !!categoryId
    })
}

export function useDownloadFile(id: number) {
    return useQuery({
        queryKey: ['downloads', 'files', id],
        queryFn: () => downloadsApi.getDownloadFile(id),
        enabled: !!id
    })
}

export function useCreateDownloadFile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ file, data }: { file: File; data: Parameters<typeof downloadsApi.createDownloadFile>[1] }) =>
            downloadsApi.createDownloadFile(file, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['downloads'] })
        }
    })
}

export function useUpdateDownloadFile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data, file }: { id: number; data: Parameters<typeof downloadsApi.updateDownloadFile>[1]; file?: File }) =>
            downloadsApi.updateDownloadFile(id, data, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['downloads'] })
        }
    })
}

export function useDeleteDownloadFile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => downloadsApi.deleteDownloadFile(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['downloads'] })
        }
    })
}

// ============ ALL DOWNLOADS ============

export function useDownloads(activeOnly = false) {
    return useQuery({
        queryKey: ['downloads', 'all', { active: activeOnly }],
        queryFn: () => downloadsApi.getDownloads(activeOnly)
    })
}
