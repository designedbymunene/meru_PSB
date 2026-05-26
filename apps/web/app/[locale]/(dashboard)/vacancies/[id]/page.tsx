import { VacancyDetail } from '@/components/vacancies/vacancy-detail'
import { getVacancyServer, getVacancyPdfsServer } from '@/lib/api/vacancies-server'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function VacancyDetailPage({ params }: PageProps) {
    const resolvedParams = await params
    const id = Number(resolvedParams.id)

    // Fetch vacancy details and PDFs server-side
    const vacancyResult = await getVacancyServer(id).catch((err) => {
        console.error(`Failed to fetch vacancy ${id} on server:`, err)
        return null
    })

    const pdfsResult = await getVacancyPdfsServer(id).catch((err) => {
        console.error(`Failed to fetch PDFs for vacancy ${id} on server:`, err)
        return null
    })

    return (
        <VacancyDetail 
            initialVacancy={vacancyResult || undefined} 
            initialPdfs={pdfsResult || undefined} 
        />
    )
}
