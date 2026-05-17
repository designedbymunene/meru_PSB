"use client"

import Link from "next/link"
import { 
    PlusCircle, 
    Building2, 
    Users, 
    FileText, 
    Settings,
    LayoutGrid,
    Scale,
    BarChart3
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function QuickActions() {
    const actions = [
        {
            title: "Post New Vacancy",
            description: "Create a new job advertisement",
            href: "/admin/vacancies", // Assuming /new or similar, but following existing patterns
            icon: PlusCircle,
            color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
        },
        {
            title: "Board Pack Generator",
            description: "Prepare documents for board review",
            href: "/admin/board",
            icon: Scale,
            color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20",
        },
        {
            title: "Reports & Analytics",
            description: "Recruitment KPIs and diversity metrics",
            href: "/admin/reports",
            icon: BarChart3,
            color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20",
        },
        {
            title: "Manage Departments",
            description: "Add or edit county departments",
            href: "/admin/departments",
            icon: Building2,
            color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
        },
        {
            title: "Applicant Profiles",
            description: "Search and view all applicants",
            href: "/admin/profiles",
            icon: Users,
            color: "text-green-600 bg-green-50 dark:bg-green-900/20",
        },
        {
            title: "Review Applications",
            description: "Process pending applications",
            href: "/admin/applications",
            icon: FileText,
            color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
        },
        {
            title: "Job Groups",
            description: "Configure salary scales & levels",
            href: "/admin/job-groups",
            icon: LayoutGrid,
            color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
        },
        {
            title: "System Settings",
            description: "Portal configuration & audit logs",
            href: "/admin/settings",
            icon: Settings,
            color: "text-slate-600 bg-slate-50 dark:bg-slate-900/20",
        }
    ]

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Commonly performed administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {actions.map((action) => (
                        <Button
                            key={action.title}
                            variant="outline"
                            className="h-auto p-4 flex flex-col items-start gap-2 text-left hover:bg-slate-50 dark:hover:bg-slate-900 transition-all border-slate-200 dark:border-slate-800 rounded-2xl"
                            asChild
                        >
                            <Link href={action.href}>
                                <div className={`p-2 rounded-xl ${action.color}`}>
                                    <action.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{action.title}</p>
                                    <p className="text-xs text-muted-foreground font-medium">{action.description}</p>
                                </div>
                            </Link>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
