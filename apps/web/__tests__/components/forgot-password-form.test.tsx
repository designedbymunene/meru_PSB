import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { useRequestPasswordReset, useResetPassword } from '@/hooks/use-auth'

vi.mock('@/hooks/use-auth', () => ({
    useRequestPasswordReset: vi.fn(),
    useResetPassword: vi.fn(),
}))

describe('ForgotPasswordForm', () => {
    const mockRequestReset = vi.fn()
    const mockResetPassword = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        ;(useRequestPasswordReset as any).mockReturnValue({
            mutate: mockRequestReset,
            isPending: false,
        })
        ;(useResetPassword as any).mockReturnValue({
            mutate: mockResetPassword,
            isPending: false,
        })
    })

    it('renders form', () => {
        render(<ForgotPasswordForm />)
        const inputs = screen.getAllByPlaceholderText(/example\.com/i)
        expect(inputs.length).toBeGreaterThan(0)
    })

    it('has submit button', () => {
        render(<ForgotPasswordForm />)
        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBeGreaterThan(0)
    })

    it('disables button during submission', () => {
        ;(useRequestPasswordReset as any).mockReturnValue({
            mutate: mockRequestReset,
            isPending: true,
        })
        ;(useResetPassword as any).mockReturnValue({
            mutate: mockResetPassword,
            isPending: true,
        })

        render(<ForgotPasswordForm />)
        const buttons = screen.getAllByRole('button')
        buttons.forEach((btn) => {
            expect(btn).toBeDisabled()
        })
    })

    it('renders with proper input fields', () => {
        render(<ForgotPasswordForm />)
        const inputs = screen.getAllByDisplayValue('')
        expect(inputs.length).toBeGreaterThan(0)
    })
})
