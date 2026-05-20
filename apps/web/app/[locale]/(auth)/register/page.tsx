'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth'
import { MultiStepProfileForm } from '@/components/forms'
import type { RegisterInput } from '@meru/shared'

export default function RegisterPage() {
    const [step, setStep] = useState<'account' | 'profile'>('account')
    const [registrationData, setRegistrationData] = useState<RegisterInput | null>(null)
    const router = useRouter()

    const handleAccountCreated = (data: RegisterInput) => {
        setRegistrationData(data)
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
        <div className="w-full max-w-5xl mx-auto px-4">
            <MultiStepProfileForm
                onComplete={handleProfileCompleted}
                initialRegistrationData={registrationData || undefined}
            />
        </div>
    )
}
