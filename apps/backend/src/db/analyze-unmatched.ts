import { createReadStream, existsSync } from 'fs'
import { createInterface } from 'readline'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const backupPath = resolve(__dirname, '../../sql/meru_county_psb_backup.sql')

function normalizeKey(value: string | null | undefined) {
    return (value ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
}

function getSortedWordsKey(value: string | null | undefined) {
    if (!value) return ''
    return normalizeKey(value)
        .split(' ')
        .filter(w => w.length > 0)
        .sort()
        .join(' ')
}

function matchReferenceId(
    value: string | null,
    entries: Array<{ id: number; name: string }>
) {
    if (!value) return null
    const normalized = normalizeKey(value)
    const direct = entries.find(entry => normalizeKey(entry.name) === normalized)
    if (direct) return direct.id
    
    // Fallback: word-sorted match
    const sortedVal = getSortedWordsKey(value)
    const wordSortedMatch = entries.find(entry => getSortedWordsKey(entry.name) === sortedVal)
    if (wordSortedMatch) return wordSortedMatch.id

    // Fallback: substring match
    for (const entry of entries) {
        const entryKey = normalizeKey(entry.name)
        if (entryKey.includes(normalized) || normalized.includes(entryKey)) return entry.id
    }
    return null
}

async function loadReferenceRows(client: any, tableName: string) {
    const res = await client.query(`SELECT id, name FROM public.${tableName} ORDER BY id`)
    return res.rows as Array<{ id: number; name: string }>
}

async function main() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const client = await pool.connect()

    try {
        const counties = await loadReferenceRows(client, 'counties')
        const constituencies = await loadReferenceRows(client, 'constituencies')
        const wards = await loadReferenceRows(client, 'wards')

        const unmatchedCounties: Record<string, number> = {}
        const unmatchedConstituencies: Record<string, number> = {}
        const unmatchedWards: Record<string, number> = {}

        const fileStream = createReadStream(backupPath)
        const rl = createInterface({ input: fileStream, crlfDelay: Infinity })

        let inCopy = false
        let columns: string[] = []

        for await (const line of rl) {
            if (!inCopy) {
                const match = line.match(/^COPY\s+public\.applicant_profiles\s+\((.+)\)\s+FROM stdin;$/)
                if (match) {
                    columns = match[1].split(',').map(c => c.trim())
                    inCopy = true
                }
                continue
            }

            if (line === '\\.') {
                inCopy = false
                continue
            }

            const parts = line.split('\t')
            const row = Object.fromEntries(columns.map((col, idx) => [col, parts[idx]]))

            const county = row.home_county === '\\N' ? null : row.home_county
            const subCounty = row.home_sub_county === '\\N' ? null : row.home_sub_county
            const ward = row.ward === '\\N' ? null : row.ward

            if (county) {
                const matched = matchReferenceId(county, counties)
                if (!matched) {
                    unmatchedCounties[county] = (unmatchedCounties[county] || 0) + 1
                }
            }

            if (subCounty) {
                const matched = matchReferenceId(subCounty, constituencies)
                if (!matched) {
                    unmatchedConstituencies[`${county} -> ${subCounty}`] = (unmatchedConstituencies[`${county} -> ${subCounty}`] || 0) + 1
                }
            }

            if (ward) {
                const matched = matchReferenceId(ward, wards)
                if (!matched) {
                    unmatchedWards[`${county} / ${subCounty} -> ${ward}`] = (unmatchedWards[`${county} / ${subCounty} -> ${ward}`] || 0) + 1
                }
            }
        }

        console.log('\n--- UNMATCHED COUNTIES ---')
        console.log(Object.entries(unmatchedCounties).sort((a, b) => b[1] - a[1]).slice(0, 30))

        console.log('\n--- UNMATCHED CONSTITUENCIES ---')
        console.log(Object.entries(unmatchedConstituencies).sort((a, b) => b[1] - a[1]).slice(0, 30))

        console.log('\n--- UNMATCHED WARDS ---')
        console.log(Object.entries(unmatchedWards).sort((a, b) => b[1] - a[1]).slice(0, 30))

    } finally {
        client.release()
        await pool.end()
    }
}

main().catch(console.error)
