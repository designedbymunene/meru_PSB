'use client'

import { useParams } from 'next/navigation'
import { useRouter } from '@/i18n/routing'
import { ArrowLeftIcon, BookOpen, CheckCircle2, FileText, Users, Award, Briefcase, AlertCircle, HelpCircle, Sparkles, ShieldCheck, Clock, Check } from 'lucide-react'
import { useApplication } from '@/hooks/use-applications'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ApplicationPreparationResources } from '@/components/applications/application-preparation-resources'
import { RequireAuth } from '@/components/auth/require-auth'
import { cn } from '@/lib/utils'

export default function InterviewPrepGuidePage() {
    return (
        <RequireAuth allowedRoles={['applicant']}>
            <InterviewPrepGuideContent />
        </RequireAuth>
    )
}

function InterviewPrepGuideContent() {
    const params = useParams()
    const router = useRouter()
    const id = Number(params?.id)

    const { data: applicationData, isLoading, error } = useApplication(id)

    if (isLoading) {
        return (
             <div className="min-h-screen bg-slate-50/50 dark:bg-[#0a0c10] px-8 md:px-12 lg:px-16 py-8">
                <div className="max-w-[1400px] mx-auto space-y-6">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        )
    }

    if (error || !applicationData?.data) {
        return (
             <div className="min-h-screen bg-slate-50/50 dark:bg-[#0a0c10] flex items-center justify-center w-full px-8 md:px-12 lg:px-16 text-slate-700 dark:text-slate-200">
                 <div className="text-center space-y-4 max-w-md bg-white dark:bg-[#11141d] p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
                     <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                     <div className="text-red-500 font-bold text-lg">Error loading guide</div>
                     <p className="text-sm text-slate-500 dark:text-slate-400">
                         We couldn't load your application details for the preparation guide.
                     </p>
                     <Button variant="outline" onClick={() => router.back()} className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    const { data: application } = applicationData
    const vacancyTitle = application.vacancy?.title || 'Your Interview'
    const departmentName = (application.vacancy as any)?.department?.name || 'Public Service Board'

    return (
         <div className="min-h-screen bg-slate-50/50 dark:bg-[#0a0c10] text-slate-700 dark:text-slate-200 pb-20">
             {/* Top Navigation Bar */}
             <div className="sticky top-0 z-20 bg-white/80 dark:bg-[#0a0c10]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50">
                 <div className="w-full px-4 md:px-8 lg:px-12 py-4 flex items-center justify-between">
                     <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => router.back()}
                         className="gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to Application
                    </Button>
                    <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
                        <Sparkles className="h-4 w-4 text-blue-400" />
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Candidate Success Portal</span>
                    </div>
                </div>
            </div>

            {/* Immersive Premium Header */}
             <div className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/20 dark:from-blue-950/20 via-slate-50/50 dark:via-[#0a0c10] to-slate-50/50 dark:to-[#0a0c10] py-12 md:py-16">
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/5 dark:from-blue-900/10 via-transparent to-transparent pointer-events-none" />
                 <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 relative z-10">
                     <div className="max-w-3xl space-y-4">
                         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-green-50 dark:bg-green-500/20 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-widest">
                             <CheckCircle2 className="h-3.5 w-3.5" />
                             Shortlisted Candidate Guide
                         </div>
                         <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                             Master Your Interview at Meru County
                         </h1>
                         <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                             Comprehensive preparation resources, mandatory documentation checklists, and pro tips tailored for your upcoming <span className="text-slate-900 dark:text-white font-semibold">{vacancyTitle}</span> interview in the <span className="text-blue-600 dark:text-blue-400 font-semibold">{departmentName}</span>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Tabs */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 mt-8">
                <Tabs defaultValue="checklist" className="w-full space-y-8">
                     <TabsList className="bg-slate-100 dark:bg-[#11141d] border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl gap-2 grid grid-cols-1 md:grid-cols-3 w-full max-w-3xl h-auto">
                         <TabsTrigger value="checklist" className="py-3 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white font-bold text-xs md:text-sm gap-2 transition-all text-slate-600 dark:text-slate-400">
                             <FileText className="h-4 w-4" />
                             Mandatory Checklist
                         </TabsTrigger>
                         <TabsTrigger value="values" className="py-3 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white font-bold text-xs md:text-sm gap-2 transition-all text-slate-600 dark:text-slate-400">
                             <Award className="h-4 w-4" />
                             Core Values
                         </TabsTrigger>
                         <TabsTrigger value="etiquette" className="py-3 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white font-bold text-xs md:text-sm gap-2 transition-all text-slate-600 dark:text-slate-400">
                            <Users className="h-4 w-4" />
                            Etiquette & Tips
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 2: Mandatory Checklist */}
                    <TabsContent value="checklist" className="space-y-8 animate-in fade-in-50 duration-300">
                        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-sm dark:shadow-2xl dark:shadow-black/40 space-y-8">
                            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                                        Interview Day Document Checklist
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Please bring original copies and one set of photocopies for all the documents listed below. Failure to produce mandatory clearance documents may result in disqualification.
                                    </p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Academic & Identity */}
                                <div className="bg-slate-50 dark:bg-[#0f1117] border border-slate-200 dark:border-slate-800/60 rounded-xl p-6 space-y-4">
                                    <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        Identification & Academic
                                    </h3>
                                    <ul className="space-y-3">
                                        {[
                                            "Original National Identity Card or valid Passport",
                                            "Original Academic Certificates (KCSE, Degree/Diploma)",
                                            "Official Academic Transcripts",
                                            "Professional Body Registration Certificates (if applicable)",
                                            "Valid Annual Practicing License (where applicable)"
                                        ].map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                                                <div className="mt-0.5 p-1 rounded-md bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shrink-0">
                                                    <Check className="h-3.5 w-3.5" />
                                                </div>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Chapter Six Clearances */}
                                <div className="bg-slate-50 dark:bg-[#0f1117] border border-slate-200 dark:border-slate-800/60 rounded-xl p-6 space-y-4">
                                    <h3 className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4" />
                                        Chapter 6 Compliance (Constitution of Kenya)
                                    </h3>
                                    <ul className="space-y-3">
                                        {[
                                            "Valid Certificate of Good Conduct from Directorate of Criminal Investigations (DCI)",
                                            "Clearance Certificate from Higher Education Loans Board (HELB)",
                                            "Tax Compliance Certificate from Kenya Revenue Authority (KRA)",
                                            "Clearance from Ethics and Anti-Corruption Commission (EACC)",
                                            "Clearance Certificate from an approved Credit Reference Bureau (CRB)"
                                        ].map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                                                <div className="mt-0.5 p-1 rounded-md bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20 shrink-0">
                                                    <Check className="h-3.5 w-3.5" />
                                                </div>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                                <div className="text-xs text-orange-800 dark:text-orange-200 leading-relaxed">
                                    <span className="font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide block mb-1">Important Notice</span>
                                    Ensure all documents are arranged neatly in a clear folder or document wallet. Presenting forged documents is a criminal offense under the laws of Kenya.
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab 3: Core Values */}
                    <TabsContent value="values" className="space-y-8 animate-in fade-in-50 duration-300">
                        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-sm dark:shadow-2xl dark:shadow-black/40 space-y-8">
                            <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                                    <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    Meru County Public Service Core Values
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                                    As an aspiring public servant, you will be evaluated on your alignment with the core values and principles of public service as outlined in Article 232 of the Constitution.
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                {[
                                    {
                                        title: "Integrity & Honesty",
                                        desc: "Maintaining the highest standards of moral and ethical conduct, being transparent in decision-making, and avoiding any conflict of interest.",
                                        color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20"
                                    },
                                    {
                                        title: "Professionalism",
                                        desc: "Demonstrating competence, excellence, and dedication in service delivery while continuously improving skills and maintaining workplace decorum.",
                                        color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20"
                                    },
                                    {
                                        title: "Transparency & Accountability",
                                        desc: "Taking responsibility for decisions, actions, and outcomes while ensuring open communication with the public and relevant stakeholders.",
                                        color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20"
                                    },
                                    {
                                        title: "Inclusivity & Citizen Focus",
                                        desc: "Serving all citizens with dignity, respect, and fairness without discrimination based on gender, ethnicity, religion, or social status.",
                                        color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20"
                                    }
                                ].map((val, idx) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-[#0f1117] border border-slate-200 dark:border-slate-800/60 rounded-xl p-6 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                                        <div className={cn("px-3 py-1.5 rounded-lg border w-fit font-bold text-xs uppercase tracking-wider", val.color)}>
                                            {val.title}
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {val.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab 4: Etiquette & Tips */}
                    <TabsContent value="etiquette" className="space-y-8 animate-in fade-in-50 duration-300">
                        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-sm dark:shadow-2xl dark:shadow-black/40 space-y-8">
                            <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    Interview Etiquette & Panel Guidance
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                                    Mastering the nuances of a panel interview is key to leaving a memorable and professional impression on the Public Service Board commissioners.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-slate-50 dark:bg-[#0f1117] border border-slate-200 dark:border-slate-800/60 rounded-xl p-6 space-y-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                                        1
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Punctuality is Key</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Arrive at least 30 minutes before your scheduled interview time. This allows you to undergo security screening, organize your documents, and calm your nerves.
                                    </p>
                                </div>

                                <div className="bg-slate-50 dark:bg-[#0f1117] border border-slate-200 dark:border-slate-800/60 rounded-xl p-6 space-y-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-lg">
                                        2
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Professional Attire</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Dress in formal, conservative business attire. A neat, professional appearance reflects your respect for the Board and the seriousness with which you view the role.
                                    </p>
                                </div>

                                <div className="bg-slate-50 dark:bg-[#0f1117] border border-slate-200 dark:border-slate-800/60 rounded-xl p-6 space-y-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-lg">
                                        3
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Engaging the Panel</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Maintain good eye contact with all panel members, not just the person who asked the question. Speak clearly, listen carefully, and structure your answers concisely.
                                    </p>
                                </div>
                            </div>

                            {/* FAQ / Pro Tips */}
                            <div className="bg-slate-50 dark:bg-[#0f1117] border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                    <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    Frequently Asked Questions
                                </h3>
                                <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
                                    <div className="space-y-1 pb-3 border-b border-slate-200 dark:border-slate-800/60">
                                        <p className="font-bold text-slate-900 dark:text-white">How long does the interview typically take?</p>
                                        <p className="text-slate-500 dark:text-slate-400">Interviews generally last between 20 to 45 minutes depending on the seniority and technical requirements of the position.</p>
                                    </div>
                                    <div className="space-y-1 pb-3 border-b border-slate-200 dark:border-slate-800/60">
                                        <p className="font-bold text-slate-900 dark:text-white">Can I present digital copies of my certificates?</p>
                                        <p className="text-slate-500 dark:text-slate-400">No. The Board requires physical inspection of all original physical certificates alongside a set of photocopies for verification.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-slate-900 dark:text-white">When will I know the outcome of the interview?</p>
                                        <p className="text-slate-500 dark:text-slate-400">Official communication regarding successful candidates is typically made within 14 to 30 days after the conclusion of all interviews for that specific vacancy.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
