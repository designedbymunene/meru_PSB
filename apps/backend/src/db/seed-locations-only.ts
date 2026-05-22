import { db } from './index'
import { ethnicities, counties, constituencies, wards } from './schema'
import { countiesData, constituenciesData, wardsData } from './location-data'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function seedLocationsOnly() {
    try {
        console.log('🌱 Seeding comprehensive location and ethnicity data...')

        // 1. Ethnicities
        const ethnicityNames = [
            'Ameru', 'Kikuyu', 'Luhya', 'Luo', 'Kalenjin', 'Kamba', 'Kisii', 'Mijikenda', 
            'Maasai', 'Turkana', 'Taita', 'Somali', 'Embu', 'Teso', 'Kuria', 'Samburu', 'Other'
        ]
        const ethnicityValues = ethnicityNames.map(name => ({ name }))
        await db.insert(ethnicities).values(ethnicityValues).onConflictDoNothing()
        console.log('✅ Seeded ethnicities')

        const fixedLocationsPath = path.resolve(__dirname, 'locations_fixed.json')
        if (fs.existsSync(fixedLocationsPath)) {
            console.log(`📖 Reading fixed locations from: ${fixedLocationsPath}`)
            const data = JSON.parse(fs.readFileSync(fixedLocationsPath, 'utf8'))

            if (data.counties) {
                console.log(`📦 Seeding ${data.counties.length} counties from JSON...`)
                await db.insert(counties).values(data.counties).onConflictDoNothing()
                console.log('✅ Seeded counties')
            }

            if (data.constituencies) {
                console.log(`📦 Seeding ${data.constituencies.length} sub-counties from JSON...`)
                for (let i = 0; i < data.constituencies.length; i += 100) {
                    await db.insert(constituencies).values(data.constituencies.slice(i, i + 100)).onConflictDoNothing()
                }
                console.log('✅ Seeded sub-counties')
            }

            if (data.wards) {
                console.log(`📦 Seeding ${data.wards.length} wards from JSON...`)
                for (let i = 0; i < data.wards.length; i += 100) {
                    await db.insert(wards).values(data.wards.slice(i, i + 100)).onConflictDoNothing()
                }
                console.log('✅ Seeded wards')
            }
        } else {
            console.warn('⚠️ locations_fixed.json not found. Falling back to location-data.ts...')
            
            // 2. Counties
            console.log(`📦 Seeding ${countiesData.length} counties...`)
            await db.insert(counties).values(countiesData).onConflictDoNothing()
            console.log('✅ Seeded counties')

            // 3. Sub-Counties (Constituencies)
            console.log(`📦 Seeding ${constituenciesData.length} sub-counties...`)
            // Batch insert for performance
            for (let i = 0; i < constituenciesData.length; i += 100) {
                await db.insert(constituencies).values(constituenciesData.slice(i, i + 100)).onConflictDoNothing()
            }
            console.log('✅ Seeded sub-counties')

            // 4. Wards
            console.log(`📦 Seeding ${wardsData.length} wards...`)
            // Batch insert for performance
            for (let i = 0; i < wardsData.length; i += 100) {
                await db.insert(wards).values(wardsData.slice(i, i + 100)).onConflictDoNothing()
            }
            console.log('✅ Seeded wards')
        }

        console.log('✨ Comprehensive seeding completed!')
    } catch (error) {
        console.error('❌ Seeding error:', error)
        process.exit(1)
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    seedLocationsOnly().catch(console.error)
}
