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
        const seededLevelsResult = await db.insert(educationLevels).values(levels).onConflictDoNothing().returning()
        // If nothing was returned (already seeded), fetch them
        const seededLevels = seededLevelsResult.length > 0 ? seededLevelsResult : await db.select().from(educationLevels)
        console.log('✅ Seeded education levels')

        // 3. Education Grades
        if (seededLevels.length > 0) {
            const kcseId = seededLevels.find(l => l.code === 'KCSE')?.id
            const kcpeId = seededLevels.find(l => l.code === 'KCPE')?.id
            
            const letterGrades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E']
            
            if (kcseId) {
                const kcseGrades = letterGrades.map(grade => ({
                    levelId: kcseId,
                    grade
                }))
                await db.insert(educationGrades).values(kcseGrades).onConflictDoNothing()
            }

            if (kcpeId) {
                const kcpeGrades = letterGrades.map(grade => ({
                    levelId: kcpeId,
                    grade
                }))
                await db.insert(educationGrades).values(kcpeGrades).onConflictDoNothing()
            }

            const universityId = seededLevels.find(l => l.code === 'BACHELORS')?.id
            if (universityId) {
                const uniGrades = [
                    'First Class Honours', 
                    'Second Class Upper Division', 
                    'Second Class Lower Division', 
                    'Pass',
                    'Distinction',
                    'Credit'
                ].map(grade => ({
                    levelId: universityId,
                    grade
                }))
                await db.insert(educationGrades).values(uniGrades).onConflictDoNothing()
            }
            console.log('✅ Seeded education grades for KCPE, KCSE and University')
        }

        // 4. Sample Institutions
        const sampleInstitutions = [
            { name: 'University of Nairobi', type: 'UNIVERSITY' },
            { name: 'Kenyatta University', type: 'UNIVERSITY' },
            { name: 'Jomo Kenyatta University of Agriculture and Technology', type: 'UNIVERSITY' },
            { name: 'Moi University', type: 'UNIVERSITY' },
            { name: 'Egerton University', type: 'UNIVERSITY' },
            { name: 'Maseno University', type: 'UNIVERSITY' },
            { name: 'Technical University of Kenya', type: 'UNIVERSITY' },
            { name: 'Technical University of Mombasa', type: 'UNIVERSITY' },
            { name: 'Dedan Kimathi University of Technology', type: 'UNIVERSITY' },
            { name: 'Chuka University', type: 'UNIVERSITY' },
            { name: 'Kisii University', type: 'UNIVERSITY' },
            { name: 'Meru University of Science and Technology', type: 'UNIVERSITY' },
            { name: 'Masinde Muliro University of Science and Technology', type: 'UNIVERSITY' },
            { name: 'Multimedia University of Kenya', type: 'UNIVERSITY' },
            { name: 'South Eastern Kenya University', type: 'UNIVERSITY' },
            { name: 'Strathmore University', type: 'UNIVERSITY' },
            { name: 'United States International University-Africa', type: 'UNIVERSITY' },
            { name: 'Daystar University', type: 'UNIVERSITY' },
            { name: 'Mount Kenya University', type: 'UNIVERSITY' },
            { name: 'Catholic University of Eastern Africa', type: 'UNIVERSITY' },
            { name: 'Kenya Methodist University', type: 'UNIVERSITY' },
            { name: 'KCA University', type: 'UNIVERSITY' },
            { name: 'Zetech University', type: 'UNIVERSITY' },
            { name: 'Kenya Medical Training College', type: 'COLLEGE' },
            { name: 'Kenya Utalii College', type: 'COLLEGE' },
            { name: 'Kenya School of Law', type: 'COLLEGE' },
            { name: 'Kabete National Polytechnic', type: 'COLLEGE' },
            { name: 'Eldoret National Polytechnic', type: 'COLLEGE' },
            { name: 'Kenya Coast National Polytechnic', type: 'COLLEGE' },
            { name: 'Kisumu National Polytechnic', type: 'COLLEGE' }
        ]
        await db.insert(institutions).values(sampleInstitutions).onConflictDoNothing()
        console.log('✅ Seeded institutions')

        // 6. Courses
        const sampleCourses = [
            { name: 'Medicine and Surgery', level: 'BACHELORS' },
            { name: 'Nursing', level: 'BACHELORS' },
            { name: 'Pharmacy', level: 'BACHELORS' },
            { name: 'Clinical Medicine', level: 'BACHELORS' },
            { name: 'Public Health', level: 'BACHELORS' },
            { name: 'Medical Laboratory Sciences', level: 'BACHELORS' },
            { name: 'Commerce', level: 'BACHELORS' },
            { name: 'Business Administration', level: 'BACHELORS' },
            { name: 'Economics and Statistics', level: 'BACHELORS' },
            { name: 'Actuarial Science', level: 'BACHELORS' },
            { name: 'Procurement and Supply Chain Management', level: 'BACHELORS' },
            { name: 'Accounting', level: 'BACHELORS' },
            { name: 'Finance', level: 'BACHELORS' },
            { name: 'Civil Engineering', level: 'BACHELORS' },
            { name: 'Electrical and Electronics Engineering', level: 'BACHELORS' },
            { name: 'Mechanical Engineering', level: 'BACHELORS' },
            { name: 'Mechatronics Engineering', level: 'BACHELORS' },
            { name: 'Architecture', level: 'BACHELORS' },
            { name: 'Quantity Surveying', level: 'BACHELORS' },
            { name: 'Computer Science', level: 'BACHELORS' },
            { name: 'Software Engineering', level: 'BACHELORS' },
            { name: 'Information Technology', level: 'BACHELORS' },
            { name: 'Business Information Technology', level: 'BACHELORS' },
            { name: 'Cybersecurity', level: 'BACHELORS' },
            { name: 'Data Science', level: 'BACHELORS' },
            { name: 'Education (Arts)', level: 'BACHELORS' },
            { name: 'Education (Science)', level: 'BACHELORS' },
            { name: 'Law', level: 'BACHELORS' },
            { name: 'Criminology and Security Studies', level: 'BACHELORS' },
            { name: 'International Relations', level: 'BACHELORS' },
            { name: 'Journalism and Mass Communication', level: 'BACHELORS' },
            { name: 'Psychology', level: 'BACHELORS' },
            { name: 'Public Administration', level: 'BACHELORS' },
            { name: 'Agribusiness Management', level: 'BACHELORS' },
            { name: 'Environmental Science', level: 'BACHELORS' },
            { name: 'Food Science and Technology', level: 'BACHELORS' }
        ]
        await db.insert(courses).values(sampleCourses).onConflictDoNothing()
        console.log('✅ Seeded courses')

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
