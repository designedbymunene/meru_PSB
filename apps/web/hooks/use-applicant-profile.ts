'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as applicantProfileApi from '@/lib/api/applicant-profiles'
import { QUERY_KEYS } from '@/lib/constants'
import type {
    CreateProfileInput,
    CreateQualificationInput,
    CreateProfessionalDetailInput,
    CreateTrainingCourseInput,
    CreateProfessionalMembershipInput,
    CreateEmploymentHistoryInput,
} from '@/types'
import { toast } from 'sonner'

// ===== Profile Hooks =====

export function useMyProfile() {
    return useQuery({
        queryKey: QUERY_KEYS.MY_PROFILE,
        queryFn: () => applicantProfileApi.getMyProfile(),
    })
}

export function useProfileById(id: number) {
    return useQuery({
        queryKey: QUERY_KEYS.APPLICANT_PROFILE(id),
        queryFn: () => applicantProfileApi.getProfileById(id),
        enabled: !!id,
    })
}

export function useProfileByUserId(userId: number) {
    return useQuery({
        queryKey: ['applicant-profile-by-user', userId],
        queryFn: () => applicantProfileApi.getProfileByUserId(userId),
        enabled: !!userId,
        retry: false
    })
}

export function useCreateOrUpdateProfile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateProfileInput) =>
            applicantProfileApi.createOrUpdateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_PROFILE })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPLICANT_PROFILES })
            toast.success('Profile saved successfully')
        },
        onError: (error: any) => {
            toast.error('Failed to save profile', {
                description: error?.message || 'An error occurred',
            })
        },
    })
}

// ===== Qualifications Hooks =====

export function useQualifications(profileId: number) {
    return useQuery({
        queryKey: QUERY_KEYS.QUALIFICATIONS(profileId),
        queryFn: () => applicantProfileApi.getQualifications(profileId),
        enabled: !!profileId,
    })
}

export function useAddQualification(profileId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateQualificationInput) =>
            applicantProfileApi.addQualification(profileId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUALIFICATIONS(profileId) })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_PROFILE })
            toast.success('Qualification added')
        },
        onError: (error: any) => {
            toast.error('Failed to add qualification', {
                description: error?.message,
            })
        },
    })
}

export function useUpdateQualification(profileId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            qualId,
            data,
        }: {
            qualId: number
            data: Partial<CreateQualificationInput>
        }) => applicantProfileApi.updateQualification(profileId, qualId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUALIFICATIONS(profileId) })
            toast.success('Qualification updated')
        },
        onError: (error: any) => {
            toast.error('Failed to update qualification', {
                description: error?.message,
            })
        },
    })
}

export function useDeleteQualification(profileId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (qualId: number) =>
            applicantProfileApi.deleteQualification(profileId, qualId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUALIFICATIONS(profileId) })
            toast.success('Qualification deleted')
        },
        onError: (error: any) => {
            toast.error('Failed to delete qualification', {
                description: error?.message,
            })
        },
    })
}

// ===== Professional Details Hooks =====

export function useProfessionalDetails(profileId: number) {
    return useQuery({
        queryKey: QUERY_KEYS.PROFESSIONAL_DETAILS(profileId),
        queryFn: () => applicantProfileApi.getProfessionalDetails(profileId),
        enabled: !!profileId,
    })
}

export function useAddProfessionalDetail(profileId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateProfessionalDetailInput) =>
            applicantProfileApi.addProfessionalDetail(profileId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.PROFESSIONAL_DETAILS(profileId),
            })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_PROFILE })
            toast.success('Professional detail added')
        },
        onError: (error: any) => {
            toast.error('Failed to add professional detail', {
                description: error?.message,
            })
        },
    })
}

export function useUpdateProfessionalDetail(profileId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            detailId,
            data,
        }: {
            detailId: number
            data: Partial<CreateProfessionalDetailInput>
        }) => applicantProfileApi.updateProfessionalDetail(profileId, detailId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.PROFESSIONAL_DETAILS(profileId),
            })
            toast.success('Professional detail updated')
        },
        onError: (error: any) => {
            toast.error('Failed to update professional detail', {
                description: error?.message,
            })
        },
    })
}

export function useDeleteProfessionalDetail(profileId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (detailId: number) =>
            applicantProfileApi.deleteProfessionalDetail(profileId, detailId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.PROFESSIONAL_DETAILS(profileId),
            })
            toast.success('Professional detail deleted')
        },
        onError: (error: any) => {
            toast.error('Failed to delete professional detail', {
                description: error?.message,
            })
        },
    })
}

// ===== Training Courses Hooks =====

export function useTrainingCourses(profileId: number) {
    return useQuery({
        queryKey: QUERY_KEYS.TRAINING_COURSES(profileId),
        queryFn: () => applicantProfileApi.getTrainingCourses(profileId),
        enabled: !!profileId,
    })
}

export function useAddTrainingCourse(profileId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateTrainingCourseInput) =>
            applicantProfileApi.addTrainingCourse(profileId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.TRAINING_COURSES(profileId),
            })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_PROFILE })
            toast.success('Training course added')
        },
        onError: (error: any) => {
            toast.error('Failed to add training course', {
                description: error?.message,
            })
        },
    })
}

export function useUpdateTrainingCourse(profileId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            courseId,
            data,
        }: {
            courseId: number
            data: Partial<CreateTrainingCourseInput>
        }) => applicantProfileApi.updateTrainingCourse(profileId, courseId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.TRAINING_COURSES(profileId),
            })
            toast.success('Training course updated')
        },
        onError: (error: any) => {
            toast.error('Failed to update training course', {
                description: error?.message,
            })
        },
    })
}

export function useDeleteTrainingCourse(profileId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (courseId: number) =>
            applicantProfileApi.deleteTrainingCourse(profileId, courseId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.TRAINING_COURSES(profileId),
            })
            toast.success('Training course deleted')
        },
        onError: (error: any) => {
            toast.error('Failed to delete training course', {
                description: error?.message,
            })
        },
    })
}

// ===== Professional Memberships Hooks =====

export function useProfessionalMemberships(profileId: number) {
    return useQuery({
        queryKey: QUERY_KEYS.PROFESSIONAL_MEMBERSHIPS(profileId),
        queryFn: () => applicantProfileApi.getProfessionalMemberships(profileId),
        enabled: !!profileId,
    })
}

export function useAddProfessionalMembership(profileId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateProfessionalMembershipInput) =>
            applicantProfileApi.addProfessionalMembership(profileId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.PROFESSIONAL_MEMBERSHIPS(profileId),
            })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_PROFILE })
            toast.success('Professional membership added')
        },
        onError: (error: any) => {
            toast.error('Failed to add professional membership', {
                description: error?.message,
            })
        },
    })
}

export function useUpdateProfessionalMembership(profileId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            membershipId,
            data,
        }: {
            membershipId: number
            data: Partial<CreateProfessionalMembershipInput>
        }) =>
            applicantProfileApi.updateProfessionalMembership(profileId, membershipId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.PROFESSIONAL_MEMBERSHIPS(profileId),
            })
            toast.success('Professional membership updated')
        },
        onError: (error: any) => {
            toast.error('Failed to update professional membership', {
                description: error?.message,
            })
        },
    })
}

export function useDeleteProfessionalMembership(profileId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (membershipId: number) =>
            applicantProfileApi.deleteProfessionalMembership(profileId, membershipId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.PROFESSIONAL_MEMBERSHIPS(profileId),
            })
            toast.success('Professional membership deleted')
        },
        onError: (error: any) => {
            toast.error('Failed to delete professional membership', {
                description: error?.message,
            })
        },
    })
}

// ===== Employment History Hooks =====

export function useEmploymentHistory(profileId: number) {
    return useQuery({
        queryKey: QUERY_KEYS.EMPLOYMENT_HISTORY(profileId),
        queryFn: () => applicantProfileApi.getEmploymentHistory(profileId),
        enabled: !!profileId,
    })
}

export function useAddEmploymentHistory(profileId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateEmploymentHistoryInput) =>
            applicantProfileApi.addEmploymentHistory(profileId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.EMPLOYMENT_HISTORY(profileId),
            })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_PROFILE })
            toast.success('Employment history added')
        },
        onError: (error: any) => {
            toast.error('Failed to add employment history', {
                description: error?.message,
            })
        },
    })
}

export function useUpdateEmploymentHistory(profileId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            employmentId,
            data,
        }: {
            employmentId: number
            data: Partial<CreateEmploymentHistoryInput>
        }) => applicantProfileApi.updateEmploymentHistory(profileId, employmentId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.EMPLOYMENT_HISTORY(profileId),
            })
            toast.success('Employment history updated')
        },
        onError: (error: any) => {
            toast.error('Failed to update employment history', {
                description: error?.message,
            })
        },
    })
}

export function useDeleteEmploymentHistory(profileId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (employmentId: number) =>
            applicantProfileApi.deleteEmploymentHistory(profileId, employmentId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.EMPLOYMENT_HISTORY(profileId),
            })
            toast.success('Employment history deleted')
        },
        onError: (error: any) => {
            toast.error('Failed to delete employment history', {
                description: error?.message,
            })
        },
    })
}

// ===== Admin Hooks =====

export function useAllApplicantProfiles() {
    return useQuery({
        queryKey: QUERY_KEYS.APPLICANT_PROFILES,
        queryFn: () => applicantProfileApi.getAllProfiles(),
    })
}

export function useExportProfiles() {
    return useMutation({
        mutationFn: () => applicantProfileApi.exportProfiles(),
        onSuccess: (data) => {
            // Create a download link
            const url = window.URL.createObjectURL(data)
            const link = document.createElement('a')
            link.href = url
            link.download = `applicant-profiles-${new Date().toISOString()}.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            toast.success('Profiles exported successfully')
        },
        onError: (error: any) => {
            toast.error('Failed to export profiles', {
                description: error?.message,
            })
        },
    })
}
