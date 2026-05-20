import { RequireAuth } from '@/components/auth/require-auth'

export default function MyInterviewsPage() {
    return (
        <RequireAuth allowedRoles={['admin', 'applicant']}>
            <div className="w-full py-8 space-y-10">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        My Interviews
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl">
                        View interviews where you are assigned as a panel member and submit your assessments.
                    </p>
                </div>

                <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                    <span className="text-muted-foreground">No interviews scheduled.</span>
                </div>
            </div>
        </RequireAuth>
    )
}
