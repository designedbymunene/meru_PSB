import { VacancyDetail } from '@/components/vacancies/vacancy-detail'
import { getVacancyServer, getVacancyPdfsServer } from '@/lib/api/vacancies-server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

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
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            
            <main className="flex-1 w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <VacancyDetail 
                        initialVacancy={vacancyResult || undefined} 
                        initialPdfs={pdfsResult || undefined} 
                    />
                </div>
            </main>

            <Footer />
        </div>
    )
}
