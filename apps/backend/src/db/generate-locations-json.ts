import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function cleanString(val: string | null): string {
    if (!val) return ''
    // Unescape SQL escapes: \\' -> ', \' -> ', \\\' -> '
    let cleaned = val
        .replace(/\\+'/g, "'")
        .replace(/\\+/g, "")
        .trim()
    
    // Normalize spacing around slashes: e.g. "Chuka/ Igambang'ombe" -> "Chuka/Igambang'ombe"
    cleaned = cleaned.replace(/\s*\/\s*/g, '/')
    
    // Normalize smart/curly quotes to straight quotes if necessary
    cleaned = cleaned.replace(/[‘’]/g, "'")

    return cleaned
}

function parseSqlValues(sqlContent: string, tableName: string): any[][] {
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
    
    // Pass 1: Extract individual tuples "(...)"
    while (currentPos < rowsRaw.length) {
        const char = rowsRaw[currentPos]
        const prevChar = currentPos > 0 ? rowsRaw[currentPos - 1] : ''

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

    // Pass 2: Parse fields within each tuple
    return rows.map(row => {
        const values: string[] = []
        let current = ''
        let insideStr = false
        
        for (let i = 0; i < row.length; i++) {
            const char = row[i]
            const prev = i > 0 ? row[i - 1] : ''
            
            if (char === "'" && prev !== '\\') {
                insideStr = !insideStr
                continue
            }
            
            if (char === ',' && !insideStr) {
                values.push(current.trim())
                current = ''
            } else {
                current += char
            }
        }
        values.push(current.trim())
        
        // Convert 'NULL' and unwrap string quotes
        return values.map(v => {
            if (v === 'NULL') return null
            return v
        })
    })
}

async function main() {
    const sqlPath = path.resolve(__dirname, '../../sql/kenya20260430.sql')
    const outputPath = path.resolve(__dirname, 'locations_fixed.json')

    console.log(`📖 Reading SQL dump from: ${sqlPath}`)
    if (!fs.existsSync(sqlPath)) {
        console.error(`❌ SQL dump not found at ${sqlPath}`)
        process.exit(1)
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    // 1. Counties
    console.log('Parsing counties...')
    const countyRows = parseSqlValues(sqlContent, 'counties')
    const counties = countyRows.map(row => {
        const [id, code, name, slug] = row
        return {
            id: parseInt(id),
            code: cleanString(code),
            name: cleanString(name),
            slug: cleanString(slug)
        }
    })
    console.log(`Parsed ${counties.length} counties.`)

    // 2. Constituencies
    console.log('Parsing constituencies...')
    const constituencyRows = parseSqlValues(sqlContent, 'constituencies')
    const constituencies = constituencyRows.map(row => {
        const [id, countyId, code, name, slug] = row
        return {
            id: parseInt(id),
            countyId: parseInt(countyId),
            code: cleanString(code),
            name: cleanString(name),
            slug: cleanString(slug)
        }
    })
    console.log(`Parsed ${constituencies.length} constituencies.`)

    // 3. Wards
    console.log('Parsing wards...')
    const wardRows = parseSqlValues(sqlContent, 'wards')
    const wards = wardRows.map(row => {
        const [id, constituencyId, code, name, slug, voters, pollingStations] = row
        return {
            id: parseInt(id),
            constituencyId: parseInt(constituencyId),
            code: cleanString(code),
            name: cleanString(name),
            slug: cleanString(slug),
            voters: cleanString(voters),
            pollingStations: cleanString(pollingStations)
        }
    })
    console.log(`Parsed ${wards.length} wards.`)

    const outputData = {
        counties,
        constituencies,
        wards
    }

    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8')
    console.log(`✅ Saved complete location dataset to: ${outputPath}`)
}

main().catch(console.error)
