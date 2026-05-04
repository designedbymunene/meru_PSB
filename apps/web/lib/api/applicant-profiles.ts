import apiClient from './client'
import type {
    ApiResponse,
    ApplicantProfile,
    ApplicantProfileWithRelations,
    CreateProfileInput,
    Qualification,
    CreateQualificationInput,
    ProfessionalDetail,
    CreateProfessionalDetailInput,
    TrainingCourse,
    CreateTrainingCourseInput,
    ProfessionalMembership,
    CreateProfessionalMembershipInput,
    EmploymentHistory,
    CreateEmploymentHistoryInput,
} from '@/types'

// ===== Profile Endpoints =====

export async function getMyProfile(): Promise<ApiResponse<ApplicantProfileWithRelations>> {
    const { data } = await apiClient.get<ApiResponse<ApplicantProfileWithRelations>>(
        '/applicant-profiles/me'
    )
    return data
}

export async function getProfileById(
    id: number
): Promise<ApiResponse<ApplicantProfileWithRelations>> {
    const { data } = await apiClient.get<ApiResponse<ApplicantProfileWithRelations>>(
        `/applicant-profiles/${id}`
    )
    return data
}

export async function getProfileByUserId(
    userId: number
): Promise<ApiResponse<ApplicantProfileWithRelations>> {
    const { data } = await apiClient.get<ApiResponse<ApplicantProfileWithRelations>>(
        `/applicant-profiles/user/${userId}`
    )
    return data
}

export async function createOrUpdateProfile(
    profileData: CreateProfileInput
): Promise<ApiResponse<ApplicantProfile>> {
    const { data } = await apiClient.post<ApiResponse<ApplicantProfile>>(
        '/applicant-profiles',
        profileData
    )
    return data
}

// ===== Qualifications Endpoints =====

export async function getQualifications(
    profileId: number
): Promise<ApiResponse<Qualification[]>> {
    const { data } = await apiClient.get<ApiResponse<Qualification[]>>(
        `/applicant-profiles/${profileId}/qualifications`
    )
    return data
}

export async function addQualification(
    profileId: number,
    qualData: CreateQualificationInput
): Promise<ApiResponse<Qualification>> {
    const { data } = await apiClient.post<ApiResponse<Qualification>>(
        `/applicant-profiles/${profileId}/qualifications`,
        qualData
    )
    return data
}

export async function updateQualification(
    profileId: number,
    qualId: number,
    qualData: Partial<CreateQualificationInput>
): Promise<ApiResponse<Qualification>> {
    const { data } = await apiClient.put<ApiResponse<Qualification>>(
        `/applicant-profiles/${profileId}/qualifications/${qualId}`,
        qualData
    )
    return data
}

export async function deleteQualification(
    profileId: number,
    qualId: number
): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
        `/applicant-profiles/${profileId}/qualifications/${qualId}`
    )
    return data
}

// ===== Professional Details Endpoints =====

export async function getProfessionalDetails(
    profileId: number
): Promise<ApiResponse<ProfessionalDetail[]>> {
    const { data } = await apiClient.get<ApiResponse<ProfessionalDetail[]>>(
        `/applicant-profiles/${profileId}/professional-details`
    )
    return data
}

export async function addProfessionalDetail(
    profileId: number,
    detailData: CreateProfessionalDetailInput
): Promise<ApiResponse<ProfessionalDetail>> {
    const { data } = await apiClient.post<ApiResponse<ProfessionalDetail>>(
        `/applicant-profiles/${profileId}/professional-details`,
        detailData
    )
    return data
}

export async function updateProfessionalDetail(
    profileId: number,
    detailId: number,
    detailData: Partial<CreateProfessionalDetailInput>
): Promise<ApiResponse<ProfessionalDetail>> {
    const { data } = await apiClient.put<ApiResponse<ProfessionalDetail>>(
        `/applicant-profiles/${profileId}/professional-details/${detailId}`,
        detailData
    )
    return data
}

export async function deleteProfessionalDetail(
    profileId: number,
    detailId: number
): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
        `/applicant-profiles/${profileId}/professional-details/${detailId}`
    )
    return data
}

// ===== Training Courses Endpoints =====

export async function getTrainingCourses(
    profileId: number
): Promise<ApiResponse<TrainingCourse[]>> {
    const { data } = await apiClient.get<ApiResponse<TrainingCourse[]>>(
        `/applicant-profiles/${profileId}/training-courses`
    )
    return data
}

export async function addTrainingCourse(
    profileId: number,
    courseData: CreateTrainingCourseInput
): Promise<ApiResponse<TrainingCourse>> {
    const { data } = await apiClient.post<ApiResponse<TrainingCourse>>(
        `/applicant-profiles/${profileId}/training-courses`,
        courseData
    )
    return data
}

export async function updateTrainingCourse(
    profileId: number,
    courseId: number,
    courseData: Partial<CreateTrainingCourseInput>
): Promise<ApiResponse<TrainingCourse>> {
    const { data } = await apiClient.put<ApiResponse<TrainingCourse>>(
        `/applicant-profiles/${profileId}/training-courses/${courseId}`,
        courseData
    )
    return data
}

export async function deleteTrainingCourse(
    profileId: number,
    courseId: number
): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
        `/applicant-profiles/${profileId}/training-courses/${courseId}`
    )
    return data
}

// ===== Professional Memberships Endpoints =====

export async function getProfessionalMemberships(
    profileId: number
): Promise<ApiResponse<ProfessionalMembership[]>> {
    const { data } = await apiClient.get<ApiResponse<ProfessionalMembership[]>>(
        `/applicant-profiles/${profileId}/professional-memberships`
    )
    return data
}

export async function addProfessionalMembership(
    profileId: number,
    membershipData: CreateProfessionalMembershipInput
): Promise<ApiResponse<ProfessionalMembership>> {
    const { data } = await apiClient.post<ApiResponse<ProfessionalMembership>>(
        `/applicant-profiles/${profileId}/professional-memberships`,
        membershipData
    )
    return data
}

export async function updateProfessionalMembership(
    profileId: number,
    membershipId: number,
    membershipData: Partial<CreateProfessionalMembershipInput>
): Promise<ApiResponse<ProfessionalMembership>> {
    const { data } = await apiClient.put<ApiResponse<ProfessionalMembership>>(
        `/applicant-profiles/${profileId}/professional-memberships/${membershipId}`,
        membershipData
    )
    return data
}

export async function deleteProfessionalMembership(
    profileId: number,
    membershipId: number
): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
        `/applicant-profiles/${profileId}/professional-memberships/${membershipId}`
    )
    return data
}

// ===== Employment History Endpoints =====

export async function getEmploymentHistory(
    profileId: number
): Promise<ApiResponse<EmploymentHistory[]>> {
    const { data } = await apiClient.get<ApiResponse<EmploymentHistory[]>>(
        `/applicant-profiles/${profileId}/employment-history`
    )
    return data
}

export async function addEmploymentHistory(
    profileId: number,
    employmentData: CreateEmploymentHistoryInput
): Promise<ApiResponse<EmploymentHistory>> {
    const { data } = await apiClient.post<ApiResponse<EmploymentHistory>>(
        `/applicant-profiles/${profileId}/employment-history`,
        employmentData
    )
    return data
}

export async function updateEmploymentHistory(
    profileId: number,
    employmentId: number,
    employmentData: Partial<CreateEmploymentHistoryInput>
): Promise<ApiResponse<EmploymentHistory>> {
    const { data } = await apiClient.put<ApiResponse<EmploymentHistory>>(
        `/applicant-profiles/${profileId}/employment-history/${employmentId}`,
        employmentData
    )
    return data
}

export async function deleteEmploymentHistory(
    profileId: number,
    employmentId: number
): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
        `/applicant-profiles/${profileId}/employment-history/${employmentId}`
    )
    return data
}

// ===== Admin Endpoints =====

export async function getAllProfiles(): Promise<
    ApiResponse<ApplicantProfileWithRelations[]>
> {
    const { data } = await apiClient.get<ApiResponse<ApplicantProfileWithRelations[]>>(
        '/applicant-profiles/admin/all'
    )
    return data
}

export async function exportProfiles(): Promise<Blob> {
    const { data } = await apiClient.get('/applicant-profiles/admin/export', {
        responseType: 'blob',
    })
    return data
}
