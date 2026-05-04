import { db } from './index'
import { departments, jobGroups, users, vacancies } from './schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { seedLocations } from './seed-locations'
import { seedReferenceData } from './seed-reference-data'

const getClosingDate = (daysFromNow: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return date.toISOString().split('T')[0]
}

export async function seed() {
    try {
        console.log('🌱 Starting database seeding...')

        // 0. Seed Reference Data and Locations
        await seedReferenceData()
        await seedLocations()

        // 1. Seed or fetch Departments
        console.log('📦 Seeding departments...')
        let departmentsData = await db.query.departments.findMany()

        if (departmentsData.length === 0) {
            departmentsData = await db
                .insert(departments)
                .values([
                    {
                        name: 'Immigration and Citizenship Department',
                        description: 'Handles visa processing and citizenship matters',
                        status: 'active' as const
                    },
                    {
                        name: 'National Security Department',
                        description: 'Coordinates national security operations',
                        status: 'active' as const
                    },
                    {
                        name: 'Public Health Department',
                        description: 'Manages public health initiatives and disease prevention',
                        status: 'active' as const
                    },
                    {
                        name: 'Hospital Services Department',
                        description: 'Oversees hospital operations and patient care',
                        status: 'active' as const
                    },
                    {
                        name: 'Primary Education Department',
                        description: 'Manages primary school education',
                        status: 'active' as const
                    },
                    {
                        name: 'Secondary Education Department',
                        description: 'Manages secondary school education',
                        status: 'active' as const
                    },
                    {
                        name: 'Military Operations',
                        description: 'Handles military operations and strategy',
                        status: 'active' as const
                    },
                    {
                        name: 'Defense Procurement',
                        description: 'Manages defense equipment and supplies procurement',
                        status: 'active' as const
                    },
                    {
                        name: 'Budget and Economic Policy',
                        description: 'Develops budgetary and economic policies',
                        status: 'active' as const
                    },
                    {
                        name: 'Treasury Department',
                        description: 'Manages government finances and accounts',
                        status: 'active' as const
                    },
                    {
                        name: 'Crop Production',
                        description: 'Supports crop farming and production',
                        status: 'active' as const
                    },
                    {
                        name: 'Livestock Development',
                        description: 'Develops livestock farming and pastoral systems',
                        status: 'active' as const
                    },
                    {
                        name: 'Energy Generation',
                        description: 'Manages energy generation and distribution',
                        status: 'active' as const
                    },
                    {
                        name: 'Petroleum Operations',
                        description: 'Oversees petroleum exploration and production',
                        status: 'active' as const
                    },
                    {
                        name: 'Water Resources Management',
                        description: 'Manages water resources and conservation',
                        status: 'active' as const
                    },
                    {
                        name: 'Sanitation and Hygiene',
                        description: 'Promotes sanitation and hygiene programs',
                        status: 'active' as const
                    },
                    {
                        name: 'Road Infrastructure',
                        description: 'Manages road construction and maintenance',
                        status: 'active' as const
                    },
                    {
                        name: 'Public Transport',
                        description: 'Oversees public transportation systems',
                        status: 'active' as const
                    },
                    {
                        name: 'Wildlife Conservation',
                        description: 'Protects and manages wildlife resources',
                        status: 'active' as const
                    },
                    {
                        name: 'Tourism Development',
                        description: 'Promotes tourism development and marketing',
                        status: 'active' as const
                    }
                ])
                .returning()
            console.log('✅ Created 20 departments')
        } else {
            console.log('✅ Departments already exist')
        }

        // 2. Seed or fetch Job Groups
        console.log('📦 Seeding job groups...')
        let jobGroupsData = await db.query.jobGroups.findMany()

        if (jobGroupsData.length === 0) {
            jobGroupsData = await db
                .insert(jobGroups)
                .values([
                    {
                        name: 'Job Group A',
                        description: 'Entry-level positions',
                        salaryMin: '15000.00',
                        salaryMax: '25000.00',
                        status: 'active'
                    },
                    {
                        name: 'Job Group B',
                        description: 'Junior positions',
                        salaryMin: '25000.00',
                        salaryMax: '40000.00',
                        status: 'active'
                    },
                    {
                        name: 'Job Group C',
                        description: 'Intermediate positions',
                        salaryMin: '40000.00',
                        salaryMax: '60000.00',
                        status: 'active'
                    },
                    {
                        name: 'Job Group D',
                        description: 'Senior positions',
                        salaryMin: '60000.00',
                        salaryMax: '90000.00',
                        status: 'active'
                    },
                    {
                        name: 'Job Group E',
                        description: 'Management positions',
                        salaryMin: '90000.00',
                        salaryMax: '150000.00',
                        status: 'active'
                    },
                    {
                        name: 'Job Group F',
                        description: 'Senior management positions',
                        salaryMin: '150000.00',
                        salaryMax: '250000.00',
                        status: 'active'
                    }
                ])
                .returning()
            console.log('✅ Created 6 job groups')
        } else {
            console.log('✅ Job groups already exist')
        }

        // 3. Seed or fetch Users
        console.log('📦 Seeding users...')
        let userCount = await db.query.users.findMany()

        if (userCount.length === 0) {
            const adminPassword = await bcrypt.hash('admin@123456', 10)
            const userPassword = await bcrypt.hash('user@123456', 10)

            await db
                .insert(users)
                .values([
                    {
                        email: 'admin@example.com',
                        phoneNumber: '0700000000',
                        password: adminPassword,
                        fullName: 'System Administrator',
                        role: 'admin'
                    }
                ])
                .returning()
            console.log('✅ Created 1 user')
        } else {
            console.log('✅ Users already exist')
        }

        // 4. Seed or fetch Vacancies
        console.log('📦 Seeding vacancies...')
        let vacancyCount = await db.query.vacancies.findMany()

        if (vacancyCount.length === 0 && departmentsData.length > 0 && jobGroupsData.length > 0) {
            const adminUser = await db.query.users.findFirst({
                where: eq(users.role, 'admin')
            })

            if (adminUser) {
                const vacanciesValues = [
                    // Immigration and Citizenship Department
                    {
                        advertisementNumber: 'VG/2025/001',
                        title: 'Senior Immigration Officer',
                        description: 'Join our Immigration Department as a Senior Officer responsible for visa processing and citizenship applications.',
                        departmentId: departmentsData[0]?.id,
                        jobGroupId: jobGroupsData[3]?.id,
                        closingDate: getClosingDate(30),
                        openPositions: 3,
                        jobRequirements: [
                            'Bachelor\'s degree in Law or Public Administration',
                            '5+ years of experience in immigration services',
                            'Strong knowledge of immigration laws',
                            'Excellent communication skills'
                        ],
                        jobResponsibilities: [
                            'Process visa applications',
                            'Conduct citizenship interviews',
                            'Maintain immigration records',
                            'Train junior officers'
                        ],
                        status: 'open' as const,
                        createdBy: adminUser.id
                    },
                    // Public Health Department
                    {
                        advertisementNumber: 'VG/2025/002',
                        title: 'Public Health Specialist',
                        description: 'Seeking experienced Public Health Specialist to lead disease prevention initiatives and coordinate health programs.',
                        departmentId: departmentsData[2]?.id,
                        jobGroupId: jobGroupsData[4]?.id,
                        closingDate: getClosingDate(25),
                        openPositions: 2,
                        jobRequirements: [
                            'Master\'s degree in Public Health',
                            '7+ years of public health experience',
                            'Knowledge of epidemiology',
                            'Leadership skills'
                        ],
                        jobResponsibilities: [
                            'Lead public health initiatives',
                            'Develop disease prevention programs',
                            'Coordinate with health facilities',
                            'Monitor health metrics and reporting'
                        ],
                        status: 'open' as const,
                        createdBy: adminUser.id
                    },
                    // Hospital Services Department
                    {
                        advertisementNumber: 'VG/2025/003',
                        title: 'Hospital Administrator',
                        description: 'Experienced hospital administrator needed to oversee daily operations and improve service delivery.',
                        departmentId: departmentsData[3]?.id,
                        jobGroupId: jobGroupsData[4]?.id,
                        closingDate: getClosingDate(28),
                        openPositions: 1,
                        jobRequirements: [
                            'Bachelor\'s degree in Hospital Management',
                            '8+ years in healthcare administration',
                            'Budget management experience',
                            'Healthcare service knowledge'
                        ],
                        jobResponsibilities: [
                            'Oversee hospital operations',
                            'Manage staff and resources',
                            'Ensure quality patient care',
                            'Handle budget and finances'
                        ],
                        status: 'open' as const,
                        createdBy: adminUser.id
                    },
                    // Primary Education Department
                    {
                        advertisementNumber: 'VG/2025/004',
                        title: 'Curriculum Development Officer',
                        description: 'Lead the development and review of educational curriculum for primary and secondary education.',
                        departmentId: departmentsData[4]?.id,
                        jobGroupId: jobGroupsData[3]?.id,
                        closingDate: getClosingDate(35),
                        openPositions: 2,
                        jobRequirements: [
                            'Master\'s degree in Education',
                            '6+ years in curriculum development',
                            'Experience with educational standards',
                            'Strong analytical skills'
                        ],
                        jobResponsibilities: [
                            'Develop curriculum frameworks',
                            'Review educational standards',
                            'Conduct training for educators',
                            'Monitor curriculum implementation'
                        ],
                        status: 'open' as const,
                        createdBy: adminUser.id
                    },
                    // Budget and Economic Policy Department
                    {
                        advertisementNumber: 'VG/2025/005',
                        title: 'Senior Budget Analyst',
                        description: 'Seeking senior budget analyst to manage government budget allocation and fiscal planning.',
                        departmentId: departmentsData[8]?.id,
                        jobGroupId: jobGroupsData[4]?.id,
                        closingDate: getClosingDate(20),
                        openPositions: 2,
                        jobRequirements: [
                            'Bachelor\'s degree in Economics/Finance',
                            '6+ years of budget analysis experience',
                            'Proficiency in budget software',
                            'Strong Excel and data analysis skills'
                        ],
                        jobResponsibilities: [
                            'Analyze budget proposals',
                            'Monitor expenditures',
                            'Prepare financial reports',
                            'Advise on fiscal policy'
                        ],
                        status: 'open' as const,
                        createdBy: adminUser.id
                    },
                    // Crop Production Department
                    {
                        advertisementNumber: 'VG/2025/006',
                        title: 'Agricultural Extension Officer',
                        description: 'Support farmers through extension services and promote sustainable agricultural practices.',
                        departmentId: departmentsData[10]?.id,
                        jobGroupId: jobGroupsData[2]?.id,
                        closingDate: getClosingDate(32),
                        openPositions: 5,
                        jobRequirements: [
                            'Diploma/Degree in Agriculture',
                            '3+ years extension experience',
                            'Knowledge of sustainable farming',
                            'Community engagement skills'
                        ],
                        jobResponsibilities: [
                            'Conduct farmer training programs',
                            'Promote modern farming techniques',
                            'Monitor crop health',
                            'Provide technical advisory services'
                        ],
                        status: 'open' as const,
                        createdBy: adminUser.id
                    },
                    // Energy Generation Department
                    {
                        advertisementNumber: 'VG/2025/007',
                        title: 'Energy Engineer',
                        description: 'Experienced engineer to oversee energy generation projects and infrastructure development.',
                        departmentId: departmentsData[12]?.id,
                        jobGroupId: jobGroupsData[4]?.id,
                        closingDate: getClosingDate(27),
                        openPositions: 1,
                        jobRequirements: [
                            'Bachelor\'s degree in Electrical/Mechanical Engineering',
                            '7+ years in energy sector',
                            'Project management experience',
                            'Knowledge of renewable energy'
                        ],
                        jobResponsibilities: [
                            'Oversee energy projects',
                            'Design energy systems',
                            'Manage project budgets',
                            'Ensure compliance with standards'
                        ],
                        status: 'open' as const,
                        createdBy: adminUser.id
                    },
                    // Road Infrastructure Department
                    {
                        advertisementNumber: 'VG/2025/008',
                        title: 'Road Infrastructure Project Manager',
                        description: 'Manage road construction and maintenance projects across the country.',
                        departmentId: departmentsData[16]?.id,
                        jobGroupId: jobGroupsData[4]?.id,
                        closingDate: getClosingDate(30),
                        openPositions: 3,
                        jobRequirements: [
                            'Bachelor\'s degree in Civil Engineering',
                            '8+ years in infrastructure projects',
                            'Experience with road construction',
                            'Strong project management skills'
                        ],
                        jobResponsibilities: [
                            'Manage road projects',
                            'Ensure quality standards',
                            'Oversee contractors',
                            'Monitor project timelines and budgets'
                        ],
                        status: 'open' as const,
                        createdBy: adminUser.id
                    },
                    {
                        advertisementNumber: 'VG/2025/009',
                        title: 'Records Management Officer',
                        description: 'Oversee filing, retention, and retrieval of recruitment and administrative records.',
                        departmentId: departmentsData[9]?.id,
                        jobGroupId: jobGroupsData[1]?.id,
                        closingDate: getClosingDate(14),
                        openPositions: 1,
                        jobRequirements: [
                            'Diploma in Records Management or related field',
                            '3+ years of records handling experience',
                            'Attention to detail'
                        ],
                        jobResponsibilities: [
                            'Maintain records archives',
                            'Support document retrieval',
                            'Ensure compliance with retention policies'
                        ],
                        status: 'closed' as const,
                        createdBy: adminUser.id
                    },
                    {
                        advertisementNumber: 'VG/2025/010',
                        title: 'Environmental Health Officer',
                        description: 'Support public health inspections and environmental health compliance programs.',
                        departmentId: departmentsData[15]?.id,
                        jobGroupId: jobGroupsData[2]?.id,
                        closingDate: getClosingDate(-5),
                        openPositions: 2,
                        jobRequirements: [
                            'Degree in Environmental Health',
                            'Knowledge of public health regulations',
                            'Field inspection experience'
                        ],
                        jobResponsibilities: [
                            'Conduct environmental inspections',
                            'Prepare compliance reports',
                            'Support community health outreach'
                        ],
                        status: 'open' as const,
                        createdBy: adminUser.id
                    }
                ]

                await db.insert(vacancies).values(vacanciesValues).returning()
                console.log('✅ Created 10 vacancies')
            }
        } else if (vacancyCount.length > 0) {
            console.log('✅ Vacancies already exist')
        }

        console.log('✅ Database seeding completed successfully!')
        console.log(`
        📊 Seeded Data Summary:
        - Departments: 20
        - Job Groups: 6
        - Users: 1
        - Vacancies: 10
        - Applications: 0

        🔑 Test Credentials:
        Admin:
          Email: admin@example.com
          Password: admin@123456
        `)
    } catch (error) {
        console.error('❌ Seeding error:', error)
        process.exit(1)
    }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seed().catch(console.error)
}
