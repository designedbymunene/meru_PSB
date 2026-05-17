'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileDown, Loader2, Info } from 'lucide-react'
import { useBoardPack } from '@/hooks/use-board'
import { Combobox } from '@/components/ui/combobox'
import { VacancyWithRelations } from '@/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function BoardPackGenerator({ vacancies }: { vacancies: VacancyWithRelations[] }) {
    const [selectedVacancy, setSelectedVacancy] = useState<string>()
    const generatePack = useBoardPack()

    const options = vacancies.map((v) => ({
        label: `${v.title} (${v.advertisementNumber})`,
        value: v.id.toString(),
    }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Board Pack Generator</CardTitle>
                <CardDescription>Generate comprehensive PDF board packs with interview results and diversity analytics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>New Feature</AlertTitle>
                    <AlertDescription>
                        Board packs now include automated diversity analytics and ranked interview summaries.
                    </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                    <label className="text-sm font-medium">Select Vacancy</label>
                    <Combobox
                        options={options}
                        value={selectedVacancy}
                        onValueChange={setSelectedVacancy}
                        placeholder="Search for a vacancy..."
                        searchPlaceholder="Type vacancy title or advert number..."
                    />
                </div>

                <Button
                    onClick={() => selectedVacancy && generatePack.mutate(parseInt(selectedVacancy))}
                    disabled={!selectedVacancy || generatePack.isPending}
                    className="w-full"
                >
                    {generatePack.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Pack...
                        </>
                    ) : (
                        <>
                            <FileDown className="mr-2 h-4 w-4" />
                            Download Board Pack
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
