import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DepartmentForm } from '@/components/admin/department-form'
import { useCreateDepartment, useUpdateDepartment } from '@/hooks/use-departments'

vi.mock('@/hooks/use-departments', () => ({
    useCreateDepartment: vi.fn(),
    useUpdateDepartment: vi.fn(),
}))

vi.mock('@/i18n/routing', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
    })),
}))

describe('DepartmentForm', () => {
    const mockCreate = vi.fn()
    const mockUpdate = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        ;(useCreateDepartment as any).mockReturnValue({
            mutate: mockCreate,
            isPending: false,
        })
        ;(useUpdateDepartment as any).mockReturnValue({
            mutate: mockUpdate,
            isPending: false,
        })
    })

    describe('Create Mode', () => {
        it('renders form in create mode', () => {
            render(<DepartmentForm mode="create" />)

            const inputs = screen.getAllByRole('textbox')
            expect(inputs.length).toBeGreaterThan(0)
        })

        it('has submit button in create mode', () => {
            render(<DepartmentForm mode="create" />)

            const buttons = screen.getAllByRole('button')
            expect(buttons.length).toBeGreaterThan(0)
        })

        it('disables submit button during submission', () => {
            ;(useCreateDepartment as any).mockReturnValue({
                mutate: mockCreate,
                isPending: true,
            })

            render(<DepartmentForm mode="create" />)

            const buttons = screen.getAllByRole('button')
            const lastButton = buttons[buttons.length - 1]
            expect(lastButton).toBeDisabled()
        })
    })

    describe('Edit Mode', () => {
        const mockDepartment = {
            id: 1,
            name: 'IT Department',
            description: 'Information Technology',
            status: 'active' as const,
        }

        it('renders form with initial data in edit mode', () => {
            render(<DepartmentForm mode="edit" initialData={mockDepartment} />)

            expect(screen.getByDisplayValue('IT Department')).toBeInTheDocument()
            expect(screen.getByDisplayValue('Information Technology')).toBeInTheDocument()
        })

        it('form exists with correct mode prop', () => {
            render(<DepartmentForm mode="edit" initialData={mockDepartment} />)

            const inputs = screen.getAllByRole('textbox')
            expect(inputs.length).toBeGreaterThan(0)
        })
    })

    describe('Validation', () => {
        it('form renders with necessary structure', () => {
            render(<DepartmentForm mode="create" />)

            const inputs = screen.getAllByRole('textbox')
            expect(inputs.length).toBeGreaterThanOrEqual(1)
            const buttons = screen.getAllByRole('button')
            expect(buttons.length).toBeGreaterThan(0)
        })
    })
})
