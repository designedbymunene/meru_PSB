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
            <DialogContent showCloseButton={false} className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <DialogTitle className="text-2xl">Profile Completed!</DialogTitle>
                    <DialogDescription className="pt-2">
                        Your profile has been successfully created. You're all set to start applying for positions.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="p-4 bg-muted rounded-lg flex gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="font-medium text-sm">Complete More Information</p>
                            <p className="text-xs text-muted-foreground">
                                Add qualifications, professional details, and training courses to strengthen your applications.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={handleContinue}
                        className="gap-2"
                    >
                        Continue to Dashboard
                    </Button>
                    <Button
                        onClick={handleViewProfile}
                        className="gap-2"
                    >
                        View Profile
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
