import { db } from './index'
import { counties, constituencies, wards } from './schema'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { countiesData, constituenciesData, wardsData } from './location-data'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function seedLocations() {
    try {
        console.log('🌍 Seeding locations...')
        
        // Try multiple possible paths for the SQL file
        const possiblePaths = [
            path.resolve(__dirname, '../../../../Downloads/kenya20260430.sql'),
            path.resolve(process.cwd(), '../../Downloads/kenya20260430.sql'),
            '/Users/nozel/Downloads/kenya20260430.sql'
        ]

        let sqlPath = ''
        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                sqlPath = p
                break
            }
        }

        if (sqlPath) {
            console.log(`📖 Reading SQL from: ${sqlPath}`)
            const sqlContent = fs.readFileSync(sqlPath, 'utf8')

            // Helper to extract values from INSERT INTO `table` VALUES (...), (...);
            const extractValues = (tableName: string) => {
                // Updated regex to be more robust with possible line breaks and case sensitivity
                const regex = new RegExp(`INSERT INTO \`${tableName}\` VALUES\\s*(.*?);`, 'is')
                const match = sqlContent.match(regex)
                if (!match) {
                    console.warn(`⚠️ No INSERT INTO statement found for table: ${tableName}`)
                    return []
                }

                const rowsRaw = match[1].trim()
                const rows: string[] = []
                
                let currentPos = 0
                let depth = 0
                let start = -1
                let insideString = false
                
                while (currentPos < rowsRaw.length) {
                    const char = rowsRaw[currentPos]
                    const prevChar = rowsRaw[currentPos - 1]

                    if (char === "'" && prevChar !== '\\') {
                        insideString = !insideString
                    }

                    if (!insideString) {
                        if (char === '(') {
                            if (depth === 0) start = currentPos + 1
                            depth++
                        } else if (char === ')') {
                            depth--
                            if (depth === 0) {
                                rows.push(rowsRaw.substring(start, currentPos))
                            }
                        }
                    }
                    currentPos++
                }
                return rows
            }

            const parseRow = (row: string) => {
                const values: string[] = []
                let current = ''
                let insideString = false
                for (let i = 0; i < row.length; i++) {
                    const char = row[i]
                    const prev = row[i - 1]
                    if (char === "'" && prev !== '\\') {
                        insideString = !insideString
                        continue
                    }
                    if (char === ',' && !insideString) {
                        values.push(current.trim())
                        current = ''
                    } else {
                        current += char
                    }
                }
                values.push(current.trim())
                return values.map(v => v === 'NULL' ? null : v.replace(/\\'/g, "'"))
            }

            // 1. Counties
            console.log('📦 Seeding counties from SQL...')
            const countyRows = extractValues('counties')
            const countyValues = countyRows.map(row => {
                const [id, code, name, slug] = parseRow(row)
                return { 
                    id: parseInt(id!), 
                    code: code || '', 
                    name: name || '', 
                    slug: slug || '' 
                }
            })
            if (countyValues.length > 0) {
                await db.insert(counties).values(countyValues).onConflictDoNothing()
                console.log(`✅ Seeded ${countyValues.length} counties from SQL`)
            }

            // 2. Constituencies
            console.log('📦 Seeding constituencies from SQL...')
            const constituencyRows = extractValues('constituencies')
            const constituencyValues = constituencyRows.map(row => {
                const [id, countyId, code, name, slug] = parseRow(row)
                return { 
                    id: parseInt(id!), 
                    countyId: parseInt(countyId!), 
                    code: code || '', 
                    name: name || '', 
                    slug: slug || '' 
                }
            })
            if (constituencyValues.length > 0) {
                for (let i = 0; i < constituencyValues.length; i += 100) {
                    await db.insert(constituencies).values(constituencyValues.slice(i, i + 100)).onConflictDoNothing()
                }
                console.log(`✅ Seeded ${constituencyValues.length} constituencies from SQL`)
            }

            // 3. Wards
            console.log('📦 Seeding wards from SQL...')
            const wardRows = extractValues('wards')
            const wardValues = wardRows.map(row => {
                const [id, constituencyId, code, name, slug, voters, pollingStations] = parseRow(row)
                return { 
                    id: parseInt(id!), 
                    constituencyId: parseInt(constituencyId!), 
                    code: code || '', 
                    name: name || '', 
                    slug: slug || '', 
                    voters, 
                    pollingStations 
                }
            })
            if (wardValues.length > 0) {
                for (let i = 0; i < wardValues.length; i += 100) {
                    await db.insert(wards).values(wardValues.slice(i, i + 100)).onConflictDoNothing()
                }
                console.log(`✅ Seeded ${wardValues.length} wards from SQL`)
            }
        } else {
            console.warn('⚠️ SQL file not found. Seeding with comprehensive fallback data...')
            
            await db.insert(counties).values(countiesData).onConflictDoNothing()
            
            for (let i = 0; i < constituenciesData.length; i += 100) {
                await db.insert(constituencies).values(constituenciesData.slice(i, i + 100)).onConflictDoNothing()
            }
            
            for (let i = 0; i < wardsData.length; i += 100) {
                await db.insert(wards).values(wardsData.slice(i, i + 100)).onConflictDoNothing()
            }
            
            console.log('✅ Seeded comprehensive fallback location data')
        }

    } catch (error) {
        console.error('❌ Location seeding error:', error)
    }
}


// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedLocations().catch(console.error)
}
