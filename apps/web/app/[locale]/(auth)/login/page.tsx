import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth'

export const metadata: Metadata = {
    title: 'Sign In | Meru County Recruitment Portal',
    description: 'Sign in to access the Meru County Recruitment Portal',
}

export default function LoginPage() {
    return <LoginForm />
}
