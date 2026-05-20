import { beforeEach, describe, expect, it, vi } from 'vitest'

const { findUser, findVacancy, sendApplicationStatusEmail, sendPushNotification } = vi.hoisted(() => ({
    findUser: vi.fn(),
    findVacancy: vi.fn(),
    sendApplicationStatusEmail: vi.fn(),
    sendPushNotification: vi.fn(),
}))

vi.mock('../db', () => ({
    db: {
        query: {
            users: { findFirst: findUser },
            vacancies: { findFirst: findVacancy },
        },
    },
}))

vi.mock('../utils/mailer', () => ({
    sendApplicationStatusEmail,
}))

vi.mock('../services/notification-service', () => ({
    NotificationService: {
        sendPushNotification,
    },
}))

import { ApplicationNotificationService } from '../services/application-notification-service'

describe('ApplicationNotificationService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        findUser.mockResolvedValue({
            email: 'applicant@example.com',
            fullName: 'Jane Applicant',
            pushToken: 'ExponentPushToken[abc123]',
        })
        findVacancy.mockResolvedValue({
            title: 'Senior Clerk',
        })
        sendApplicationStatusEmail.mockResolvedValue({ success: true })
        sendPushNotification.mockResolvedValue({ success: true })
    })

    it('sends email and push notifications for shortlisted statuses', async () => {
        const result = await ApplicationNotificationService.notifyApplicationStatusChange({
            applicantId: 1001,
            applicationId: 501,
            vacancyId: 700,
            status: 'rejected',
            rejectionReason: 'Did not meet the minimum score',
        })

        expect(result.success).toBe(true)
        expect(sendApplicationStatusEmail).toHaveBeenCalledWith(expect.objectContaining({
            to: 'applicant@example.com',
            fullName: 'Jane Applicant',
            vacancyTitle: 'Senior Clerk',
            status: 'rejected',
            rejectionReason: 'Did not meet the minimum score',
        }))
        expect(sendPushNotification).toHaveBeenCalledWith(expect.objectContaining({
            to: 'ExponentPushToken[abc123]',
            title: 'Application Update - Not Successful',
            body: 'Your application for Senior Clerk is now Not Successful.',
        }))
    })

    it('skips non-notification statuses like shortlisted', async () => {
        const result = await ApplicationNotificationService.notifyApplicationStatusChange({
            applicantId: 1001,
            applicationId: 501,
            vacancyId: 700,
            status: 'shortlisted',
        })

        expect(result).toEqual({ success: true, skipped: true })
        expect(sendApplicationStatusEmail).not.toHaveBeenCalled()
        expect(sendPushNotification).not.toHaveBeenCalled()
    })
})
