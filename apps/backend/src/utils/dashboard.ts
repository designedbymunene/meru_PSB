import type { Application, Vacancy } from '../db'
import {
    getApplicationStatusLabel,
    getDashboardApplicationProgress,
    getDashboardApplicationNextStep
} from './application-status'

export type DashboardApplication = Application & {
    vacancy: (Vacancy & {
        department?: { name: string | null } | null
        jobGroup?: { name: string | null } | null
    }) | null
}

export type DashboardVacancy = Vacancy & {
    department?: { name: string | null } | null
    jobGroup?: { name: string | null } | null
}

export type DashboardStatus = 'Open' | 'Closed' | 'Expired'

export { getDashboardApplicationProgress, getDashboardApplicationNextStep }

export const getDashboardVacancyBadge = (vacancy: DashboardVacancy): DashboardStatus => {
    if (vacancy.status === 'closed') {
        return 'Closed'
    }

    const closingDate = new Date(vacancy.closingDate)
    closingDate.setHours(23, 59, 59, 999)

    if (Date.now() > closingDate.getTime()) {
        return 'Expired'
    }

    return 'Open'
}

export const getJobGroupCode = (name?: string | null) => {
    if (!name) {
        return null
    }

    const match = name.match(/^Job Group\s+(.*)$/i)
    return match?.[1]?.trim() || name
}

export const formatDeadline = (closingDate: string | Date) => {
    const dateString = typeof closingDate === 'string' ? closingDate : closingDate.toISOString().split('T')[0]
    return `${dateString}T23:59:59Z`
}

export const buildDashboardData = (applications: DashboardApplication[], vacancies: DashboardVacancy[]) => {
    const sortedApplications = [...applications].sort(
        (left, right) => new Date(right.appliedAt).getTime() - new Date(left.appliedAt).getTime()
    )

    const quickStats = {
        applied: applications.length,
        shortlisted: applications.filter(application => application.status === 'reviewed').length,
        interviews: applications.filter(application => application.status === 'accepted').length,
        saved: 0
    }

    const latestApplication = sortedApplications[0]
    const ongoingActivity = latestApplication?.vacancy
        ? {
              id: `app_${latestApplication.id}`,
              status: getApplicationStatusLabel(latestApplication.status),
              progress: getDashboardApplicationProgress(latestApplication.status),
              nextStep: getDashboardApplicationNextStep(latestApplication.status),
              appliedAt: latestApplication.appliedAt,
              vacancy: {
                  title: latestApplication.vacancy.title,
                  refNumber: latestApplication.vacancy.advertisementNumber,
                  department: latestApplication.vacancy.department
                      ? {
                            name: latestApplication.vacancy.department.name
                        }
                      : null
              }
          }
        : null

    const recommended = vacancies
        .filter(vacancy => getDashboardVacancyBadge(vacancy) === 'Open')
        .sort((left, right) => new Date(left.closingDate).getTime() - new Date(right.closingDate).getTime())
        .slice(0, 6)
        .map(vacancy => ({
            id: `vac_${vacancy.id}`,
            title: vacancy.title,
            description: vacancy.description,
            status: vacancy.status,
            badge: getDashboardVacancyBadge(vacancy),
            jobGroup: {
                code: getJobGroupCode(vacancy.jobGroup?.name)
            },
            department: vacancy.department
                ? {
                      name: vacancy.department.name
                  }
                : null,
            vacancyCount: vacancy.openPositions,
            deadline: formatDeadline(vacancy.closingDate)
        }))

    return {
        quickStats,
        ongoingActivity,
        recommended
    }
}