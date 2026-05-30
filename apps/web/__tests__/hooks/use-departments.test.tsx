import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import {
    useDepartments,
    useCreateDepartment,
    useUpdateDepartment,
    useDepartmentsByMinistry,
} from '@/hooks/use-departments'
import * as departmentApi from '@/lib/api/departments'

vi.mock('@/lib/api/departments')
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

describe('useDepartments hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('useDepartments', () => {
        it('fetches all departments', async () => {
            const mockData = {
                data: [
                    { id: 1, name: 'IT', status: 'active' },
                    { id: 2, name: 'HR', status: 'active' },
                ],
                message: 'Success',
            }

            ;(departmentApi.getDepartments as any).mockResolvedValue(mockData)

            const { result } = renderHook(() => useDepartments(), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual(mockData)
        })

        it('uses initial data when provided', () => {
            const initialData = {
                data: [{ id: 1, name: 'IT' }],
                message: 'Success',
            }

            ;(departmentApi.getDepartments as any).mockResolvedValue(initialData)

            const { result } = renderHook(() => useDepartments(initialData), {
                wrapper: createWrapper(),
            })

            expect(result.current.data).toEqual(initialData)
        })
    })

    describe('useDepartmentsByMinistry', () => {
        it('fetches departments for ministry', async () => {
            const ministryId = 1
            const mockData = { data: [], message: 'Success' }

            ;(departmentApi.getDepartmentsByMinistry as any).mockResolvedValue(mockData)

            const { result } = renderHook(() => useDepartmentsByMinistry(ministryId), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(departmentApi.getDepartmentsByMinistry).toHaveBeenCalledWith(ministryId)
        })

        it('disables query when ministryId is not provided', () => {
            ;(departmentApi.getDepartmentsByMinistry as any).mockResolvedValue({})

            const { result } = renderHook(() => useDepartmentsByMinistry(undefined), {
                wrapper: createWrapper(),
            })

            expect(result.current.data).toBeUndefined()
            expect(departmentApi.getDepartmentsByMinistry).not.toHaveBeenCalled()
        })
    })

    describe('useCreateDepartment', () => {
        it('creates department with data', async () => {
            const departmentData = { name: 'IT', status: 'active' }
            const mockResponse = { data: { id: 1 }, message: 'Created' }

            ;(departmentApi.createDepartment as any).mockResolvedValue(mockResponse)

            const { result } = renderHook(() => useCreateDepartment(), {
                wrapper: createWrapper(),
            })

            result.current.mutate(departmentData)

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(departmentApi.createDepartment).toHaveBeenCalledWith(departmentData)
        })

        it('handles creation error', async () => {
            const error = new Error('Duplicate name')
            ;(departmentApi.createDepartment as any).mockRejectedValue(error)

            const { result } = renderHook(() => useCreateDepartment(), {
                wrapper: createWrapper(),
            })

            result.current.mutate({ name: 'IT', status: 'active' })

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
            })
        })
    })

    describe('useUpdateDepartment', () => {
        it('updates department', async () => {
            const updateData = { id: 1, data: { name: 'Information Technology' } }
            const mockResponse = { data: { id: 1 }, message: 'Updated' }

            ;(departmentApi.updateDepartment as any).mockResolvedValue(mockResponse)

            const { result } = renderHook(() => useUpdateDepartment(), {
                wrapper: createWrapper(),
            })

            result.current.mutate(updateData)

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(departmentApi.updateDepartment).toHaveBeenCalledWith(
                updateData.id,
                updateData.data
            )
        })
    })
})
