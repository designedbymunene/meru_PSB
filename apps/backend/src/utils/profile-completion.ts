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

    // 4. Experience (Has at least one employment record)
    sections.experience = profile.employmentHistory?.length > 0 ? 100 : 0

    // 5. Professional (Has professional details OR memberships)
    const hasCerts = profile.professionalDetails?.length > 0 || profile.trainingCourses?.length > 0
    const hasMemberships = profile.professionalMemberships?.length > 0
    sections.professional = (hasCerts || hasMemberships) ? 100 : 0

    // 6. Referees (Has at least 2 referees)
    const refereeCount = profile.referees?.length || 0
    sections.referees = refereeCount >= 2 ? 100 : (refereeCount === 1 ? 50 : 0)

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
