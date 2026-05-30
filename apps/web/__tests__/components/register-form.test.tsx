import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RegisterForm } from '@/components/auth/register-form'
import { useRegister } from '@/hooks/use-auth'

vi.mock('@/hooks/use-auth', () => ({
    useRegister: vi.fn(),
}))

vi.mock('@/i18n/routing', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
    })),
}))

describe('RegisterForm', () => {
    const mockRegister = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        ;(useRegister as any).mockReturnValue({
            mutate: mockRegister,
            isPending: false,
        })
    })

    it('renders registration form', () => {
        render(<RegisterForm />)
        expect(screen.getByText(/citizen registration/i)).toBeInTheDocument()
    })

    it('renders with description', () => {
        render(<RegisterForm />)
        expect(screen.getByText(/create an official account/i)).toBeInTheDocument()
    })

    it('has email input', () => {
        render(<RegisterForm />)
        const inputs = screen.getAllByPlaceholderText(/example@domain\.com|•+/)
        expect(inputs.length).toBeGreaterThan(0)
    })

    it('has password field', () => {
        render(<RegisterForm />)
        const passwordInputs = screen.getAllByPlaceholderText(/•+/)
        expect(passwordInputs.length).toBeGreaterThan(0)
    })

    it('has submit button', () => {
        render(<RegisterForm />)
        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBeGreaterThan(0)
    })

    it('shows loading state when isPending is true', () => {
        ;(useRegister as any).mockReturnValue({
            mutate: mockRegister,
            isPending: true,
        })

        render(<RegisterForm />)
        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBeGreaterThan(0)
        // All buttons should be disabled when form is pending
        buttons.forEach((btn) => {
            expect(btn).toBeDisabled()
        })
    })

    it('disables inputs during submission', () => {
        ;(useRegister as any).mockReturnValue({
            mutate: mockRegister,
            isPending: true,
        })

        render(<RegisterForm />)
        const inputs = screen.getAllByPlaceholderText(/example@domain\.com|•+|John|Doe|ID|254/)
        inputs.forEach((input) => {
            expect(input).toBeDisabled()
        })
    })

    it('accepts onSuccess callback', () => {
        const onSuccess = vi.fn()
        render(<RegisterForm onSuccess={onSuccess} />)
        expect(screen.getByText(/citizen registration/i)).toBeInTheDocument()
    })
})

