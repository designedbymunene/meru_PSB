import { describe, it, expect, vi, beforeEach } from 'vitest'

const { logAction } = vi.hoisted(() => ({
    logAction: vi.fn(),
}))

vi.mock('../db', () => ({
    db: {
        query: {
            shortlistCriteria: { findFirst: vi.fn() },
            applications: { findMany: vi.fn() },
            vacancies: { findFirst: vi.fn() },
        },
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn(() => Promise.resolve([])),
            })),
        })),
    },
    applications: { id: 'applications.id', vacancyId: 'applications.vacancyId', status: 'applications.status' },
    shortlistCriteria: { vacancyId: 'shortlistCriteria.vacancyId' },
    vacancies: { id: 'vacancies.id' },
}))

vi.mock('../services/audit-service', () => ({
    AuditService: {
        logAction,
    },
}))

import { db } from '../db'
import { ShortlistService } from '../services/shortlist-service'

describe('ShortlistService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shortlists candidates using the configured education, experience, and membership weights', async () => {
        ;(db.query.vacancies.findFirst as any).mockResolvedValue({
            id: 77,
            openPositions: 1,
        })
        ;(db.query.shortlistCriteria.findFirst as any).mockResolvedValue({
            vacancyId: 77,
            weights: {
                education: 50,
                experience: 30,
                memberships: 20,
            },
            minScore: 60,
        })

        ;(db.query.applications.findMany as any).mockResolvedValue([
            {
                id: 1,
                vacancyId: 77,
                status: 'pending',
                notes: null,
                profileSnapshot: {
                    qualifications: [{ level: 'Bachelor of Science' }],
                    employmentHistory: [
                        { startDate: '2018-01-01', endDate: '2024-01-01' },
                    ],
                    professionalMemberships: [{}, {}],
                    professionalDetails: [{}],
                },
            },
            {
                id: 2,
                vacancyId: 77,
                status: 'pending',
                notes: null,
                profileSnapshot: {
                    qualifications: [{ level: 'Certificate' }],
                    employmentHistory: [
                        { startDate: '2023-01-01', endDate: '2024-01-01' },
                    ],
                    professionalMemberships: [],
                    professionalDetails: [],
                },
            },
        ])

        const result = await ShortlistService.runShortlisting(77, 11)

        expect(result).toEqual({ processed: 2, shortlisted: 1, fallbackShortlisted: 0 })
        expect(logAction).toHaveBeenCalledWith(
            expect.objectContaining({
                adminId: 11,
                action: 'BULK_SHORTLIST_RUN',
                targetType: 'vacancy',
                targetId: 77,
                newState: { processed: 2, shortlisted: 1, fallbackShortlisted: 0 },
            })
        )
    })

    it('fills shortlist slots with the highest ranked candidates when nobody meets the threshold', async () => {
        ;(db.query.vacancies.findFirst as any).mockResolvedValue({
            id: 77,
            openPositions: 1,
        })
        ;(db.query.shortlistCriteria.findFirst as any).mockResolvedValue({
            vacancyId: 77,
            weights: {
                education: 40,
                experience: 40,
                memberships: 20,
            },
            minScore: 95,
        })

        ;(db.query.applications.findMany as any).mockResolvedValue([
            {
                id: 1,
                vacancyId: 77,
                status: 'pending',
                notes: null,
                profileSnapshot: {
                    qualifications: [{ level: 'Bachelor of Science' }],
                    employmentHistory: [
                        { startDate: '2018-01-01', endDate: '2024-01-01' },
                    ],
                    professionalMemberships: [{}, {}],
                    professionalDetails: [{}],
                },
            },
            {
                id: 2,
                vacancyId: 77,
                status: 'pending',
                notes: null,
                profileSnapshot: {
                    qualifications: [{ level: 'Certificate' }],
                    employmentHistory: [
                        { startDate: '2023-01-01', endDate: '2024-01-01' },
                    ],
                    professionalMemberships: [],
                    professionalDetails: [],
                },
            },
        ])

        const result = await ShortlistService.runShortlisting(77, 11)

        expect(result).toEqual({ processed: 2, shortlisted: 1, fallbackShortlisted: 1 })
    })
})
