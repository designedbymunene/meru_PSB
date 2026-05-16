import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth'

export const metadata: Metadata = {
    title: 'Reset Password | Meru County Recruitment Portal',
    description: 'Reset your password for the Meru County Recruitment Portal',
}

export default function ForgotPasswordPage() {
    return <ForgotPasswordForm />
}
