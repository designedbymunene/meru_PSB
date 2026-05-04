import { db } from './index'
import { counties, constituencies, wards } from './schema'
import fs from 'fs'
import path from 'path'

export async function seedLocations() {
    try {
        console.log('🌍 Seeding locations from SQL...')
        
        const sqlPath = '/Users/nozel/Downloads/kenya20260430.sql'
        if (!fs.existsSync(sqlPath)) {
            console.error(`❌ SQL file not found at ${sqlPath}`)
            return
        }

        const sqlContent = fs.readFileSync(sqlPath, 'utf8')

        // Helper to extract values from INSERT INTO `table` VALUES (...), (...);
        const extractValues = (tableName: string) => {
            const regex = new RegExp(`INSERT INTO \`${tableName}\` VALUES (.*?);`, 's')
            const match = sqlContent.match(regex)
            if (!match) return []

            // Split by ),( while handling potential commas inside strings (this is a simple parser, might need more robust logic)
            // But usually these dumps are consistent.
            const rowsRaw = match[1].trim()
            const rows: any[] = []
            
            // Simple split for this specific SQL dump structure
            // Format: (id, ...), (id, ...)
            let currentPos = 0
            while (currentPos < rowsRaw.length) {
                if (rowsRaw[currentPos] === '(') {
                    let endPos = currentPos
                    let insideString = false
                    while (endPos < rowsRaw.length) {
                        if (rowsRaw[endPos] === "'" && rowsRaw[endPos - 1] !== '\\') {
                            insideString = !insideString
                        }
                        if (rowsRaw[endPos] === ')' && !insideString) {
                            break
                        }
                        endPos++
                    }
                    const rowContent = rowsRaw.substring(currentPos + 1, endPos)
                    rows.push(rowContent)
                    currentPos = endPos + 1
                } else {
                    currentPos++
                }
            }
            return rows
        }

        // 1. Counties
        console.log('📦 Seeding counties...')
        const countyRows = extractValues('counties')
        const countyValues = countyRows.map(row => {
            const [id, code, name, slug] = row.split(',').map((s: string) => s.trim().replace(/'/g, ''))
            return { id: parseInt(id), code, name, slug }
        })
        if (countyValues.length > 0) {
            await db.insert(counties).values(countyValues).onConflictDoNothing()
            console.log(`✅ Seeded ${countyValues.length} counties`)
        }

        // 2. Constituencies
        console.log('📦 Seeding constituencies...')
        const constituencyRows = extractValues('constituencies')
        const constituencyValues = constituencyRows.map(row => {
            const [id, countyId, code, name, slug] = row.split(',').map((s: string) => s.trim().replace(/'/g, ''))
            return { id: parseInt(id), countyId: parseInt(countyId), code, name, slug }
        })
        if (constituencyValues.length > 0) {
            // Batch insert to avoid memory issues if large
            for (let i = 0; i < constituencyValues.length; i += 100) {
                await db.insert(constituencies).values(constituencyValues.slice(i, i + 100)).onConflictDoNothing()
            }
            console.log(`✅ Seeded ${constituencyValues.length} constituencies`)
        }

        // 3. Wards
        console.log('📦 Seeding wards...')
        const wardRows = extractValues('wards')
        const wardValues = wardRows.map(row => {
            const [id, constituencyId, code, name, slug, voters, pollingStations] = row.split(',').map((s: string) => s.trim().replace(/'/g, ''))
            return { 
                id: parseInt(id), 
                constituencyId: parseInt(constituencyId), 
                code, 
                name, 
                slug, 
                voters, 
                pollingStations 
            }
        })
        if (wardValues.length > 0) {
            for (let i = 0; i < wardValues.length; i += 100) {
                await db.insert(wards).values(wardValues.slice(i, i + 100)).onConflictDoNothing()
            }
            console.log(`✅ Seeded ${wardValues.length} wards`)
        }

    } catch (error) {
        console.error('❌ Location seeding error:', error)
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedLocations().catch(console.error)
}
