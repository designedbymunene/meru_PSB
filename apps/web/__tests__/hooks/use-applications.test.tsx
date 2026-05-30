import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import {
    useMyApplications,
    useApplication,
    useCreateApplication,
    useReviewApplication,
} from '@/hooks/use-applications'
import * as applicationApi from '@/lib/api/applications'

vi.mock('@/lib/api/applications')
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
}))
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })

    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}

describe('useApplications hook', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('useMyApplications', () => {
        it('fetches user applications', async () => {
            const mockData = {
                data: [
                    { id: 1, vacancyId: 1, status: 'draft' },
                    { id: 2, vacancyId: 2, status: 'submitted' },
                ],
                message: 'Success',
            }

            ;(applicationApi.getMyApplications as any).mockResolvedValue(mockData)

            const { result } = renderHook(() => useMyApplications(), {
                wrapper: createWrapper(),
            })

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual(mockData)
            expect(applicationApi.getMyApplications).toHaveBeenCalledWith(undefined)
        })

        it('fetches applications with filters', async () => {
            const filters = { status: 'submitted' }
            const mockData = { data: [], message: 'Success' }

            ;(applicationApi.getMyApplications as any).mockResolvedValue(mockData)

            const { result } = renderHook(() => useMyApplications(filters), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(applicationApi.getMyApplications).toHaveBeenCalledWith(filters)
        })

        it('handles error when fetching fails', async () => {
            const error = new Error('Network error')
            ;(applicationApi.getMyApplications as any).mockRejectedValue(error)

            const { result } = renderHook(() => useMyApplications(), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
            })

            expect(result.current.error).toBe(error)
        })
    })

    describe('useApplication', () => {
        it('fetches single application by id', async () => {
            const applicationId = 1
            const mockData = {
                data: { id: 1, vacancyId: 1, status: 'submitted' },
                message: 'Success',
            }

            ;(applicationApi.getApplication as any).mockResolvedValue(mockData)

            const { result } = renderHook(() => useApplication(applicationId), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual(mockData)
            expect(applicationApi.getApplication).toHaveBeenCalledWith(applicationId)
        })

        it('disables query when id is falsy', () => {
            ;(applicationApi.getApplication as any).mockResolvedValue({})

            const { result } = renderHook(() => useApplication(0), {
                wrapper: createWrapper(),
            })

            expect(result.current.data).toBeUndefined()
            expect(applicationApi.getApplication).not.toHaveBeenCalled()
        })
    })

    describe('useCreateApplication', () => {
        it('creates new application with data', async () => {
            const applicationData = {
                vacancyId: 1,
                documents: [],
            }
            const mockResponse = {
                data: { id: 1, vacancyId: 1 },
                message: 'Application submitted',
            }

            ;(applicationApi.createApplication as any).mockResolvedValue(mockResponse)

            const { result } = renderHook(() => useCreateApplication(), {
                wrapper: createWrapper(),
            })

            result.current.mutate({ data: applicationData })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual(mockResponse)
        })

        it('handles submission error', async () => {
            const error = new Error('Validation failed')
            ;(applicationApi.createApplication as any).mockRejectedValue(error)

            const { result } = renderHook(() => useCreateApplication(), {
                wrapper: createWrapper(),
            })

            result.current.mutate({ data: { vacancyId: 1, documents: [] } })

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
            })

            expect(result.current.error).toBe(error)
        })
    })

    describe('useReviewApplication', () => {
        it('reviews application with feedback', async () => {
            const applicationId = 1
            const reviewData = { status: 'shortlisted', feedback: 'Good candidate' }
            const mockResponse = { data: { id: 1 }, message: 'Reviewed' }

            ;(applicationApi.reviewApplication as any).mockResolvedValue(mockResponse)

            const { result } = renderHook(() => useReviewApplication(), {
                wrapper: createWrapper(),
            })

            result.current.mutate({
                id: applicationId,
                data: reviewData,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(applicationApi.reviewApplication).toHaveBeenCalledWith(
                applicationId,
                reviewData
            )
        })
    })
})
