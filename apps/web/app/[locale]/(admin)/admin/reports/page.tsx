'use client'

import * as React from 'react'
import { KPIDashboard } from '@/components/reports/kpi-dashboard'
import { 
    useDiversityReport, 
    useKPIReport, 
    useFunnelReport, 
    useApplicationsTimeReport,
    useVacancyPerformance,
    useConversionTrends 
} from '@/hooks/use-reports'
import { ReportFilters } from '@/components/reports/report-filters'
import { 
    ApplicantFunnel, 
    ApplicationsTimeLine, 
    DiversityPieChart, 
    EthnicityBarChart,
    CountyDistributionChart,
    RecruitmentVelocityChart,
    VacancyPerformanceChart,
    ConversionTrendsChart
} from '@/components/reports/charts'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, FileQuestion, RefreshCw, FileJson, FileBarChart, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReportFilters as Filters } from '@meru/shared'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ReportsPage() {
    const [filters, setFilters] = React.useState<Filters>({})
    const dashboardRef = React.useRef<HTMLDivElement>(null)

    const { 
        data: diversityData, 
        isLoading: diversityLoading, 
        refetch: refetchDiversity 
    } = useDiversityReport(filters)
    
    const { 
        data: kpiData, 
        isLoading: kpiLoading, 
        refetch: refetchKPI 
    } = useKPIReport(filters)

    const {
        data: funnelData,
        isLoading: funnelLoading,
        refetch: refetchFunnel
    } = useFunnelReport(filters)

    const {
        data: timeSeriesData,
        isLoading: timeLoading,
        refetch: refetchTime
    } = useApplicationsTimeReport(filters)

    const {
        data: vacancyData,
        isLoading: vacancyLoading,
        refetch: refetchVacancy
    } = useVacancyPerformance(filters)

    const {
        data: trendsData,
        isLoading: trendsLoading,
        refetch: refetchTrends
    } = useConversionTrends(filters)

    const isLoading = diversityLoading || kpiLoading || funnelLoading || timeLoading || vacancyLoading || trendsLoading

    const handleRefresh = () => {
        refetchDiversity()
        refetchKPI()
        refetchFunnel()
        refetchTime()
        refetchVacancy()
        refetchTrends()
    }

    const downloadPDF = async () => {
        if (!dashboardRef.current) return
        
        const loadingToast = toast.loading('Generating PDF...')
        try {
            const canvas = await html2canvas(dashboardRef.current, {
                scale: 2,
                logging: false,
                useCORS: true
            })
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF('p', 'mm', 'a4')
            const imgProps = pdf.getImageProperties(imgData)
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(`recruitment-report-${new Date().toISOString().split('T')[0]}.pdf`)
            toast.success('PDF downloaded successfully')
        } catch (error) {
            console.error('PDF Generation failed', error)
            toast.error('Failed to generate PDF')
        } finally {
            toast.dismiss(loadingToast)
        }
    }

    const exportCSV = () => {
        if (!kpiData?.data) return
        
        const kpi = kpiData.data
        const csvRows = [
            ['Metric', 'Value'],
            ['Total Vacancies', kpi.totalVacancies],
            ['Total Applications', kpi.totalApplications],
            ['Avg Time to Shortlist (Days)', kpi.timeToShortlist.avg.toFixed(1)],
            ['Avg Time to Interview (Days)', kpi.timeToInterview.avg.toFixed(1)],
            ['Average Candidate Rating', kpi.averageRating.toFixed(1)],
            [''],
            ['Gender Distribution'],
            ...Object.entries(diversityData?.data?.gender || {}).map(([k, v]) => [k, v]),
            [''],
            ['Ethnicity Distribution'],
            ...Object.entries(diversityData?.data?.ethnicity || {}).map(([k, v]) => [k, v])
        ]

        const csvContent = csvRows.map(e => e.join(",")).join("\n")
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `recruitment-stats-${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('CSV exported successfully')
    }

    const hasData = (kpiData?.data && kpiData.data.totalVacancies > 0) || (diversityData?.data && diversityData.data.totalApplicants > 0)

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
                    <p className="text-muted-foreground">Comprehensive insights into your recruitment pipeline</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2" disabled={!hasData}>
                        <FileJson className="h-4 w-4" />
                        Export CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadPDF} className="gap-2" disabled={!hasData}>
                        <FileBarChart className="h-4 w-4" />
                        Download PDF
                    </Button>
                    <Button size="sm" onClick={handleRefresh} className="gap-2">
                        <RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                        Refresh
                    </Button>
                </div>
            </div>

            <ReportFilters filters={filters} onFiltersChange={setFilters} />

            {isLoading ? (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-24 rounded-xl border bg-card animate-pulse" />
                        ))}
                    </div>
                    <div className="grid gap-4 lg:grid-cols-6">
                        <div className="lg:col-span-2 h-[400px] rounded-xl border bg-card animate-pulse" />
                        <div className="lg:col-span-4 h-[400px] rounded-xl border bg-card animate-pulse" />
                    </div>
                </div>
            ) : !hasData ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-muted/10">
                    <FileQuestion className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold">No data matches your filters</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        Try adjusting your filters or date range to see results.
                    </p>
                    <Button variant="link" onClick={() => setFilters({})}>Clear all filters</Button>
                </div>
            ) : (
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="diversity">Diversity</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                    </TabsList>

                    <div ref={dashboardRef} className="space-y-6">
                        <TabsContent value="overview" className="space-y-6 mt-0">
                            {kpiData?.data && <KPIDashboard data={kpiData.data} />}

                            <div className="grid gap-4 lg:grid-cols-6">
                                {funnelData?.data && <ApplicantFunnel data={funnelData.data} />}
                                {timeSeriesData?.data && <ApplicationsTimeLine data={timeSeriesData.data} />}
                            </div>

                            <div className="grid gap-4 lg:grid-cols-6">
                                {trendsData?.data && <ConversionTrendsChart data={trendsData.data} />}
                                {kpiData?.data?.recruitmentVelocity && <RecruitmentVelocityChart data={kpiData.data.recruitmentVelocity} />}
                            </div>
                        </TabsContent>

                        <TabsContent value="diversity" className="space-y-6 mt-0">
                            <div className="grid gap-4 lg:grid-cols-5">
                                {diversityData?.data && (
                                    <>
                                        <DiversityPieChart 
                                            title="Gender Distribution" 
                                            data={Object.entries(diversityData.data.gender).map(([name, value]) => ({ name, value }))}
                                            dataKey="value"
                                            nameKey="name"
                                        />
                                        <EthnicityBarChart data={diversityData.data.ethnicity} />
                                        <DiversityPieChart 
                                            title="Disability Status" 
                                            data={[
                                                { name: 'With Impairment', value: diversityData.data.disability.hasImpairment },
                                                { name: 'No Impairment', value: diversityData.data.disability.noImpairment },
                                                { name: 'Declined to say', value: diversityData.data.disability.preferNotToSay },
                                            ]}
                                            dataKey="value"
                                            nameKey="name"
                                        />
                                    </>
                                )}
                            </div>
                            <div className="grid gap-4 lg:grid-cols-3">
                                {diversityData?.data?.counties && <CountyDistributionChart data={diversityData.data.counties} />}
                            </div>
                        </TabsContent>

                        <TabsContent value="performance" className="space-y-6 mt-0">
                            <div className="grid gap-4">
                                {vacancyData?.data && <VacancyPerformanceChart data={vacancyData.data} />}
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            )}
        </div>
    )
}
