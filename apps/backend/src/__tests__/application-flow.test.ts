import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import app from '../index'
import { db } from '../db'
import * as authUtils from '../utils/auth'
import fs from 'fs'
import path from 'path'

// Mock database and services
vi.mock('../db', () => ({
    db: {
        query: {
            users: { findFirst: vi.fn() },
            applicantProfiles: { findFirst: vi.fn() },
            applications: { findFirst: vi.fn(), findMany: vi.fn() },
            vacancies: { findFirst: vi.fn() },
            auditLogs: { insert: vi.fn() }
        },
        insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([])) })) })),
        update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([])) })) })) })),
        transaction: vi.fn((cb) => cb(db))
    },
    users: { id: 'users.id', email: 'users.email', tokenVersion: 'users.tokenVersion' },
    applications: { id: 'applications.id', applicantId: 'applications.applicantId', vacancyId: 'applications.vacancyId', status: 'applications.status' },
    applicantProfiles: { id: 'applicantProfiles.id', userId: 'applicantProfiles.userId' },
    auditLogs: { id: 'auditLogs.id' }
}))

// Mock Auth Utils
vi.mock('../utils/auth', () => ({
    hashPassword: vi.fn(() => Promise.resolve('hashed-password')),
    verifyPassword: vi.fn(() => Promise.resolve(true)),
    generateAccessToken: vi.fn(() => 'mock-token'),
    generateRefreshToken: vi.fn(() => 'mock-token'),
    verifyAccessToken: vi.fn()
}))

const TRACE_FILE = path.join(__dirname, 'flow-trace.json')
const traces: any[] = []

async function traceRequest(step: string, method: string, path: string, reqPayload: any, res: Response) {
    const resBody = await res.clone().json().catch(() => null)
    traces.push({
        step,
        method,
        path,
        status: res.status,
        reqPayload,
        resBody,
        timestamp: new Date().toISOString()
    })
}

describe('Job Application Flow Integration Test', () => {
    let applicantToken: string
    let adminToken: string
    let applicationId: number

    beforeAll(() => {
        const mockedAuth = vi.mocked(authUtils)
        mockedAuth.verifyAccessToken.mockImplementation((token: string) => {
            if (token === 'admin-token') return { userId: 2, role: 'admin', tokenVersion: 0, email: 'admin@example.com' }
            return { userId: 1, role: 'applicant', tokenVersion: 0, email: 'applicant@example.com' }
        })

        ;(db.query.users.findFirst as any).mockImplementation((params: any) => {
            const whereStr = JSON.stringify(params?.where || {})
            if (whereStr.includes('admin@example.com') || whereStr.includes('2')) {
                return Promise.resolve({ id: 2, role: 'admin', email: 'admin@example.com', tokenVersion: 0, password: 'hashed-password' })
            }
            return Promise.resolve({ id: 1, role: 'applicant', email: 'applicant@example.com', tokenVersion: 0, password: 'hashed-password' })
        })
    })

    afterAll(() => {
        fs.writeFileSync(TRACE_FILE, JSON.stringify(traces, null, 2))
    })

    it('Step 1: Log in as an applicant', async () => {
        const payload = { email: 'applicant@example.com', password: 'password123' }
        const res = await app.fetch(new Request('http://localhost/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }))
        await traceRequest('Step 1: Login', 'POST', '/api/auth/login', payload, res)
        expect(res.status).toBe(200)
        const loginBody = await res.json() as any
        applicantToken = loginBody.data.accessToken
    })

    it('Step 2: Attempt to apply for a job with a partially filled CV', async () => {
        const payload = { vacancyId: 101 }
        ;(db.query.vacancies.findFirst as any).mockResolvedValueOnce({ id: 101, status: 'open', closingDate: '2099-01-01' })
        ;(db.query.applicantProfiles.findFirst as any).mockResolvedValueOnce({
            id: 1, userId: 1, fullName: 'John Doe', qualifications: []
        })

        const res = await app.fetch(new Request('http://localhost/api/applications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${applicantToken}` },
            body: JSON.stringify(payload)
        }))
        await traceRequest('Step 2: Partial CV Submission', 'POST', '/api/applications', payload, res)
        expect(res.status).toBe(400)
    })

    it('Step 3: Complete the missing CV fields', async () => {
        const payload = {
            fullName: 'John Doe', idNumber: '12345678', gender: 'Male', phoneNumber: '0712345678',
            email: 'john@example.com', dateOfBirth: '1990-01-01', ethnicityId: 1,
            homeCountyId: 1, homeSubCountyId: 1, wardId: 1
        }
        ;(db.query.applicantProfiles.findFirst as any).mockResolvedValueOnce({ id: 1, userId: 1 })
        
        const returningMock = vi.fn().mockResolvedValueOnce([{ ...payload, id: 1 }])
        ;(db.update as any).mockReturnValueOnce({
            set: vi.fn().mockReturnValueOnce({
                where: vi.fn().mockReturnValueOnce({
                    returning: returningMock
                })
            })
        })

        const res = await app.fetch(new Request('http://localhost/api/applicant-profiles/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${applicantToken}` },
            body: JSON.stringify(payload)
        }))
        await traceRequest('Step 3: Complete CV', 'PUT', '/api/applicant-profiles/me', payload, res)
        expect(res.status).toBe(200)
    })

    it('Step 4: Re-submit the application', async () => {
        const payload = { vacancyId: 101 }
        ;(db.query.vacancies.findFirst as any).mockResolvedValue({ id: 101, status: 'open', closingDate: '2099-01-01' })
        
        // Required fields mock for application eligibility
        ;(db.query.applicantProfiles.findFirst as any).mockResolvedValue({
            id: 1, userId: 1, fullName: 'John Doe', idNumber: '12345678', gender: 'Male',
            phoneNumber: '0712345678', email: 'john@example.com', dateOfBirth: '1990-01-01',
            qualifications: [{}]
        })

        applicationId = 501
        ;(db.insert as any).mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{ id: applicationId, vacancyId: 101, applicantId: 1 }])
            })
        })

        const res = await app.fetch(new Request('http://localhost/api/applications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${applicantToken}` },
            body: JSON.stringify(payload)
        }))
        await traceRequest('Step 4: Re-submit Application', 'POST', '/api/applications', payload, res)
        expect(res.status).toBe(200)
    })

    it('Step 5: Log in as an admin', async () => {
        const payload = { email: 'admin@example.com', password: 'password123' }
        const mockedAuth = vi.mocked(authUtils)
        mockedAuth.generateAccessToken.mockReturnValueOnce('admin-token')

        const res = await app.fetch(new Request('http://localhost/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }))
        await traceRequest('Step 5: Admin Login', 'POST', '/api/auth/login', payload, res)
        expect(res.status).toBe(200)
        const body = await res.json() as any
        adminToken = body.data.accessToken
        expect(adminToken).toBe('admin-token')
        expect(body.data.user.role).toBe('admin')
    })

    it('Step 6: Fetch the specific application by ID', async () => {
        ;(db.query.applications.findFirst as any).mockResolvedValueOnce({
            id: applicationId,
            profileSnapshot: { fullName: 'John Doe', idNumber: '12345678' },
            applicant: { id: 1, fullName: 'John Doe' },
            vacancy: { id: 101, title: 'Mock Job' }
        })

        const res = await app.fetch(new Request(`http://localhost/api/applications/${applicationId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        }))
        await traceRequest('Step 6: Fetch Application', 'GET', `/api/applications/${applicationId}`, null, res)
        expect(res.status).toBe(200)
    })

    it('Step 7: Export applications to CSV', async () => {
        ;(db.query.applications.findMany as any).mockResolvedValueOnce([
            {
                id: applicationId,
                profileSnapshot: { 
                    fullName: 'John Doe', idNumber: '12345678', gender: 'Male',
                    birthYear: '1990', email: 'john@example.com', phoneNumber: '0712345678',
                    qualifications: [{ level: 'Degree', course: 'CS', institution: 'Uni', yearStart: 2010, yearEnd: 2014 }]
                },
                vacancy: { advertisementNumber: 'V001', title: 'Mock Job' },
                applicant: { id: 1 }
            }
        ])

        const res = await app.fetch(new Request('http://localhost/api/applications/admin/export', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        }))

        const csv = await res.clone().text()
        traces.push({
            step: 'Step 7: Export CSV',
            method: 'GET',
            path: '/api/applications/admin/export',
            status: res.status,
            resBody: 'CSV CONTENT TRUNCATED',
            timestamp: new Date().toISOString()
        })
        expect(res.status).toBe(200)
        expect(csv).toMatchSnapshot()
    })
})
