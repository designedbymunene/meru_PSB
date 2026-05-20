export const APPLICATION_STATUS_NOTIFICATION_TARGETS = ['interviewing', 'accepted', 'rejected'] as const

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

export const isApplicationNotificationStatus = (status: string): status is ApplicationNotificationStatus => {
    return (APPLICATION_STATUS_NOTIFICATION_TARGETS as readonly string[]).includes(status.toLowerCase())
}

export const serializeApplication = <T extends { status: string }>(application: T) => {
    return {
        ...application,
        statusLabel: getApplicationStatusLabel(application.status),
    }
}

export const serializeApplications = <T extends { status: string }>(applications: T[]) => {
    return applications.map(serializeApplication)
}
