'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ArrowRight, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface ProfileCompletionModalProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function ProfileCompletionModal({
    open = true,
    onOpenChange,
}: ProfileCompletionModalProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(open)

    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen)
        onOpenChange?.(newOpen)
    }

    const handleViewProfile = () => {
        handleOpenChange(false)
        router.push('/dashboard/profile')
    }

    const handleContinue = () => {
        handleOpenChange(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent showCloseButton={false} className="sm:max-w-md border-t-4 border-t-primary rounded-md p-6">
                <DialogHeader className="text-center space-y-4">
                    <div className="flex justify-center mb-2">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                    </div>
                    <DialogTitle className="text-xl font-bold text-slate-900">Registration Complete</DialogTitle>
                    <DialogDescription className="text-base text-slate-600 pt-1">
                        Your citizen profile has been successfully recorded. You may now proceed to apply for available opportunities.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4 mt-2 border-t border-b border-slate-100">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex gap-3">
                        <FileText className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="font-semibold text-slate-800 text-sm">Enhance Your Profile</p>
                            <p className="text-sm text-slate-600">
                                Providing additional qualifications, professional experience, and supporting documents can strengthen your application.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-2">
                    <Button
                        variant="outline"
                        onClick={handleContinue}
                        className="rounded-md font-semibold border-slate-300"
                    >
                        Continue to Dashboard
                    </Button>
                    <Button
                        onClick={handleViewProfile}
                        className="rounded-md font-semibold gap-2"
                    >
                        View Full Profile
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
