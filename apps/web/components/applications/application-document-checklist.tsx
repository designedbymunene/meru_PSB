"use client"

import { FileCheck, FileText, Upload, CheckCircle, AlertCircle, X, Plus, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"

type DocumentStatus = 'required' | 'uploaded' | 'pending' | 'approved' | 'rejected'

interface DocumentItem {
    id: string
    name: string
    description: string
    status: DocumentStatus
    required: boolean
    fileName?: string
    uploadedAt?: Date
    fileSize?: string
}

interface ApplicationDocumentChecklistProps {
    documents: DocumentItem[]
    onUpload?: (documentId: string) => void
    onRemove?: (documentId: string) => void
}

const statusConfig = {
    required: {
        icon: AlertCircle,
        bgCard: 'bg-white dark:bg-slate-900',
        borderColor: 'border-slate-200 dark:border-slate-800',
        iconBg: 'bg-slate-100 dark:bg-slate-800',
        textColor: 'text-slate-600 dark:text-slate-400',
        iconColor: 'text-slate-400',
        label: 'Required',
        progressColor: 'bg-slate-300 dark:bg-slate-700'
    },
    uploaded: {
        icon: CheckCircle,
        bgCard: 'bg-white dark:bg-slate-900',
        borderColor: 'border-blue-200 dark:border-blue-900/50',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-slate-900 dark:text-slate-100',
        iconColor: 'text-blue-500',
        label: 'Uploaded',
        progressColor: 'bg-blue-500'
    },
    pending: {
        icon: FileText,
        bgCard: 'bg-yellow-50/50 dark:bg-yellow-950/20',
        borderColor: 'border-yellow-200 dark:border-yellow-900/50',
        iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-slate-900 dark:text-slate-100',
        iconColor: 'text-yellow-500',
        label: 'Pending',
        progressColor: 'bg-yellow-500'
    },
    approved: {
        icon: CheckCircle,
        bgCard: 'bg-emerald-50/50 dark:bg-emerald-950/20',
        borderColor: 'border-emerald-200 dark:border-emerald-900/50',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
        textColor: 'text-slate-900 dark:text-slate-100',
        iconColor: 'text-emerald-500',
        label: 'Approved',
        progressColor: 'bg-emerald-500'
    },
    rejected: {
        icon: X,
        bgCard: 'bg-rose-50/50 dark:bg-rose-950/20',
        borderColor: 'border-rose-200 dark:border-rose-900/50',
        iconBg: 'bg-rose-100 dark:bg-rose-900/30',
        textColor: 'text-slate-900 dark:text-slate-100',
        iconColor: 'text-rose-500',
        label: 'Update Needed',
        progressColor: 'bg-rose-500'
    }
}

export function ApplicationDocumentChecklist({
    documents,
    onUpload,
    onRemove
}: ApplicationDocumentChecklistProps) {
    const [uploadingId, setUploadingId] = useState<string | null>(null)

    const handleUpload = (documentId: string) => {
        setUploadingId(documentId)
        setTimeout(() => {
            onUpload?.(documentId)
            setUploadingId(null)
        }, 1500)
    }

    const requiredDocs = documents.filter(d => d.required)
    const optionalDocs = documents.filter(d => !d.required)
    const completedRequired = requiredDocs.filter(d => d.status === 'uploaded' || d.status === 'pending' || d.status === 'approved').length

    return (
        <div className="space-y-5">
            {/* Header Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <FileCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Documents</h3>
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                        {completedRequired}/{requiredDocs.length} complete
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out shadow-sm"
                            style={{ width: `${(completedRequired / requiredDocs.length) * 100}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        {completedRequired === requiredDocs.length
                            ? "✓ All required documents uploaded"
                            : `${requiredDocs.length - completedRequired} more document${requiredDocs.length - completedRequired > 1 ? 's' : ''} needed`
                        }
                    </p>
                </div>
            </div>

            {/* Required Documents */}
            {requiredDocs.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Required Documents
                    </div>
                    <div className="space-y-3">
                        {requiredDocs.map((doc) => (
                            <DocumentCard
                                key={doc.id}
                                document={doc}
                                uploading={uploadingId === doc.id}
                                onUpload={() => handleUpload(doc.id)}
                                onRemove={onRemove}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Optional Documents */}
            {optionalDocs.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <Sparkles className="h-3.5 w-3.5" />
                        Optional Enhancements
                    </div>
                    <div className="space-y-3">
                        {optionalDocs.map((doc) => (
                            <DocumentCard
                                key={doc.id}
                                document={doc}
                                uploading={uploadingId === doc.id}
                                onUpload={() => handleUpload(doc.id)}
                                onRemove={onRemove}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

interface DocumentCardProps {
    document: DocumentItem
    uploading?: boolean
    onUpload: () => void
    onRemove?: (documentId: string) => void
}

function DocumentCard({ document, uploading, onUpload, onRemove }: DocumentCardProps) {
    const config = statusConfig[document.status]
    const Icon = config.icon
    const isUploaded = document.status === 'uploaded' || document.status === 'pending' || document.status === 'approved'

    return (
        <div className={cn(
            "group relative rounded-xl border-2 transition-all duration-200",
            config.bgCard,
            config.borderColor,
            "hover:shadow-md hover:border-opacity-80",
            !isUploaded && "hover:border-blue-300 dark:hover:border-blue-700"
        )}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                {/* Status Icon */}
                <div className={cn(
                    "flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-all duration-200",
                    config.iconBg
                )}>
                    {isUploaded ? (
                        uploading ? (
                            <Upload className={cn("h-5 w-5 animate-bounce", config.iconColor)} />
                        ) : (
                            <Icon className={cn("h-5 w-5", config.iconColor)} />
                        )
                    ) : (
                        <FileText className="h-5 w-5 text-slate-400" />
                    )}
                </div>

                {/* Document Info - Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Title Row */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0 flex-1">
                            <p className={cn(
                                "text-sm font-semibold mb-1",
                                config.textColor
                            )}>
                                {document.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                                {document.description}
                            </p>
                        </div>

                        {/* Status Badge */}
                        <span className={cn(
                            "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap",
                            config.iconBg,
                            config.textColor
                        )}>
                            {uploading ? (
                                <>
                                    <Upload className="h-3 w-3 animate-spin" />
                                    <span>Uploading</span>
                                </>
                            ) : (
                                <>
                                    <Icon className="h-3 w-3" />
                                    <span>{config.label}</span>
                                </>
                            )}
                        </span>
                    </div>

                    {/* File Info Row - Only show when file is uploaded */}
                    {document.fileName && (
                        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate flex-1">
                                {document.fileName}
                                {document.fileSize && (
                                    <span className="ml-2 text-slate-500 dark:text-slate-500">
                                        • {document.fileSize}
                                    </span>
                                )}
                            </p>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <div className="flex items-center shrink-0">
                    {isUploaded && onRemove ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(document.id)}
                            className="h-9 w-9 p-0 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 shrink-0"
                            title="Remove document"
                        >
                            <X className="h-4 w-4 text-slate-400 hover:text-rose-500" />
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onUpload}
                            disabled={uploading}
                            className={cn(
                                "h-9 px-4 rounded-lg gap-2 transition-all duration-200 shrink-0",
                                "bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30",
                                "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400",
                                "hover:border-blue-300 dark:hover:border-blue-700 border border-transparent",
                                uploading && "cursor-not-allowed opacity-50"
                            )}
                            title="Upload document"
                        >
                            {uploading ? (
                                <>
                                    <Upload className="h-4 w-4 animate-spin" />
                                    <span className="text-xs font-medium">Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    <span className="text-xs font-medium">Upload</span>
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Progress indicator for uploading state */}
            {uploading && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 rounded-b-xl overflow-hidden">
                    <div className="h-full bg-blue-500 animate-pulse" style={{ width: '60%' }} />
                </div>
            )}
        </div>
    )
}
