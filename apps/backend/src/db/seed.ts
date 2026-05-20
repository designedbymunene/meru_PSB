import { db } from './index'
import { departments, jobGroups, users, vacancies, applications, applicantProfiles, ethnicities, counties, constituencies, wards } from './schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { seedLocations } from './seed-locations'
import { seedReferenceData } from './seed-reference-data'

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

export async function seed() {
    try {
        console.log('🌱 Starting database seeding...')

        // 0. Seed Reference Data and Locations
        await seedReferenceData()
        await seedLocations()

        const allEthnicities = await db.select().from(ethnicities)
        const allCounties = await db.select().from(counties)
        const allConstituencies = await db.select().from(constituencies)
        const allWards = await db.select().from(wards)
        
        const meruCounty = allCounties.find(c => c.name.toLowerCase().includes('meru'))
        const ameruEthnicity = allEthnicities.find(e => e.name === 'Ameru')

        const meruConstituencies = meruCounty 
            ? allConstituencies.filter(c => c.countyId === meruCounty.id)
            : []
        const meruConstituencyIds = meruConstituencies.map(c => c.id)
        const meruWards = meruConstituencyIds.length > 0
            ? allWards.filter(w => meruConstituencyIds.includes(w.constituencyId))
            : []

        // 1. Seed Departments
        console.log('📦 Seeding departments...')
        const deptNames = [
            'Immigration and Citizenship Department',
            'National Security Department',
            'Public Health Department',
            'Hospital Services Department',
            'Primary Education Department'
        ]
        for (const name of deptNames) {
            const existing = await db.query.departments.findFirst({ where: eq(departments.name, name) })
            if (!existing) {
                await db.insert(departments).values({
                    name,
                    description: `Department for ${name}`,
                    status: 'active'
                })
            }
        }
        const departmentsData = await db.query.departments.findMany({
            where: (d, { inArray }) => inArray(d.name, deptNames)
        })

        // 2. Seed Job Groups
        console.log('📦 Seeding job groups...')
        const jgNames = ['Job Group A', 'Job Group B', 'Job Group C', 'Job Group D', 'Job Group E', 'Job Group F']
        for (const name of jgNames) {
            const existing = await db.query.jobGroups.findFirst({ where: eq(jobGroups.name, name) })
            if (!existing) {
                await db.insert(jobGroups).values({
                    name,
                    description: `Description for ${name}`,
                    salaryMin: '15000.00',
                    salaryMax: '150000.00',
                    status: 'active'
                })
            }
        }
        const jobGroupsData = await db.query.jobGroups.findMany({
            where: (j, { inArray }) => inArray(j.name, jgNames)
        })

        // 3. Seed Admin User
        console.log('📦 Seeding admin user...')
        const adminEmail = 'admin@example.com'
        let adminUser = await db.query.users.findFirst({ where: eq(users.email, adminEmail) })
        if (!adminUser) {
            const adminPassword = await bcrypt.hash('admin@123456', 10)
            const [newAdmin] = await db.insert(users).values({
                email: adminEmail,
                phoneNumber: '0700000000',
                password: adminPassword,
                fullName: 'System Administrator',
                role: 'admin'
            }).returning()
            adminUser = newAdmin
        }

        // 4. Seed Vacancies
        console.log('📦 Seeding vacancies...')
        const vacancyAds = ['VG/2025/001', 'VG/2025/002', 'VG/2025/003', 'VG/2025/004', 'VG/2025/005']
        for (let i = 0; i < vacancyAds.length; i++) {
            const ad = vacancyAds[i]
            const existing = await db.query.vacancies.findFirst({ where: eq(vacancies.advertisementNumber, ad) })
            if (!existing) {
                await db.insert(vacancies).values({
                    advertisementNumber: ad,
                    title: `Vacancy ${i + 1}`,
                    description: `Description for vacancy ${i + 1}`,
                    departmentId: departmentsData[i % departmentsData.length].id,
                    jobGroupId: jobGroupsData[i % jobGroupsData.length].id,
                    closingDate: getClosingDate(30),
                    openPositions: 2,
                    status: 'open',
                    createdBy: adminUser.id
                })
            }
        }
        const vacanciesData = await db.query.vacancies.findMany({
            where: (v, { inArray }) => inArray(v.advertisementNumber, vacancyAds)
        })

        // 5. Seed some Applicants and Applications
        console.log('📦 Seeding initial applicants with weighted demographics...')
        const userPassword = await bcrypt.hash('user@123456', 10)

        for (let i = 1; i <= 5; i++) {
            const email = `test.applicant${i}@example.com`
            const existing = await db.query.users.findFirst({ where: eq(users.email, email) })
            if (existing) continue

            const gender = weightedRandom([{ value: 'Female', weight: 52 }, { value: 'Male', weight: 48 }])
            const ethnicityId = weightedRandom([
                { value: ameruEthnicity?.id || allEthnicities[0]?.id, weight: 70 },
                { value: allEthnicities[Math.floor(Math.random() * allEthnicities.length)]?.id, weight: 30 }
            ])
            const countyId = weightedRandom([
                { value: meruCounty?.id || allCounties[0]?.id, weight: 80 },
                { value: allCounties[Math.floor(Math.random() * allCounties.length)]?.id, weight: 20 }
            ])

            // Determine sub-county and ward matching the countyId
            let homeSubCountyId: number | null = null
            let wardId: number | null = null

            if (countyId === meruCounty?.id && meruConstituencies.length > 0) {
                const sub = meruConstituencies[Math.floor(Math.random() * meruConstituencies.length)]
                homeSubCountyId = sub.id
                const subWards = meruWards.filter(w => w.constituencyId === sub.id)
                if (subWards.length > 0) {
                    wardId = subWards[Math.floor(Math.random() * subWards.length)].id
                }
            } else {
                const countyConstituencies = allConstituencies.filter(c => c.countyId === countyId)
                if (countyConstituencies.length > 0) {
                    const sub = countyConstituencies[Math.floor(Math.random() * countyConstituencies.length)]
                    homeSubCountyId = sub.id
                    const subWards = allWards.filter(w => w.constituencyId === sub.id)
                    if (subWards.length > 0) {
                        wardId = subWards[Math.floor(Math.random() * subWards.length)].id
                    }
                }
            }

            const [user] = await db.insert(users).values({
                email,
                phoneNumber: `071100000${i}`,
                password: userPassword,
                fullName: `Test Applicant ${i}`,
                role: 'applicant'
            }).returning()

            const [profile] = await db.insert(applicantProfiles).values({
                userId: user.id,
                fullName: `Test Applicant ${i}`,
                idNumber: `3344556${i}`,
                phoneNumber: `071100000${i}`,
                email,
                gender,
                ethnicityId,
                homeCountyId: countyId,
                homeSubCountyId,
                wardId,
                impairment: Math.random() < 0.05
            }).returning()

            const numApps = Math.floor(Math.random() * 2) + 1
            for (let j = 0; j < numApps; j++) {
                const vacancy = vacanciesData[Math.floor(Math.random() * vacanciesData.length)]
                
                const profileSnapshotObj = {
                    id: profile.id,
                    userId: profile.userId,
                    fullName: profile.fullName,
                    idNumber: profile.idNumber,
                    gender: profile.gender,
                    phoneNumber: profile.phoneNumber,
                    email: profile.email,
                    ethnicityId: profile.ethnicityId,
                    homeCountyId: profile.homeCountyId,
                    homeSubCountyId: profile.homeSubCountyId,
                    wardId: profile.wardId,
                    impairment: profile.impairment,
                    impairmentDetails: null,
                    hasNoExperience: false,
                    qualifications: [],
                    employmentHistory: [],
                    professionalDetails: [],
                    professionalMemberships: [],
                    trainingCourses: []
                }

                await db.insert(applications).values({
                    applicantId: user.id,
                    vacancyId: vacancy.id,
                    status: 'pending',
                    appliedAt: new Date(),
                    profileSnapshot: profileSnapshotObj
                })
            }
        }

        console.log('✅ Database seeding completed successfully!')
    } catch (error) {
        console.error('❌ Seeding error:', error)
        process.exit(1)
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    seed().catch(console.error)
}

