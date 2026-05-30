import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import {
    useVacancies,
    useVacancy,
    useCreateVacancy,
    useUpdateVacancy,
    useDeleteVacancy,
} from '@/hooks/use-vacancies'
import * as vacancyApi from '@/lib/api/vacancies'

vi.mock('@/lib/api/vacancies')
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

describe('useVacancies hook', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('useVacancies', () => {
        it('fetches all vacancies', async () => {
            const mockData = {
                data: [
                    { id: 1, title: 'Developer', department: 'IT' },
                    { id: 2, title: 'Manager', department: 'HR' },
                ],
                message: 'Success',
            }

            ;(vacancyApi.getVacancies as any).mockResolvedValue(mockData)

            const { result } = renderHook(() => useVacancies(), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual(mockData)
        })

        it('fetches vacancies with filters', async () => {
            const filters = { department: 'IT', status: 'open' }
            const mockData = { data: [], message: 'Success' }

            ;(vacancyApi.getVacancies as any).mockResolvedValue(mockData)

            const { result } = renderHook(() => useVacancies(filters), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(vacancyApi.getVacancies).toHaveBeenCalledWith(filters)
        })

        it('uses initial data when provided', async () => {
            const initialData = {
                data: [{ id: 1, title: 'Developer' }],
                message: 'Success',
            }

            ;(vacancyApi.getVacancies as any).mockResolvedValue(initialData)

            const { result } = renderHook(() => useVacancies(undefined, initialData), {
                wrapper: createWrapper(),
            })

            expect(result.current.data).toEqual(initialData)
        })
    })

    describe('useVacancy', () => {
        it('fetches single vacancy by id', async () => {
            const vacancyId = 1
            const mockData = {
                data: { id: 1, title: 'Developer', department: 'IT' },
                message: 'Success',
            }

            ;(vacancyApi.getVacancy as any).mockResolvedValue(mockData)

            const { result } = renderHook(() => useVacancy(vacancyId), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual(mockData)
            expect(vacancyApi.getVacancy).toHaveBeenCalledWith(vacancyId)
        })

        it('disables query when id is falsy', () => {
            ;(vacancyApi.getVacancy as any).mockResolvedValue({})

            const { result } = renderHook(() => useVacancy(0), {
                wrapper: createWrapper(),
            })

            expect(result.current.data).toBeUndefined()
            expect(vacancyApi.getVacancy).not.toHaveBeenCalled()
        })

        it('handles error when fetch fails', async () => {
            const error = new Error('Not found')
            ;(vacancyApi.getVacancy as any).mockRejectedValue(error)

            const { result } = renderHook(() => useVacancy(999), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
            })

            expect(result.current.error).toBe(error)
        })
    })

    describe('useCreateVacancy', () => {
        it('creates new vacancy', async () => {
            const vacancyData = {
                title: 'Developer',
                department: 'IT',
                deadline: new Date(),
            }
            const mockResponse = { data: { id: 1, ...vacancyData }, message: 'Created' }

            ;(vacancyApi.createVacancy as any).mockResolvedValue(mockResponse)

            const { result } = renderHook(() => useCreateVacancy(), {
                wrapper: createWrapper(),
            })

            result.current.mutate(vacancyData)

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(vacancyApi.createVacancy).toHaveBeenCalledWith(vacancyData)
        })

        it('handles creation error', async () => {
            const error = new Error('Invalid data')
            ;(vacancyApi.createVacancy as any).mockRejectedValue(error)

            const { result } = renderHook(() => useCreateVacancy(), {
                wrapper: createWrapper(),
            })

            result.current.mutate({ title: '', department: '' })

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
            })
        })
    })

    describe('useUpdateVacancy', () => {
        it('updates existing vacancy', async () => {
            const vacancyId = 1
            const updateData = { title: 'Senior Developer' }
            const mockResponse = {
                data: { id: 1, title: 'Senior Developer' },
                message: 'Updated',
            }

            ;(vacancyApi.updateVacancy as any).mockResolvedValue(mockResponse)

            const { result } = renderHook(() => useUpdateVacancy(), {
                wrapper: createWrapper(),
            })

            result.current.mutate({ id: vacancyId, data: updateData })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(vacancyApi.updateVacancy).toHaveBeenCalledWith(vacancyId, updateData)
        })
    })

    describe('useDeleteVacancy', () => {
        it('deletes vacancy by id', async () => {
            const vacancyId = 1
            const mockResponse = { data: { id: 1 }, message: 'Deleted' }

            ;(vacancyApi.deleteVacancy as any).mockResolvedValue(mockResponse)

            const { result } = renderHook(() => useDeleteVacancy(), {
                wrapper: createWrapper(),
            })

            result.current.mutate(vacancyId)

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(vacancyApi.deleteVacancy).toHaveBeenCalledWith(vacancyId)
        })

        it('handles deletion error', async () => {
            const error = new Error('Cannot delete')
            ;(vacancyApi.deleteVacancy as any).mockRejectedValue(error)

            const { result } = renderHook(() => useDeleteVacancy(), {
                wrapper: createWrapper(),
            })

            result.current.mutate(1)

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
            })
        })
    })
})
