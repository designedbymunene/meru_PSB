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
    SubCountyDistributionChart,
    WardDistributionChart,
    RecruitmentVelocityChart,
    VacancyPerformanceChart,
    ConversionTrendsChart
} from '@/components/reports/charts'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, FileQuestion, RefreshCw, FileJson, Filter, Users, Activity, HeartHandshake, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReportFilters as Filters } from '@meru/shared'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ReportsPage() {
    const [filters, setFilters] = React.useState<Filters>({})
    const [geoTab, setGeoTab] = React.useState<'counties' | 'subcounties' | 'wards'>('counties')

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

                    <div className="space-y-6">
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
                            {diversityData?.data && (
                                <React.Fragment>
                                    {/* Demographic KPI Summary Cards */}
                                    {(() => {
                                        const total = diversityData.data.totalApplicants || 0;
                                        const female = diversityData.data.gender?.Female || 0;
                                        const male = diversityData.data.gender?.Male || 0;
                                        const femalePercentage = total > 0 ? Math.round((female / total) * 100) : 0;
                                        const malePercentage = total > 0 ? Math.round((male / total) * 100) : 0;
                                        
                                        const impairmentCount = diversityData.data.disability?.hasImpairment || 0;
                                        const impairmentRate = total > 0 ? ((impairmentCount / total) * 100).toFixed(1) : '0';
                                        
                                        const countyCounts = diversityData.data.counties || {};
                                        const meruKey = Object.keys(countyCounts).find(k => k.toLowerCase().includes('meru'));
                                        const meruCount = meruKey ? countyCounts[meruKey] : 0;
                                        const meruRate = total > 0 ? Math.round((meruCount / total) * 100) : 0;

                                        return (
                                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                                <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                                                    <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-primary/5 blur-2xl" />
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-muted-foreground">Total Analyzed</span>
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                            <Users className="h-5 w-5" />
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <h3 className="text-3xl font-extrabold tracking-tight">{total.toLocaleString()}</h3>
                                                        <p className="mt-1 text-xs text-muted-foreground">Unique applicants in selected period</p>
                                                    </div>
                                                </div>

                                                <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                                                    <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-pink-500/5 blur-2xl" />
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-muted-foreground">Gender Split</span>
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500">
                                                            <Activity className="h-5 w-5" />
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <h3 className="text-2xl font-extrabold tracking-tight flex items-baseline gap-1">
                                                            <span>{femalePercentage}%</span>
                                                            <span className="text-xs font-semibold text-muted-foreground">Female</span>
                                                            <span className="text-sm font-normal text-border mx-1">|</span>
                                                            <span>{malePercentage}%</span>
                                                            <span className="text-xs font-semibold text-muted-foreground">Male</span>
                                                        </h3>
                                                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted flex">
                                                            <div 
                                                                className="bg-gradient-to-r from-pink-400 to-pink-500" 
                                                                style={{ width: `${femalePercentage}%` }} 
                                                            />
                                                            <div 
                                                                className="bg-gradient-to-r from-blue-400 to-blue-500" 
                                                                style={{ width: `${malePercentage}%` }} 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                                                    <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-amber-500/5 blur-2xl" />
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-muted-foreground">PwD Inclusion</span>
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500">
                                                            <HeartHandshake className="h-5 w-5" />
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <h3 className="text-3xl font-extrabold tracking-tight">{impairmentRate}%</h3>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {impairmentCount} candidates with impairments
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                                                    <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-emerald-500/5 blur-2xl" />
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-muted-foreground">Meru Representation</span>
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-500">
                                                            <Globe className="h-5 w-5" />
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <h3 className="text-3xl font-extrabold tracking-tight">{meruRate}%</h3>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {meruCount} candidates from Meru County
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Primary Demographics Grid */}
                                    <div className="grid gap-4 lg:grid-cols-5">
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
                                    </div>

                                    {/* Geographic Distribution section with sub-tabs */}
                                    <div className="space-y-4">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6 mb-2 border-b border-border/50 pb-4">
                                            <div>
                                                <h3 className="text-lg font-bold tracking-tight">Geographic & Location Distribution</h3>
                                                <p className="text-sm text-muted-foreground">Analyze candidate volumes by county, constituency, or ward level</p>
                                            </div>
                                            <div className="flex bg-muted/80 backdrop-blur-sm p-1 rounded-xl w-fit border border-border/50 shadow-sm">
                                                <button
                                                    onClick={() => setGeoTab('counties')}
                                                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                                        geoTab === 'counties' 
                                                            ? 'bg-background text-foreground shadow-sm' 
                                                            : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    All Counties
                                                </button>
                                                <button
                                                    onClick={() => setGeoTab('subcounties')}
                                                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                                        geoTab === 'subcounties' 
                                                            ? 'bg-background text-foreground shadow-sm' 
                                                            : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    Meru Sub-Counties
                                                </button>
                                                <button
                                                    onClick={() => setGeoTab('wards')}
                                                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                                        geoTab === 'wards' 
                                                            ? 'bg-background text-foreground shadow-sm' 
                                                            : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    Meru Wards
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid gap-4">
                                            {geoTab === 'counties' && diversityData.data.counties && (
                                                <CountyDistributionChart data={diversityData.data.counties} />
                                            )}
                                            {geoTab === 'subcounties' && diversityData.data.meruSubCounties && (
                                                <SubCountyDistributionChart data={diversityData.data.meruSubCounties} />
                                            )}
                                            {geoTab === 'wards' && diversityData.data.meruWards && (
                                                <WardDistributionChart data={diversityData.data.meruWards} />
                                            )}
                                        </div>
                                    </div>
                                </React.Fragment>
                            )}
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
