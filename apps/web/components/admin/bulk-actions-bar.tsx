"use client"

import { CheckCircle, XCircle, Clock, MoreHorizontal, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface BulkActionsBarProps {
    selectedCount: number
    onAction: (action: string) => void
    isPending?: boolean
}

export function BulkActionsBar({ selectedCount, onAction, isPending }: BulkActionsBarProps) {
    if (selectedCount === 0) return null

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-8 min-w-[500px]">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold">
                        {selectedCount}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold">Applications Selected</span>
                        <span className="text-[10px] text-slate-400 uppercase font-medium tracking-wider">Bulk Actions Available</span>
                    </div>
                </div>

                <div className="h-8 w-px bg-slate-800" />

                <div className="flex items-center gap-3">
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-10 px-4 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 gap-2 font-bold transition-all"
                        onClick={() => onAction('shortlisted')}
                        disabled={isPending}
                    >
                        <CheckCircle className="h-4 w-4" />
                        Shortlist
                    </Button>

                    <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-10 px-4 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 gap-2 font-bold transition-all"
                        onClick={() => onAction('rejected')}
                        disabled={isPending}
                    >
                        <XCircle className="h-4 w-4" />
                        Reject
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-10 px-4 rounded-xl hover:bg-slate-800 gap-2 font-bold transition-all"
                                disabled={isPending}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                                More
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 text-slate-200">
                            <DropdownMenuLabel>Change Status To</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-800" />
                            <DropdownMenuItem 
                                className="focus:bg-slate-800 focus:text-white cursor-pointer"
                                onClick={() => onAction('under_review')}
                            >
                                <Clock className="mr-2 h-4 w-4" />
                                Under Review
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="focus:bg-slate-800 focus:text-white cursor-pointer"
                                onClick={() => onAction('interviewed')}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Interviewed
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-800" />
                            <DropdownMenuItem 
                                className="text-rose-400 focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer"
                                onClick={() => onAction('rejected')}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Bulk Reject
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="h-8 w-px bg-slate-800 ml-auto" />

                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest"
                    onClick={() => onAction('clear')}
                    disabled={isPending}
                >
                    Cancel
                </Button>
            </div>
        </div>
    )
}
