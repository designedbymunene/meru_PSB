import { db } from './index'
import { ethnicities, educationLevels, educationGrades, institutions, courses, professionalBodies } from './schema'

export async function seedReferenceData() {
    try {
        console.log('📦 Seeding reference data...')

        // 1. Ethnicities
        const ethnicityNames = [
            'Ameru', 'Kikuyu', 'Luhya', 'Luo', 'Kalenjin', 'Kamba', 'Kisii', 'Mijikenda', 
            'Maasai', 'Turkana', 'Taita', 'Somali', 'Embu', 'Teso', 'Kuria', 'Samburu', 'Other'
        ]
        const ethnicityValues = ethnicityNames.map(name => ({ name }))
        await db.insert(ethnicities).values(ethnicityValues).onConflictDoNothing()
        console.log('✅ Seeded ethnicities')

        // 2. Education Levels
        const levels = [
            { name: 'Kenya Certificate of Primary Education', code: 'KCPE' },
            { name: 'Kenya Certificate of Secondary Education', code: 'KCSE' },
            { name: 'Certificate', code: 'CERTIFICATE' },
            { name: 'Diploma', code: 'DIPLOMA' },
            { name: 'Higher Diploma', code: 'HIGHER_DIPLOMA' },
            { name: 'Bachelors Degree', code: 'BACHELORS' },
            { name: 'Postgraduate Diploma', code: 'POSTGRAD_DIPLOMA' },
            { name: 'Masters Degree', code: 'MASTERS' },
            { name: 'Doctorate (PhD)', code: 'DOCTORATE' }
        ]
        const seededLevels = await db.insert(educationLevels).values(levels).onConflictDoNothing().returning()
        console.log('✅ Seeded education levels')

        // 3. Education Grades (Simplified)
        if (seededLevels.length > 0) {
            const kcseId = seededLevels.find(l => l.code === 'KCSE')?.id
            if (kcseId) {
                const kcseGrades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'].map(grade => ({
                    levelId: kcseId,
                    grade
                }))
                await db.insert(educationGrades).values(kcseGrades).onConflictDoNothing()
            }

            const universityId = seededLevels.find(l => l.code === 'BACHELORS')?.id
            if (universityId) {
                const uniGrades = ['First Class Honours', 'Second Class Upper Division', 'Second Class Lower Division', 'Pass'].map(grade => ({
                    levelId: universityId,
                    grade
                }))
                await db.insert(educationGrades).values(uniGrades).onConflictDoNothing()
            }
            console.log('✅ Seeded sample education grades')
        }

        // 4. Sample Institutions
        const sampleInstitutions = [
            { name: 'University of Nairobi', type: 'UNIVERSITY' },
            { name: 'Kenyatta University', type: 'UNIVERSITY' },
            { name: 'Jomo Kenyatta University of Agriculture and Technology', type: 'UNIVERSITY' },
            { name: 'Meru University of Science and Technology', type: 'UNIVERSITY' },
            { name: 'Kenya Medical Training College', type: 'COLLEGE' }
        ]
        await db.insert(institutions).values(sampleInstitutions).onConflictDoNothing()
        console.log('✅ Seeded sample institutions')

        // 5. Professional Bodies
        const bodies = [
            { name: 'Law Society of Kenya', acronym: 'LSK' },
            { name: 'Engineers Board of Kenya', acronym: 'EBK' },
            { name: 'Institute of Certified Public Accountants of Kenya', acronym: 'ICPAK' },
            { name: 'Kenya Medical Practitioners and Dentists Council', acronym: 'KMPDC' },
            { name: 'Nursing Council of Kenya', acronym: 'NCK' }
        ]
        await db.insert(professionalBodies).values(bodies).onConflictDoNothing()
        console.log('✅ Seeded professional bodies')

    } catch (error) {
        console.error('❌ Reference data seeding error:', error)
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedReferenceData().catch(console.error)
}
