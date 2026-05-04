'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth'
import { MultiStepProfileForm } from '@/components/forms'

export default function RegisterPage() {
    const [step, setStep] = useState<'account' | 'profile'>('account')
    const router = useRouter()

    const handleAccountCreated = () => {
        // Move to profile creation step
        setStep('profile')
    }

    const handleProfileCompleted = () => {
        // Profile created successfully, redirect to dashboard with modal flag
        router.push('/dashboard?showProfileModal=true')
    }

    if (step === 'account') {
        return <RegisterForm onSuccess={handleAccountCreated} />
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <MultiStepProfileForm onComplete={handleProfileCompleted} />
        </div>
    )
}

