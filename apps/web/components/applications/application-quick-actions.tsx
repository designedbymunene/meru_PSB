"use client"

import { Share2, Printer, MessageCircle, FileQuestion, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ApplicationQuickActionsProps {
    applicationId: string
    vacancyTitle?: string
    onShare?: () => void
    onPrint?: () => void
    onContactSupport?: () => void
    onGetHelp?: () => void
}

export function ApplicationQuickActions({
    applicationId,
    vacancyTitle,
    onShare,
    onPrint,
    onContactSupport,
    onGetHelp
}: ApplicationQuickActionsProps) {
    const handleShare = () => {
        if (navigator.share && vacancyTitle) {
            navigator.share({
                title: `Application for ${vacancyTitle}`,
                text: `Check out my application progress for ${vacancyTitle}`,
                url: window.location.href
            }).catch(() => {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(window.location.href)
                onShare?.()
            })
        } else {
            // Copy to clipboard
            navigator.clipboard.writeText(window.location.href)
            onShare?.()
        }
    }

    const handlePrint = () => {
        window.print()
        onPrint?.()
    }

    return (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        Quick Actions
                        <Share2 className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={handleShare} className="gap-2 cursor-pointer">
                        <Share2 className="h-4 w-4 text-slate-500" />
                        <div>
                            <p className="font-medium">Share Application</p>
                            <p className="text-xs text-slate-500">Copy link or share</p>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handlePrint} className="gap-2 cursor-pointer">
                        <Printer className="h-4 w-4 text-slate-500" />
                        <div>
                            <p className="font-medium">Print</p>
                            <p className="text-xs text-slate-500">Print this page</p>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={onContactSupport} className="gap-2 cursor-pointer">
                        <MessageCircle className="h-4 w-4 text-slate-500" />
                        <div>
                            <p className="font-medium">Contact Support</p>
                            <p className="text-xs text-slate-500">Get help with your application</p>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={onGetHelp} className="gap-2 cursor-pointer">
                        <FileQuestion className="h-4 w-4 text-slate-500" />
                        <div>
                            <p className="font-medium">FAQs</p>
                            <p className="text-xs text-slate-500">Frequently asked questions</p>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

// Individual action buttons for use in different contexts
export function QuickActionButtons({
    onShare,
    onPrint,
    onContact
}: {
    onShare?: () => void
    onPrint?: () => void
    onContact?: () => void
}) {
    return (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={onShare}
                className="gap-2"
            >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={onPrint}
                className="gap-2"
            >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={onContact}
                className="gap-2"
            >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Get Help</span>
            </Button>
        </div>
    )
}
