import { ApplicantProfile } from '../db/schema'

export function calculateProfileCompletion(profile: any) {
    const sections = {
        personal: 0,
        location: 0,
        education: 0,
        experience: 0,
        professional: 0,
        referees: 0
    }

    // 1. Personal Info (fullName, email, phoneNumber, idNumber, dateOfBirth, gender)
    const personalFields = ['fullName', 'email', 'phoneNumber', 'idNumber', 'dateOfBirth', 'gender']
    const filledPersonal = personalFields.filter(f => !!profile[f]).length
    sections.personal = Math.round((filledPersonal / personalFields.length) * 100)

    // 2. Location & Ethnicity (homeCountyId, homeSubCountyId, wardId, ethnicityId)
    const locationFields = ['homeCountyId', 'homeSubCountyId', 'wardId', 'ethnicityId']
    const filledLocation = locationFields.filter(f => !!profile[f]).length
    sections.location = Math.round((filledLocation / locationFields.length) * 100)

    // 3. Academic (Has at least one qualification)
    sections.education = profile.qualifications?.length > 0 ? 100 : 0

    // 4. Experience (Has at least one employment record OR marked as N/A)
    sections.experience = (profile.employmentHistory?.length > 0 || profile.hasNoExperience) ? 100 : 0
 
    // 5. Professional (Has professional details OR memberships OR marked as N/A for all empty sub-sections)
    const hasCerts = profile.professionalDetails?.length > 0 || profile.hasNoCertificates
    const hasTrainings = profile.trainingCourses?.length > 0 || profile.hasNoTrainings
    const hasMemberships = profile.professionalMemberships?.length > 0 || profile.hasNoMemberships
    
    // For professional to be complete, they either need at least one record (any) 
    // OR if they have no records, they must have marked the relevant ones as N/A
    const hasAnyProfessionalRecord = profile.professionalDetails?.length > 0 || 
                                     profile.trainingCourses?.length > 0 || 
                                     profile.professionalMemberships?.length > 0
                                     
    if (hasAnyProfessionalRecord) {
        sections.professional = 100
    } else {
        sections.professional = (profile.hasNoCertificates && profile.hasNoTrainings && profile.hasNoMemberships) ? 100 : 0
    }
 
    // 6. Referees (Has at least 1 referee OR marked as N/A)
    sections.referees = (profile.referees?.length >= 1 || profile.hasNoReferees) ? 100 : 0

    // Overall Calculation (Weighted)
    // Personal: 20%, Location: 20%, Education: 20%, Experience: 20%, Professional: 10%, Referees: 10%
    const overallPercentage = Math.round(
        (sections.personal * 0.20) +
        (sections.location * 0.20) +
        (sections.education * 0.20) +
        (sections.experience * 0.20) +
        (sections.professional * 0.10) +
        (sections.referees * 0.10)
    )

    return {
        overallPercentage,
        sections
    }
}
