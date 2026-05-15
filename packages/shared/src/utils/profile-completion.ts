export type ProfileSectionGroup = 'required' | 'optional'

export type ProfileSectionId =
    | 'personal'
    | 'contact'
    | 'location'
    | 'education'
    | 'experience'
    | 'professional'
    | 'training'
    | 'memberships'
    | 'referees'
    | 'documents'

export interface ProfileCompletionSection {
    id: ProfileSectionId
    label: string
    description: string
    group: ProfileSectionGroup
    percentage: number
    completed: boolean
    required: boolean
}

export interface ProfileCompletionSummary {
    overallPercentage: number
    requiredPercentage: number
    optionalPercentage: number
    requiredCompleteCount: number
    requiredTotalCount: number
    optionalCompleteCount: number
    optionalTotalCount: number
    canApply: boolean
    requiredMissing: string[]
    optionalMissing: string[]
    sections: Record<ProfileSectionId, number>
    groups: {
        required: ProfileCompletionSection[]
        optional: ProfileCompletionSection[]
    }
}

const countFilled = (profile: any, fields: string[]) =>
    fields.filter((field) => Boolean(profile?.[field])).length

const sectionFromFields = (
    profile: any,
    id: ProfileSectionId,
    label: string,
    description: string,
    group: ProfileSectionGroup,
    fields: string[]
): ProfileCompletionSection => {
    const filled = countFilled(profile, fields)
    const percentage = Math.round((filled / fields.length) * 100)

    return {
        id,
        label,
        description,
        group,
        percentage,
        completed: percentage === 100,
        required: group === 'required',
    }
}

const sectionFromCollection = (
    profile: any,
    id: ProfileSectionId,
    label: string,
    description: string,
    group: ProfileSectionGroup,
    collectionKey: string,
    fallbackFlags: string[] = []
): ProfileCompletionSection => {
    const hasCollection = (profile?.[collectionKey]?.length ?? 0) > 0
    const hasFallback = fallbackFlags.some((flag) => Boolean(profile?.[flag]))
    const completed = hasCollection || hasFallback

    return {
        id,
        label,
        description,
        group,
        percentage: completed ? 100 : 0,
        completed,
        required: group === 'required',
    }
}

export function calculateProfileCompletion(profile: any): ProfileCompletionSummary {
    const sections = [
        sectionFromFields(
            profile,
            'personal',
            'Personal Details',
            'Name, ID number and date of birth',
            'required',
            ['fullName', 'idNumber', 'gender', 'dateOfBirth']
        ),
        sectionFromFields(
            profile,
            'contact',
            'Contact Details',
            'Phone number and email address',
            'required',
            ['phoneNumber', 'email']
        ),
        sectionFromFields(
            profile,
            'location',
            'Location Details',
            'County, sub-county, ward and ethnicity',
            'required',
            ['homeCountyId', 'homeSubCountyId', 'wardId', 'ethnicityId']
        ),
        sectionFromCollection(
            profile,
            'education',
            'Academic History',
            'At least one qualification',
            'required',
            'qualifications'
        ),
        sectionFromCollection(
            profile,
            'experience',
            'Employment History',
            'Work records or N/A declaration',
            'required',
            'employmentHistory',
            ['hasNoExperience']
        ),
        sectionFromCollection(
            profile,
            'professional',
            'Professional Details',
            'Licenses and registrations',
            'optional',
            'professionalDetails',
            ['hasNoCertificates']
        ),
        sectionFromCollection(
            profile,
            'training',
            'Training Courses',
            'Short courses and workshops',
            'required',
            'trainingCourses',
            ['hasNoTrainings']
        ),
        sectionFromCollection(
            profile,
            'memberships',
            'Memberships',
            'Professional body memberships',
            'optional',
            'professionalMemberships',
            ['hasNoMemberships']
        ),
        sectionFromCollection(
            profile,
            'referees',
            'Referees',
            'Reference contacts or N/A declaration',
            'optional',
            'referees',
            ['hasNoReferees']
        ),
        sectionFromCollection(
            profile,
            'documents',
            'Uploads',
            'ID, CV and other supporting documents',
            'optional',
            'documents'
        ),
    ]

    const sectionMap = sections.reduce((acc, section) => {
        acc[section.id] = section.percentage
        return acc
    }, {} as Record<ProfileSectionId, number>)

    const requiredSections = sections.filter((section) => section.group === 'required')
    const optionalSections = sections.filter((section) => section.group === 'optional')

    const requiredCompleteCount = requiredSections.filter((section) => section.completed).length
    const optionalCompleteCount = optionalSections.filter((section) => section.completed).length
    const requiredTotalCount = requiredSections.length
    const optionalTotalCount = optionalSections.length

    const requiredPercentage = Math.round(
        requiredSections.reduce((sum, section) => sum + section.percentage, 0) /
            Math.max(1, requiredTotalCount)
    )
    const optionalPercentage = Math.round(
        optionalSections.reduce((sum, section) => sum + section.percentage, 0) /
            Math.max(1, optionalTotalCount)
    )
    const overallPercentage = Math.round(
        sections.reduce((sum, section) => sum + section.percentage, 0) / Math.max(1, sections.length)
    )

    const requiredMissing = requiredSections
        .filter((section) => !section.completed)
        .map((section) => section.label)

    const optionalMissing = optionalSections
        .filter((section) => !section.completed)
        .map((section) => section.label)

    return {
        overallPercentage,
        requiredPercentage,
        optionalPercentage,
        requiredCompleteCount,
        requiredTotalCount,
        optionalCompleteCount,
        optionalTotalCount,
        canApply: requiredMissing.length === 0,
        requiredMissing,
        optionalMissing,
        sections: sectionMap,
        groups: {
            required: requiredSections,
            optional: optionalSections,
        },
    }
}
