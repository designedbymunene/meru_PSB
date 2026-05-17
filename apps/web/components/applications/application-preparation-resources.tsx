"use client"

import { BookOpen, Video, FileText, Download, ExternalLink, Clock, Users, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ResourceItem {
    id: string
    type: 'guide' | 'video' | 'document' | 'checklist'
    title: string
    description: string
    duration?: string
    url?: string
    downloadUrl?: string
    icon?: React.ElementType
}

interface PreparationResourcesProps {
    vacancyTitle?: string
    department?: string
    resources?: ResourceItem[]
}

const defaultResources: ResourceItem[] = [
    {
        id: '1',
        type: 'guide',
        title: 'Interview Preparation Guide',
        description: 'Comprehensive guide to help you prepare for your interview',
        duration: '15 min read',
        icon: BookOpen
    },
    {
        id: '2',
        type: 'video',
        title: 'What to Expect: Interview Process',
        description: 'Overview of our interview process and tips for success',
        duration: '10 min watch',
        icon: Video
    },
    {
        id: '3',
        type: 'checklist',
        title: 'Interview Day Checklist',
        description: 'Everything you need to bring and prepare for interview day',
        duration: '5 min read',
        icon: FileText
    },
    {
        id: '4',
        type: 'document',
        title: 'Company Culture Handbook',
        description: 'Learn about our values, culture, and what makes us unique',
        duration: '20 min read',
        icon: Briefcase
    }
]

const resourceConfig = {
    guide: {
        icon: BookOpen,
        bgColor: 'bg-blue-50 dark:bg-blue-950/30',
        borderColor: 'border-blue-200 dark:border-blue-900/50',
        textColor: 'text-blue-700 dark:text-blue-300',
        iconColor: 'text-blue-500'
    },
    video: {
        icon: Video,
        bgColor: 'bg-purple-50 dark:bg-purple-950/30',
        borderColor: 'border-purple-200 dark:border-purple-900/50',
        textColor: 'text-purple-700 dark:text-purple-300',
        iconColor: 'text-purple-500'
    },
    document: {
        icon: FileText,
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
        borderColor: 'border-emerald-200 dark:border-emerald-900/50',
        textColor: 'text-emerald-700 dark:text-emerald-300',
        iconColor: 'text-emerald-500'
    },
    checklist: {
        icon: FileText,
        bgColor: 'bg-orange-50 dark:bg-orange-950/30',
        borderColor: 'border-orange-200 dark:border-orange-900/50',
        textColor: 'text-orange-700 dark:text-orange-300',
        iconColor: 'text-orange-500'
    }
}

export function ApplicationPreparationResources({
    vacancyTitle,
    department,
    resources = defaultResources
}: PreparationResourcesProps) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        Interview Preparation
                    </h3>
                </div>
                {vacancyTitle && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Resources to help you prepare for your <span className="font-medium text-slate-900 dark:text-slate-100">{vacancyTitle}</span> interview
                        {department && <span> in <span className="font-medium text-slate-900 dark:text-slate-100">{department}</span></span>}
                    </p>
                )}
            </div>

            {/* Resources List */}
            <div className="space-y-3">
                {resources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                ))}
            </div>

            {/* Tips Section */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
                <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                            Pro Tips for Success
                        </h4>
                        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1.5">
                            <li>• Research our company and the role beforehand</li>
                            <li>• Prepare questions to ask your interviewers</li>
                            <li>• Practice with mock interviews if possible</li>
                            <li>• Bring copies of your CV and portfolio</li>
                            <li>• Arrive 10-15 minutes early</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface ResourceCardProps {
    resource: ResourceItem
}

function ResourceCard({ resource }: ResourceCardProps) {
    const config = resourceConfig[resource.type]
    const Icon = resource.icon || config.icon

    return (
        <div className={cn(
            "flex items-start gap-3 p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
            config.bgColor,
            config.borderColor
        )}>
            {/* Icon */}
            <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
                config.iconColor
            )}>
                <Icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0 flex-1">
                        <p className={cn(
                            "text-sm font-semibold",
                            config.textColor
                        )}>
                            {resource.title}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {resource.description}
                        </p>
                    </div>
                </div>

                {/* Duration & Actions */}
                <div className="flex items-center justify-between mt-2">
                    {resource.duration && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span>{resource.duration}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 shrink-0 ml-auto">
                        {resource.downloadUrl && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => window.open(resource.downloadUrl, '_blank')}
                            >
                                <Download className="h-3.5 w-3.5 mr-1" />
                                Download
                            </Button>
                        )}
                        {resource.url && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => window.open(resource.url, '_blank')}
                            >
                                View
                                <ExternalLink className="h-3.5 w-3.5 ml-1" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
