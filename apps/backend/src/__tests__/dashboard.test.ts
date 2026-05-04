import { test } from 'node:test'
import assert from 'node:assert'
import {
    buildDashboardData,
    getDashboardApplicationNextStep,
    getDashboardApplicationProgress,
    getDashboardVacancyBadge
} from '../utils/dashboard'

test('dashboard helpers - derive application state and vacancy badge', async () => {
    assert.strictEqual(getDashboardApplicationProgress('pending'), 45)
    assert.strictEqual(getDashboardApplicationProgress('reviewed'), 70)
    assert.strictEqual(getDashboardApplicationNextStep('pending'), 'Document Verification')
    assert.strictEqual(getDashboardApplicationNextStep('reviewed'), 'Interview Scheduling')

    const badge = getDashboardVacancyBadge({
        id: 1,
        advertisementNumber: 'VG/1999/001',
        title: 'Test Vacancy',
        description: 'Test',
        departmentId: null,
        jobGroupId: 1,
        closingDate: '1999-01-01',
        openPositions: 1,
        jobRequirements: [],
        jobResponsibilities: [],
        status: 'open',
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        department: null,
        jobGroup: null
    })

    assert.strictEqual(badge, 'Expired')
})

test('dashboard helpers - build combined payload', async () => {
    const dashboard = buildDashboardData(
        [
            {
                id: 101,
                applicantId: 1,
                vacancyId: 201,
                status: 'reviewed',
                notes: null,
                rating: null,
                reviewedAt: new Date(),
                reviewedBy: 1,
                rejectionReason: null,
                feedbackToApplicant: null,
                appliedAt: new Date('2026-04-28T10:00:00.000Z'),
                vacancy: {
                    id: 201,
                    advertisementNumber: 'VG/2026/001',
                    title: 'Medical Officer',
                    description: 'Role description',
                    departmentId: 10,
                    jobGroupId: 100,
                    closingDate: '2026-05-15',
                    openPositions: 3,
                    jobRequirements: [],
                    jobResponsibilities: [],
                    status: 'open',
                    createdBy: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    department: { name: 'Health Services' },
                    jobGroup: { name: 'Job Group M' }
                }
            },
            {
                id: 102,
                applicantId: 1,
                vacancyId: 202,
                status: 'pending',
                notes: null,
                rating: null,
                reviewedAt: null,
                reviewedBy: null,
                rejectionReason: null,
                feedbackToApplicant: null,
                appliedAt: new Date('2026-04-29T09:00:00.000Z'),
                vacancy: {
                    id: 202,
                    advertisementNumber: 'VG/2026/002',
                    title: 'Accountant',
                    description: 'Role description',
                    departmentId: 11,
                    jobGroupId: 101,
                    closingDate: '2026-05-20',
                    openPositions: 1,
                    jobRequirements: [],
                    jobResponsibilities: [],
                    status: 'open',
                    createdBy: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    department: { name: 'Finance & Economic Planning' },
                    jobGroup: { name: 'Job Group L' }
                }
            }
        ],
        [
            {
                id: 301,
                advertisementNumber: 'VG/2026/010',
                title: 'Chief Officer',
                description: 'Role description',
                departmentId: 20,
                jobGroupId: 103,
                closingDate: '2026-05-25',
                openPositions: 2,
                jobRequirements: [],
                jobResponsibilities: [],
                status: 'open',
                createdBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                department: { name: 'Administration' },
                jobGroup: { name: 'Job Group H' }
            },
            {
                id: 302,
                advertisementNumber: 'VG/2026/011',
                title: 'Records Officer',
                description: 'Role description',
                departmentId: 20,
                jobGroupId: 103,
                closingDate: '2026-04-10',
                openPositions: 1,
                jobRequirements: [],
                jobResponsibilities: [],
                status: 'open',
                createdBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                department: { name: 'Administration' },
                jobGroup: { name: 'Job Group H' }
            }
        ]
    )

    assert.deepStrictEqual(dashboard.quickStats, {
        applied: 2,
        shortlisted: 1,
        interviews: 0,
        saved: 0
    })

    assert.strictEqual(dashboard.ongoingActivity?.id, 'app_102')
    assert.strictEqual(dashboard.ongoingActivity?.status, 'PENDING')
    assert.strictEqual(dashboard.recommended.length, 1)
    assert.strictEqual(dashboard.recommended[0].title, 'Chief Officer')
    assert.strictEqual(dashboard.recommended[0].jobGroup.code, 'H')
})