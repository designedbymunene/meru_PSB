'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as documentsApi from '@/lib/api/documents'
import { toast } from 'sonner'
import type { ApiResponse, ApplicantDocument } from '@/types'

export function useMyDocuments(initialData?: ApiResponse<ApplicantDocument[]>) {
    return useQuery({
        queryKey: ['my-documents'],
        queryFn: () => documentsApi.getMyDocuments(),
        initialData,
    })
}

export function useUploadDocument() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ file, documentType }: { file: File; documentType: string }) =>
            documentsApi.uploadDocument(file, documentType),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-documents'] })
            queryClient.invalidateQueries({ queryKey: ['my-profile'] }) // Invalidate profile to update completion
            toast.success('Document uploaded successfully')
        },
        onError: (error: any) => {
            toast.error('Failed to upload document', {
                description: error?.message || 'An error occurred',
            })
        },
    })
}

export function useDeleteDocument() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => documentsApi.deleteDocument(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-documents'] })
            queryClient.invalidateQueries({ queryKey: ['my-profile'] })
            toast.success('Document deleted successfully')
        },
        onError: (error: any) => {
            toast.error('Failed to delete document', {
                description: error?.message || 'An error occurred',
            })
        },
    })
}
