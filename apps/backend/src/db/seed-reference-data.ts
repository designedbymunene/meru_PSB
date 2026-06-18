import { db } from './index'
import { ethnicities, educationLevels, educationGrades, institutions, courses, professionalBodies } from './schema'
import { sql } from 'drizzle-orm'

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
            { name: 'Doctorate / PhD', code: 'DOCTORATE' },
            { name: 'Master\'s Degree', code: 'MASTERS' },
            { name: 'Postgrad Diploma', code: 'POSTGRAD_DIPLOMA' },
            { name: 'Bachelor\'s Degree', code: 'BACHELORS' },
            { name: 'Higher Diploma', code: 'HIGHER_DIPLOMA' },
            { name: 'Diploma', code: 'DIPLOMA' },
            { name: 'Certificate', code: 'CERTIFICATE' },
            { name: 'Secondary Education (KCSE)', code: 'KCSE' },
            { name: 'Primary Education (KCPE)', code: 'KCPE' }
        ]

        // Map older KNQF codes to these new ones if they exist
        const knqfToSimplified: Record<string, string> = {
            'KNQF_LEVEL_10': 'DOCTORATE',
            'KNQF_LEVEL_9': 'MASTERS',
            'KNQF_LEVEL_8': 'POSTGRAD_DIPLOMA',
            'KNQF_LEVEL_7': 'BACHELORS',
            'KNQF_LEVEL_6': 'DIPLOMA',
            'KNQF_LEVEL_5': 'CERTIFICATE',
            'KNQF_LEVEL_4': 'CERTIFICATE',
            'KNQF_LEVEL_3': 'KCSE',
            'KNQF_LEVEL_2': 'KCSE',
            'KNQF_LEVEL_1': 'KCPE',
        }

        const seededLevelsResult = await db.insert(educationLevels)
            .values(levels)
            .onConflictDoUpdate({
                target: educationLevels.code,
                set: { name: sql`EXCLUDED.name` }
            })
            .returning()
        
        // If nothing was returned (already seeded), fetch them
        const seededLevels = seededLevelsResult.length > 0 ? seededLevelsResult : await db.select().from(educationLevels)
        console.log('✅ Seeded/Updated education levels')

        // 3. Education Grades
        if (seededLevels.length > 0) {
            const letterGrades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E']
            const tvetGrades = ['Distinction', 'Credit', 'Pass', 'Fail', 'Refer']
            const universityGrades = [
                'First Class Honours', 
                'Second Class Honours (Upper Division)', 
                'Second Class Honours (Lower Division)', 
                'Pass',
                'Fail'
            ]

            const gradeValues: { levelId: number, grade: string }[] = []

            for (const level of seededLevels) {
                if (level.code.includes('LEVEL_3') || level.code === 'KCSE' || level.code === 'KCPE') {
                    gradeValues.push(...letterGrades.map(g => ({ levelId: level.id, grade: g })))
                } else if (level.code.match(/LEVEL_[456]/) || ['CERTIFICATE', 'DIPLOMA', 'HIGHER_DIPLOMA'].includes(level.code)) {
                    gradeValues.push(...tvetGrades.map(g => ({ levelId: level.id, grade: g })))
                    // Also add 1-7 numeric grades for TVET
                    gradeValues.push(...['1', '2', '3', '4', '5', '6', '7'].map(g => ({ levelId: level.id, grade: g })))
                } else if (level.code.match(/LEVEL_(7|8|9|10)/) || ['BACHELORS', 'POSTGRAD_DIPLOMA', 'MASTERS', 'DOCTORATE'].includes(level.code)) {
                    gradeValues.push(...universityGrades.map(g => ({ levelId: level.id, grade: g })))
                }
            }

            if (gradeValues.length > 0) {
                // To avoid duplication without unique constraint, we can check existing or just use a batch insert and rely on manual cleanup if needed
                // Better: Fetch existing grades and only insert new ones
                const existingGrades = await db.select().from(educationGrades)
                const existingSet = new Set(existingGrades.map(g => `${g.levelId}-${g.grade}`))
                
                const newGrades = gradeValues.filter(gv => !existingSet.has(`${gv.levelId}-${gv.grade}`))
                
                if (newGrades.length > 0) {
                    await db.insert(educationGrades).values(newGrades)
                }
            }
            console.log('✅ Seeded education grades')
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
