'use client'

import React from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    Funnel,
    FunnelChart as ReFunnelChart,
    LabelList,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FunnelDataPoint, TimeSeriesDataPoint } from '@meru/shared'

const CHART_COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
]

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-xl border bg-card p-3 shadow-lg ring-1 ring-black/5">
                <p className="text-sm font-semibold mb-1">{label || payload[0].name}</p>
                <div className="flex items-center gap-2">
                    <div 
                        className="h-2 w-2 rounded-full" 
                        style={{ backgroundColor: payload[0].color || payload[0].fill }} 
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                        {payload[0].value.toLocaleString()} {payload[0].unit || ''}
                    </span>
                </div>
            </div>
        )
    }
    return null
}

export function ApplicantFunnel({ data }: { data: FunnelDataPoint[] }) {
    return (
        <Card className="col-span-1 lg:col-span-2 overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle>Applicant Funnel</CardTitle>
                <CardDescription>Conversion from application to acceptance</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ReFunnelChart margin={{ top: 20, right: 100, left: 20, bottom: 20 }}>
                            <Tooltip content={<CustomTooltip />} />
                            <Funnel
                                dataKey="value"
                                data={data}
                                isAnimationActive
                            >
                                <LabelList 
                                    position="right" 
                                    fill="var(--foreground)" 
                                    stroke="none" 
                                    dataKey="name" 
                                    fontSize={12}
                                    className="font-medium"
                                />
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Funnel>
                        </ReFunnelChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export function ApplicationsTimeLine({ data }: { data: TimeSeriesDataPoint[] }) {
    return (
        <Card className="col-span-1 lg:col-span-4">
            <CardHeader className="pb-2">
                <CardTitle>Applications Volume</CardTitle>
                <CardDescription>Number of applications received over time</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis 
                                dataKey="date" 
                                fontSize={11} 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={12}
                                stroke="var(--muted-foreground)"
                            />
                            <YAxis 
                                fontSize={11} 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={12}
                                stroke="var(--muted-foreground)"
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                                type="monotone" 
                                dataKey="count" 
                                stroke="var(--primary)" 
                                strokeWidth={2.5}
                                fillOpacity={1} 
                                fill="url(#colorCount)" 
                                animationDuration={1000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export function DiversityPieChart({ title, data, dataKey, nameKey }: { title: string, data: any[], dataKey: string, nameKey: string }) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                innerRadius={55}
                                paddingAngle={4}
                                dataKey={dataKey}
                                nameKey={nameKey}
                                stroke="var(--card)"
                                strokeWidth={2}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                                verticalAlign="bottom" 
                                align="center"
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export function EthnicityBarChart({ data }: { data: Record<string, number> }) {
    const chartData = Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, value]) => ({ name, value }))

    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader className="pb-2">
                <CardTitle>Ethnicity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                        >
                            <XAxis type="number" hide />
                            <YAxis 
                                type="category" 
                                dataKey="name" 
                                fontSize={11} 
                                tickLine={false} 
                                axisLine={false} 
                                width={100}
                                stroke="var(--foreground)"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar 
                                dataKey="value" 
                                radius={[0, 4, 4, 0]} 
                                barSize={24}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 1) % CHART_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export function CountyDistributionChart({ data }: { data: Record<string, number> }) {
    const chartData = Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name, value }))

    return (
        <Card className="col-span-1 lg:col-span-3">
            <CardHeader className="pb-2">
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Top 10 counties by applicant volume</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
                        >
                            <XAxis 
                                dataKey="name" 
                                angle={-45} 
                                textAnchor="end" 
                                interval={0} 
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                height={60}
                            />
                            <YAxis fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" fill="var(--chart-1)" radius={[4, 4, 0, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export function RecruitmentVelocityChart({ data }: { data: { stage: string, avgDays: number }[] }) {
    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader className="pb-2">
                <CardTitle>Recruitment Velocity</CardTitle>
                <CardDescription>Average days spent in each stage</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={data}
                            margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
                        >
                            <XAxis type="number" hide />
                            <YAxis 
                                type="category" 
                                dataKey="stage" 
                                fontSize={11} 
                                tickLine={false} 
                                axisLine={false} 
                                width={120}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="avgDays" fill="var(--chart-4)" radius={[0, 4, 4, 0]} barSize={30}>
                                <LabelList dataKey="avgDays" position="right" fontSize={12} formatter={(v: any) => `${v}d`} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export function VacancyPerformanceChart({ data }: { data: any[] }) {
    return (
        <Card className="col-span-1 lg:col-span-6">
            <CardHeader className="pb-2">
                <CardTitle>Vacancy Performance</CardTitle>
                <CardDescription>Top 10 vacancies by applicant engagement</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                            <XAxis 
                                dataKey="title" 
                                angle={-45} 
                                textAnchor="end" 
                                interval={0} 
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                height={80}
                            />
                            <YAxis fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" align="right" height={36} />
                            <Bar name="Total Apps" dataKey="applicationsCount" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                            <Bar name="Shortlisted" dataKey="shortlistedCount" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                            <Bar name="Interviewed" dataKey="interviewedCount" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export function ConversionTrendsChart({ data }: { data: any[] }) {
    return (
        <Card className="col-span-1 lg:col-span-4">
            <CardHeader className="pb-2">
                <CardTitle>Conversion Efficiency</CardTitle>
                <CardDescription>Percentage of candidates progressing between stages</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <XAxis 
                                dataKey="date" 
                                fontSize={11} 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={12}
                                stroke="var(--muted-foreground)"
                            />
                            <YAxis 
                                fontSize={11} 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={12}
                                stroke="var(--muted-foreground)"
                                unit="%"
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" align="right" height={36} />
                            <Area 
                                type="monotone" 
                                name="App → Shortlist"
                                dataKey="applicationToShortlist" 
                                stroke="var(--chart-1)" 
                                fill="var(--chart-1)"
                                fillOpacity={0.1}
                                strokeWidth={2}
                            />
                            <Area 
                                type="monotone" 
                                name="Shortlist → Interview"
                                dataKey="shortlistToInterview" 
                                stroke="var(--chart-2)" 
                                fill="var(--chart-2)"
                                fillOpacity={0.1}
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export function SubCountyDistributionChart({ data }: { data: Record<string, number> }) {
    const chartData = Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }))

    return (
        <Card className="col-span-1 lg:col-span-3 border border-border/50 bg-card/60 backdrop-blur-md transition-all hover:shadow-md">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Meru Sub-Counties Distribution
                </CardTitle>
                <CardDescription>Applicant volume across sub-counties (constituencies) in Meru</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    {chartData.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-muted-foreground text-sm py-10">
                            No applicant data available for Meru sub-counties
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
                            >
                                <defs>
                                    <linearGradient id="colorSubCounty" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="oklch(0.65 0.18 145)" stopOpacity={1} />
                                        <stop offset="100%" stopColor="oklch(0.5 0.15 170)" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="name" 
                                    angle={-45} 
                                    textAnchor="end" 
                                    interval={0} 
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    height={70}
                                    stroke="var(--muted-foreground)"
                                />
                                <YAxis 
                                    fontSize={11} 
                                    tickLine={false} 
                                    axisLine={false}
                                    stroke="var(--muted-foreground)"
                                />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" fill="url(#colorSubCounty)" radius={[4, 4, 0, 0]} barSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export function WardDistributionChart({ data }: { data: Record<string, number> }) {
    const chartData = Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([name, value]) => ({ name, value }))

    return (
        <Card className="col-span-1 lg:col-span-3 border border-border/50 bg-card/60 backdrop-blur-md transition-all hover:shadow-md">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                    Top 12 Meru Wards Distribution
                </CardTitle>
                <CardDescription>Highest representing wards in Meru County by candidate volume</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    {chartData.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-muted-foreground text-sm py-10">
                            No applicant data available for Meru wards
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={chartData}
                                margin={{ top: 10, right: 30, left: 15, bottom: 5 }}
                            >
                                <defs>
                                    <linearGradient id="colorWard" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="oklch(0.7 0.14 185)" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="oklch(0.55 0.16 220)" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <XAxis type="number" hide />
                                <YAxis 
                                    type="category" 
                                    dataKey="name" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    width={120}
                                    stroke="var(--foreground)"
                                />
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.3} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar 
                                    dataKey="value" 
                                    fill="url(#colorWard)"
                                    radius={[0, 4, 4, 0]} 
                                    barSize={18}
                                >
                                    <LabelList dataKey="value" position="right" fontSize={10} className="font-semibold fill-muted-foreground" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
