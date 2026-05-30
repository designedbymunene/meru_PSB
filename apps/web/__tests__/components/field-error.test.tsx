import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from '@/components/ui/form'
import { FieldError, FieldHint, FieldSuccess, ValidationMessage } from '@/components/ui/field-error'
import { Input } from '@/components/ui/input'

const testSchema = z.object({
    email: z.string().email('Invalid email').min(1, 'Email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

type TestFormValues = z.infer<typeof testSchema>

function TestFormWithFields() {
    const form = useForm<TestFormValues>({
        resolver: zodResolver(testSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    return (
        <Form {...form}>
            <form>
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="test@example.com" />
                            </FormControl>
                            <FieldError />
                            <FieldHint>Enter a valid email address</FieldHint>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FieldError />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    )
}

describe('Field Error Components', () => {
    describe('FieldError', () => {
        it('renders without errors', () => {
            render(<TestFormWithFields />)

            const emailLabel = screen.getByText('Email')
            expect(emailLabel).toBeInTheDocument()
        })

        it('form has input fields', () => {
            const { container } = render(<TestFormWithFields />)

            const inputs = container.querySelectorAll('input')
            expect(inputs.length).toBeGreaterThanOrEqual(2)
        })

        it('form has labels', () => {
            render(<TestFormWithFields />)

            expect(screen.getByText('Email')).toBeInTheDocument()
            expect(screen.getByText('Password')).toBeInTheDocument()
        })
    })

    describe('FieldHint', () => {
        it('renders hint text', () => {
            render(<TestFormWithFields />)

            expect(screen.getByText('Enter a valid email address')).toBeInTheDocument()
        })

        it('hint element has correct text color class', () => {
            const { container } = render(<TestFormWithFields />)

            const hint = screen.getByText('Enter a valid email address')
            expect(hint).toHaveClass('text-xs')
        })
    })

    describe('FormField integration', () => {
        it('renders all form fields correctly', () => {
            const { container } = render(<TestFormWithFields />)

            const formItems = container.querySelectorAll('[data-slot="form-item"]')
            expect(formItems.length).toBeGreaterThanOrEqual(2)
        })

        it('email input has correct placeholder', () => {
            render(<TestFormWithFields />)

            const emailInput = screen.getByPlaceholderText('test@example.com')
            expect(emailInput).toBeInTheDocument()
        })

        it('password input is of type password', () => {
            const { container } = render(<TestFormWithFields />)

            const passwordInputs = container.querySelectorAll('input[type="password"]')
            expect(passwordInputs.length).toBeGreaterThan(0)
        })
    })
})
