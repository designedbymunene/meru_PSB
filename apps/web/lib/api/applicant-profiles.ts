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
    ProfileFiltersInput,
    PaginatedResponse,
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

export async function getMyQualifications(): Promise<ApiResponse<Qualification[]>> {
    const { data } = await apiClient.get<ApiResponse<Qualification[]>>(
        '/applicant-profiles/me/qualifications'
    )
    return data
}

export async function addMyQualification(
    qualData: CreateQualificationInput
): Promise<ApiResponse<Qualification>> {
    const { data } = await apiClient.post<ApiResponse<Qualification>>(
        '/applicant-profiles/me/qualifications',
        qualData
    )
    return data
}

export async function updateMyQualification(
    qualId: number,
    qualData: Partial<CreateQualificationInput>
): Promise<ApiResponse<Qualification>> {
    const { data } = await apiClient.put<ApiResponse<Qualification>>(
        `/applicant-profiles/me/qualifications/${qualId}`,
        qualData
    )
    return data
}

export async function deleteMyQualification(
    qualId: number
): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
        `/applicant-profiles/me/qualifications/${qualId}`
    )
    return data
}

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

export async function getMyProfessionalDetails(): Promise<ApiResponse<ProfessionalDetail[]>> {
    const { data } = await apiClient.get<ApiResponse<ProfessionalDetail[]>>(
        '/applicant-profiles/me/professional-details'
    )
    return data
}

export async function addMyProfessionalDetail(
    detailData: CreateProfessionalDetailInput
): Promise<ApiResponse<ProfessionalDetail>> {
    const { data } = await apiClient.post<ApiResponse<ProfessionalDetail>>(
        '/applicant-profiles/me/professional-details',
        detailData
    )
    return data
}

export async function updateMyProfessionalDetail(
    detailId: number,
    detailData: Partial<CreateProfessionalDetailInput>
): Promise<ApiResponse<ProfessionalDetail>> {
    const { data } = await apiClient.put<ApiResponse<ProfessionalDetail>>(
        `/applicant-profiles/me/professional-details/${detailId}`,
        detailData
    )
    return data
}

export async function deleteMyProfessionalDetail(
    detailId: number
): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
        `/applicant-profiles/me/professional-details/${detailId}`
    )
    return data
}

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

export async function getMyTrainingCourses(): Promise<ApiResponse<TrainingCourse[]>> {
    const { data } = await apiClient.get<ApiResponse<TrainingCourse[]>>(
        '/applicant-profiles/me/training-courses'
    )
    return data
}

export async function addMyTrainingCourse(
    courseData: CreateTrainingCourseInput
): Promise<ApiResponse<TrainingCourse>> {
    const { data } = await apiClient.post<ApiResponse<TrainingCourse>>(
        '/applicant-profiles/me/training-courses',
        courseData
    )
    return data
}

export async function updateMyTrainingCourse(
    courseId: number,
    courseData: Partial<CreateTrainingCourseInput>
): Promise<ApiResponse<TrainingCourse>> {
    const { data } = await apiClient.put<ApiResponse<TrainingCourse>>(
        `/applicant-profiles/me/training-courses/${courseId}`,
        courseData
    )
    return data
}

export async function deleteMyTrainingCourse(
    courseId: number
): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
        `/applicant-profiles/me/training-courses/${courseId}`
    )
    return data
}

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

export async function getMyProfessionalMemberships(): Promise<ApiResponse<ProfessionalMembership[]>> {
    const { data } = await apiClient.get<ApiResponse<ProfessionalMembership[]>>(
        '/applicant-profiles/me/professional-memberships'
    )
    return data
}

export async function addMyProfessionalMembership(
    membershipData: CreateProfessionalMembershipInput
): Promise<ApiResponse<ProfessionalMembership>> {
    const { data } = await apiClient.post<ApiResponse<ProfessionalMembership>>(
        '/applicant-profiles/me/professional-memberships',
        membershipData
    )
    return data
}

export async function updateMyProfessionalMembership(
    membershipId: number,
    membershipData: Partial<CreateProfessionalMembershipInput>
): Promise<ApiResponse<ProfessionalMembership>> {
    const { data } = await apiClient.put<ApiResponse<ProfessionalMembership>>(
        `/applicant-profiles/me/professional-memberships/${membershipId}`,
        membershipData
    )
    return data
}

export async function deleteMyProfessionalMembership(
    membershipId: number
): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
        `/applicant-profiles/me/professional-memberships/${membershipId}`
    )
    return data
}

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

export async function getMyEmploymentHistory(): Promise<ApiResponse<EmploymentHistory[]>> {
    const { data } = await apiClient.get<ApiResponse<EmploymentHistory[]>>(
        '/applicant-profiles/me/employment-history'
    )
    return data
}

export async function addMyEmploymentHistory(
    employmentData: CreateEmploymentHistoryInput
): Promise<ApiResponse<EmploymentHistory>> {
    const { data } = await apiClient.post<ApiResponse<EmploymentHistory>>(
        '/applicant-profiles/me/employment-history',
        employmentData
    )
    return data
}

export async function updateMyEmploymentHistory(
    employmentId: number,
    employmentData: Partial<CreateEmploymentHistoryInput>
): Promise<ApiResponse<EmploymentHistory>> {
    const { data } = await apiClient.put<ApiResponse<EmploymentHistory>>(
        `/applicant-profiles/me/employment-history/${employmentId}`,
        employmentData
    )
    return data
}

export async function deleteMyEmploymentHistory(
    employmentId: number
): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
        `/applicant-profiles/me/employment-history/${employmentId}`
    )
    return data
}

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

// ===== Referees Endpoints =====

export async function getMyReferees(): Promise<ApiResponse<any[]>> {
    const { data } = await apiClient.get<ApiResponse<any[]>>(
        '/applicant-profiles/me/referees'
    )
    return data
}

export async function addMyReferee(
    refereeData: any
): Promise<ApiResponse<any>> {
    const { data } = await apiClient.post<ApiResponse<any>>(
        '/applicant-profiles/me/referees',
        refereeData
    )
    return data
}

export async function updateMyReferee(
    refereeId: number,
    refereeData: any
): Promise<ApiResponse<any>> {
    const { data } = await apiClient.put<ApiResponse<any>>(
        `/applicant-profiles/me/referees/${refereeId}`,
        refereeData
    )
    return data
}

export async function deleteMyReferee(
    refereeId: number
): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
        `/applicant-profiles/me/referees/${refereeId}`
    )
    return data
}

export async function getReferees(
    profileId: number
): Promise<ApiResponse<any[]>> {
    const { data } = await apiClient.get<ApiResponse<any[]>>(
        `/applicant-profiles/${profileId}/referees`
    )
    return data
}

export async function addReferee(
    profileId: number,
    refereeData: any
): Promise<ApiResponse<any>> {
    const { data } = await apiClient.post<ApiResponse<any>>(
        `/applicant-profiles/${profileId}/referees`,
        refereeData
    )
    return data
}

export async function updateReferee(
    profileId: number,
    refereeId: number,
    refereeData: any
): Promise<ApiResponse<any>> {
    const { data } = await apiClient.put<ApiResponse<any>>(
        `/applicant-profiles/${profileId}/referees/${refereeId}`,
        refereeData
    )
    return data
}

export async function deleteReferee(
    profileId: number,
    refereeId: number
): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
        `/applicant-profiles/${profileId}/referees/${refereeId}`
    )
    return data
}

// ===== Admin Endpoints =====

export async function getProfileStats(): Promise<ApiResponse<{ totalProfiles: number; pwdProfiles: number; maleProfiles: number; femaleProfiles: number; }>> {
    const { data } = await apiClient.get<ApiResponse<{ totalProfiles: number; pwdProfiles: number; maleProfiles: number; femaleProfiles: number; }>>(
        '/applicant-profiles/stats'
    )
    return data
}

export async function getAllProfiles(
    filters?: Partial<ProfileFiltersInput>
): Promise<PaginatedResponse<ApplicantProfileWithRelations>> {
    const { data } = await apiClient.get<ApiResponse<{ data: ApplicantProfileWithRelations[], pagination: any }>>(
        '/applicant-profiles/admin/all',
        { params: filters }
    )
    return {
        success: data.success,
        message: data.message,
        data: data.data?.data || [],
        pagination: data.data?.pagination
    }
}

export async function exportProfiles(
    filters?: Partial<ProfileFiltersInput>
): Promise<Blob> {
    const { data } = await apiClient.get('/applicant-profiles/admin/export', {
        params: filters,
        responseType: 'blob',
    })
    return data
}
