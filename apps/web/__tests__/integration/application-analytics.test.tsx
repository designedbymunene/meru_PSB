import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useCreateApplication } from '@/hooks/use-applications'
import * as applicationApi from '@/lib/api/applications'
import * as analyticsLib from '@/lib/analytics'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// Mock dependencies
vi.mock('@/lib/api/applications')
vi.mock('@/lib/analytics')
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}))
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

function TestComponent() {
    const { mutate, isPending } = useCreateApplication()

    return (
        <div>
            <button
                onClick={() =>
                    mutate({
                        data: {
                            vacancyId: 'vacancy-1',
                            userId: 'user-1',
                            fullName: 'John Doe',
                            email: 'john@example.com',
                            phone: '1234567890',
                            cv: 'resume.pdf',
                            coverLetter: 'I am interested',
                        },
                    })
                }
            >
                Submit Application
            </button>
            {isPending && <div>Loading...</div>}
        </div>
    )
}

describe('Application Analytics Integration', () => {
    let queryClient: QueryClient

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })
        vi.clearAllMocks()
        vi.mocked(useRouter).mockReturnValue({
            push: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
            refresh: vi.fn(),
            prefetch: vi.fn(),
            replace: vi.fn(),
        } as any)
    })

    it('tracks application submitted event on successful submission', async () => {
        const mockResponse = {
            data: {
                id: 'app-1',
                vacancyId: 'vacancy-1',
                userId: 'user-1',
                fullName: 'John Doe',
                email: 'john@example.com',
            },
        }

        vi.mocked(applicationApi.createApplication).mockResolvedValue(mockResponse as any)

        render(
            <QueryClientProvider client={queryClient}>
                <TestComponent />
            </QueryClientProvider>
        )

        const button = screen.getByRole('button', { name: /submit application/i })
        fireEvent.click(button)

        await waitFor(() => {
            expect(analyticsLib.trackApplicationSubmitted).toHaveBeenCalledWith('vacancy-1')
        })
    })

    it('tracks form error on submission failure', async () => {
        const mockError = new Error('Network error')
        vi.mocked(applicationApi.createApplication).mockRejectedValue(mockError)

        render(
            <QueryClientProvider client={queryClient}>
                <TestComponent />
            </QueryClientProvider>
        )

        const button = screen.getByRole('button', { name: /submit application/i })
        fireEvent.click(button)

        await waitFor(() => {
            expect(analyticsLib.trackFormError).toHaveBeenCalledWith(
                'application-form',
                expect.any(String)
            )
        })
    })

    it('shows success toast after tracking analytics', async () => {
        const mockResponse = {
            data: {
                id: 'app-1',
                vacancyId: 'vacancy-1',
                userId: 'user-1',
                fullName: 'John Doe',
                email: 'john@example.com',
            },
        }

        vi.mocked(applicationApi.createApplication).mockResolvedValue(mockResponse as any)

        render(
            <QueryClientProvider client={queryClient}>
                <TestComponent />
            </QueryClientProvider>
        )

        const button = screen.getByRole('button', { name: /submit application/i })
        fireEvent.click(button)

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalled()
        })
    })
})
