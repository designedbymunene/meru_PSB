import { db } from './index'
import { 
    departments, 
    jobGroups, 
    users, 
    vacancies, 
    applications, 
    applicantProfiles,
    ethnicities,
    qualifications,
    employmentHistory,
    professionalDetails,
    professionalMemberships,
    trainingCourses,
    referees,
    institutions,
    courses,
    professionalBodies,
    shortlistCriteria,
    interviews,
    counties
} from './schema'
import bcrypt from 'bcryptjs'
import { seedReferenceData } from './seed-reference-data'
import { eq } from 'drizzle-orm'

const getClosingDate = (daysFromNow: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return date.toISOString().split('T')[0]
}

const weightedRandom = <T>(options: { value: T, weight: number }[]): T => {
    const totalWeight = options.reduce((sum, option) => sum + option.weight, 0)
    let random = Math.random() * totalWeight
    for (const option of options) {
        if (random < option.weight) return option.value
        random -= option.weight
    }
    return options[0].value
}

export async function seedHeavy() {
    try {
        console.log('🌱 Starting enhanced heavy database seeding with weighted demographics...')

        // 0. Seed Reference Data
        await seedReferenceData()

        const allInstitutions = await db.select().from(institutions)
        const allCourses = await db.select().from(courses)
        const allBodies = await db.select().from(professionalBodies)
        const allEthnicities = await db.select().from(ethnicities)
        const allCounties = await db.select().from(counties)
        
        const meruCounty = allCounties.find(c => c.name.toLowerCase().includes('meru'))
        const otherCounties = allCounties.filter(c => !c.name.toLowerCase().includes('meru'))
        
        const ameruEthnicity = allEthnicities.find(e => e.name === 'Ameru')
        const otherEthnicities = allEthnicities.filter(e => e.name !== 'Ameru')

        // 1. Seed Departments
        console.log('📦 Seeding departments...')
        const deptNames = [
            'Health Services',
            'Education and ICT',
            'Agriculture and Livestock',
            'Infrastructure and Transport',
            'Finance and Economic Planning'
        ]
        
        for (const name of deptNames) {
            const existing = await db.query.departments.findFirst({
                where: eq(departments.name, name)
            })
            if (!existing) {
                await db.insert(departments).values({
                    name,
                    description: `${name} department and services`,
                    status: 'active'
                })
            }
        }
        const departmentsData = await db.query.departments.findMany({
            where: (depts, { inArray }) => inArray(depts.name, deptNames)
        })
        console.log(`✅ Verified ${departmentsData.length} departments`)

        // 2. Seed Job Groups
        console.log('📦 Seeding job groups...')
        const jgNames = ['Job Group H', 'Job Group J', 'Job Group K', 'Job Group L', 'Job Group M']
        for (const name of jgNames) {
            const existing = await db.query.jobGroups.findFirst({
                where: eq(jobGroups.name, name)
            })
            if (!existing) {
                await db.insert(jobGroups).values({
                    name,
                    salaryMin: '25000.00',
                    salaryMax: '90000.00',
                    status: 'active'
                })
            }
        }
        const jobGroupsData = await db.query.jobGroups.findMany({
            where: (jgs, { inArray }) => inArray(jgs.name, jgNames)
        })
        console.log(`✅ Verified ${jobGroupsData.length} job groups`)

        // 3. Seed Admin User
        console.log('📦 Seeding admin user...')
        const adminEmail = 'admin@meru.go.ke'
        let adminUser = await db.query.users.findFirst({
            where: eq(users.email, adminEmail)
        })
        
        if (!adminUser) {
            const adminPassword = await bcrypt.hash('admin@123', 10)
            const [newAdmin] = await db
                .insert(users)
                .values({
                    email: adminEmail,
                    phoneNumber: '0700000000',
                    password: adminPassword,
                    fullName: 'System Admin',
                    role: 'admin'
                })
                .returning()
            adminUser = newAdmin
            console.log('✅ Created admin user')
        } else {
            console.log('✅ Admin user already exists')
        }

        // 4. Seed 5 Vacancies
        console.log('📦 Seeding vacancies...')
        const vacancyAds = ['MCPSB/2026/001', 'MCPSB/2026/002', 'MCPSB/2026/003', 'MCPSB/2026/004', 'MCPSB/2026/005']
        for (let i = 0; i < vacancyAds.length; i++) {
            const ad = vacancyAds[i]
            const existing = await db.query.vacancies.findFirst({
                where: eq(vacancies.advertisementNumber, ad)
            })
            if (!existing) {
                const titles = ['Medical Officer', 'ICT Officer', 'Agricultural Extension Officer', 'Civil Engineer', 'Accountant']
                await db.insert(vacancies).values({
                    advertisementNumber: ad,
                    title: titles[i],
                    description: `Provision of ${titles[i]} services.`,
                    departmentId: departmentsData[i % departmentsData.length].id,
                    jobGroupId: jobGroupsData[i % jobGroupsData.length].id,
                    closingDate: getClosingDate(14 + i * 5),
                    openPositions: 5 + i,
                    status: 'open',
                    createdBy: adminUser.id
                })
            }
        }
        const vacanciesData = await db.query.vacancies.findMany({
            where: (v, { inArray }) => inArray(v.advertisementNumber, vacancyAds)
        })
        console.log(`✅ Verified ${vacanciesData.length} vacancies`)

        // 4b. Seed Shortlist Criteria for each vacancy
        console.log('📦 Seeding shortlist criteria...')
        for (const vacancy of vacanciesData) {
            const existing = await db.query.shortlistCriteria.findFirst({
                where: eq(shortlistCriteria.vacancyId, vacancy.id)
            })
            if (!existing) {
                await db.insert(shortlistCriteria).values({
                    vacancyId: vacancy.id,
                    weights: { academic: 40, professional: 30, experience: 30 },
                    minScore: 60,
                    configuredBy: adminUser.id
                })
            }
        }
        console.log('✅ Verified shortlist criteria for vacancies')

        // 5. Seed 50 Applicants with Profiles
        console.log('📦 Seeding 50 applicants with weighted profiles...')
        const userPassword = await bcrypt.hash('password@123', 10)

        for (let i = 1; i <= 50; i++) {
            const email = `applicant${i}@example.com`
            
            let user = await db.query.users.findFirst({
                where: eq(users.email, email)
            })

            if (user) continue // Skip if already exists

            const phone = `07123456${i.toString().padStart(2, '0')}`
            const name = `Applicant ${i}`
            const idNumber = `123456${i.toString().padStart(2, '0')}`

            // Weighted Demographics
            const gender = weightedRandom([{ value: 'Female', weight: 52 }, { value: 'Male', weight: 48 }])
            const ethnicityId = weightedRandom([
                { value: ameruEthnicity?.id || allEthnicities[0].id, weight: 65 },
                { value: otherEthnicities[Math.floor(Math.random() * otherEthnicities.length)].id, weight: 35 }
            ])
            const countyId = weightedRandom([
                { value: meruCounty?.id || allCounties[0]?.id, weight: 75 },
                { value: otherCounties[Math.floor(Math.random() * otherCounties.length)]?.id || allCounties[0]?.id, weight: 25 }
            ])
            const impairment = weightedRandom([{ value: true, weight: 5 }, { value: false, weight: 95 }])

            const [newUser] = await db
                .insert(users)
                .values({ email, phoneNumber: phone, password: userPassword, fullName: name, role: 'applicant' })
                .returning()
            user = newUser

            const [profile] = await db
                .insert(applicantProfiles)
                .values({
                    userId: user.id,
                    fullName: name,
                    idNumber,
                    gender,
                    dateOfBirth: '1995-05-15',
                    phoneNumber: phone,
                    email,
                    ethnicityId,
                    homeCountyId: countyId,
                    impairment,
                    impairmentDetails: impairment ? 'Physical disability requiring accessibility support' : null,
                    hasNoExperience: Math.random() < 0.15
                })
                .returning()

            // Qualifications, etc.
            const inst = allInstitutions[i % allInstitutions.length]
            const course = allCourses[i % allCourses.length]
            await db.insert(qualifications).values([
                { applicantProfileId: profile.id, level: 'BACHELORS', course: course.name, courseId: course.id, grade: 'Second Class Upper', institution: inst.name, institutionId: inst.id, yearStart: 2014, yearEnd: 2018 },
                { applicantProfileId: profile.id, level: 'KCSE', course: 'Kenya Certificate of Secondary Education', grade: 'B+', institution: 'High School Academy', yearStart: 2010, yearEnd: 2013 }
            ])

            if (!profile.hasNoExperience) {
                await db.insert(employmentHistory).values([
                    { applicantProfileId: profile.id, startDate: '2019-01-01', endDate: '2022-12-31', jobTitle: 'Junior Officer', organization: 'Previous Corp Ltd', responsibilities: '...' },
                    { applicantProfileId: profile.id, startDate: '2023-01-01', jobTitle: 'Professional Consultant', organization: 'Self Employed', responsibilities: '...' }
                ])
            }

            const body = allBodies[i % allBodies.length]
            await db.insert(professionalDetails).values({ applicantProfileId: profile.id, licenseType: 'Practice License', issuingBody: body.name, issuingBodyId: body.id, registrationNumber: `REG-${1000 + i}`, issueDate: '2020-01-01', expiryDate: '2026-01-01' })
            await db.insert(professionalMemberships).values({ applicantProfileId: profile.id, membershipBody: body.name, membershipBodyId: body.id, membershipType: 'Full Member', registrationNumber: `MEM-${2000 + i}`, expiryDate: '2027-01-01' })
            await db.insert(trainingCourses).values({ applicantProfileId: profile.id, courseName: 'Strategic Leadership Training', institution: 'Kenya School of Government', year: 2021, grade: 'Completed' })
            await db.insert(referees).values({ applicantProfileId: profile.id, fullName: `Referee for Applicant ${i}`, organization: 'Reference Org', designation: 'Manager', phone: '0722000000', email: `referee${i}@example.com`, relationship: 'Former Supervisor' })

            // Randomly apply to 1-2 vacancies - ALL PENDING
            const numApps = Math.floor(Math.random() * 2) + 1
            const shuffledVacancies = [...vacanciesData].sort(() => 0.5 - Math.random())
            const chosenVacancies = shuffledVacancies.slice(0, numApps)

            for (const vacancy of chosenVacancies) {
                await db.insert(applications).values({ applicantId: user.id, vacancyId: vacancy.id, status: 'pending', appliedAt: new Date() })
            }
            
            if (i % 10 === 0) {
                console.log(`   - Seeded ${i} applicants with weighted profiles...`)
            }
        }
        console.log('✅ Created 50 applicants with weighted demographics and pending applications')

        console.log('✅ Enhanced heavy seeding completed successfully!')
    } catch (error) {
        console.error('❌ Seeding error:', error)
        process.exit(1)
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    seedHeavy().catch(console.error)
}
