export const APPLICATION_STATUS_NOTIFICATION_TARGETS = ['interviewing', 'accepted'] as const

export type ApplicationNotificationStatus = typeof APPLICATION_STATUS_NOTIFICATION_TARGETS[number]

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pending',
    reviewed: 'Reviewed',
    shortlisted: 'Shortlisted',
    interviewing: 'Interview Scheduled',
    interviewed: 'Interviewed',
    accepted: 'Accepted',
    rejected: 'Not Successful',
    draft: 'Draft',
}

export const getApplicationStatusLabel = (status?: string | null) => {
    if (!status) return 'Pending'
    return STATUS_LABELS[status.toLowerCase()] ?? status
}

export const getDashboardApplicationProgress = (status: string) => {
    const s = status.toLowerCase()
    switch (s) {
        case 'pending':
            return 15
        case 'under_review':
            return 30
        case 'reviewed':
            return 45
        case 'shortlisted':
            return 65
        case 'interviewing':
            return 80
        case 'interviewed':
            return 90
        case 'accepted':
        case 'offered':
            return 100
        case 'rejected':
            return 100
        default:
            return 10
    }
}

export const getDashboardApplicationNextStep = (status: string) => {
    const s = status.toLowerCase()
    switch (s) {
        case 'pending':
            return 'Document Verification'
        case 'under_review':
            return 'HR Qualification Review'
        case 'reviewed':
            return 'Shortlist Consideration'
        case 'shortlisted':
            return 'Interview Scheduling'
        case 'interviewing':
            return 'Interview Assessment'
        case 'interviewed':
            return 'Final Committee Decision'
        case 'accepted':
        case 'offered':
            return 'Contract Signing'
        case 'rejected':
            return 'Application Concluded'
        default:
            return 'Initial Processing'
    }
}

export const isApplicationNotificationStatus = (status: string): status is ApplicationNotificationStatus => {
    return (APPLICATION_STATUS_NOTIFICATION_TARGETS as readonly string[]).includes(status.toLowerCase())
}

export const serializeApplication = <T extends { status: string }>(application: T) => {
    return {
        ...application,
        statusLabel: getApplicationStatusLabel(application.status),
        progress: getDashboardApplicationProgress(application.status),
        nextStep: getDashboardApplicationNextStep(application.status),
    }
}

export const serializeApplications = <T extends { status: string }>(applications: T[]) => {
    return applications.map(serializeApplication)
}
