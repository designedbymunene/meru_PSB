import { createReadStream, existsSync } from 'fs'
import { createInterface } from 'readline'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))

type CopyBlock = {
    tableName: string
    columns: string[]
}

function resolveSourcePath(argv: string[]) {
    const sourceFlagIndex = argv.findIndex(arg => arg === '--source' || arg === '-s')
    if (sourceFlagIndex !== -1) {
        const source = argv[sourceFlagIndex + 1]
        if (!source) throw new Error('Missing value for --source')
        const resolved = resolve(process.cwd(), source)
        if (!existsSync(resolved)) throw new Error(`Backup file not found: ${resolved}`)
        return resolved
    }
    const defaultBackup = resolve(__dirname, '../../sql/meru_county_psb_backup.sql')
    if (existsSync(defaultBackup)) return defaultBackup
    throw new Error('No backup file found. Pass one with --source <path>.')
}

function unescapeCopyField(value: string) {
    if (value === '\\N') return null
    let result = ''
    for (let i = 0; i < value.length; i += 1) {
        const char = value[i]
        if (char !== '\\' || i === value.length - 1) {
            result += char
            continue
        }
        const next = value[++i]
        switch (next) {
            case 'b': result += '\b'; break
            case 'f': result += '\f'; break
            case 'n': result += '\n'; break
            case 'r': result += '\r'; break
            case 't': result += '\t'; break
            case 'v': result += '\v'; break
            case '\\': result += '\\'; break
            default: result += next; break
        }
    }
    return result
}

function emptyToNull(value: string | null | undefined) {
    if (value === null || value === undefined) return null
    const trimmed = value.trim()
    return trimmed.length > 0 ? value : null
}

const countyAliases: Record<string, string> = {
    'muranga': "Murang'a",
    'homabay': 'Homa Bay',
    'tharakanithi': 'Tharaka-Nithi',
    'uasingishu': 'Uasin Gishu',
    'transnzoia': 'Trans-Nzoia',
    'elgeiyomarakwet': 'Elgeyo-Marakwet',
    'elgeyomarakwet': 'Elgeyo-Marakwet',
    'mery': 'Meru',
    'meeu': 'Meru',
    'mwru': 'Meru',
    'metu': 'Meru',
    'meri': 'Meru',
    'maua': 'Meru',
    'nkubu': 'Meru',
    'muthara': 'Meru',
    'chuka': 'Tharaka-Nithi',
    'eldoret': 'Uasin Gishu',
    'nanyuki': 'Laikipia',
    'kitale': 'Trans-Nzoia',
    'tranzoia': 'Trans-Nzoia',
}

const constituencyAliases: Record<string, string> = {
    'tiganiacentral': 'Tigania West',
    'mutuati': 'Igembe North',
    'kiengu': 'Igembe Central',
    'merucentral': 'Central Imenti',
    'imentieast': 'South Imenti',
    'embueast': 'Runyenjes',
    'embuwest': 'Manyatta',
    'nakurueast': 'Nakuru Town East',
    'abogeta': 'South Imenti',
    'igoji': 'South Imenti',
    'maua': 'Igembe South',
    'nyahururu': 'Laikipia West',
}

const wardAliases: Record<string, string> = {
    'akirangondu': "Akirang'Ondu",
    'kiegoiantobochiu': 'Kiegoi/Antubochiu',
    'kiegoiantubochiu': 'Kiegoi/Antubochiu',
    'abowest': 'Abothuguchi West',
    'antubetwekiongo': 'Antubetwe Kiongo',
    'akiongo': 'Antubetwe Kiongo',
    'kiiruanaaari': 'Kiirua/Naari',
    'kiiruanaari': 'Kiirua/Naari',
}

function cleanString(str: string | null | undefined): string {
    if (!str) return ''
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
}

function matchReferenceId(
    value: string | null,
    entries: Array<{ id: number; name: string }>
) {
    if (!value) return null
    const cleanedValue = cleanString(value)
    if (!cleanedValue) return null

    // 1. Direct clean match
    const direct = entries.find(entry => cleanString(entry.name) === cleanedValue)
    if (direct) return direct.id

    // 2. Sorted words clean match (handles swapped word order e.g. "Imenti Central" vs "Central Imenti")
    const getSortedWords = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean).sort().join('')
    const sortedValue = getSortedWords(value)
    const sortedMatch = entries.find(entry => getSortedWords(entry.name) === sortedValue)
    if (sortedMatch) return sortedMatch.id

    // 3. Substring clean match
    for (const entry of entries) {
        const cleanedEntry = cleanString(entry.name)
        if (cleanedEntry.includes(cleanedValue) || cleanedValue.includes(cleanedEntry)) {
            return entry.id
        }
    }

    return null
}

function matchCounty(value: string | null, counties: Array<{ id: number; name: string }>) {
    if (!value) return null
    const cleaned = cleanString(value)
    const aliasName = countyAliases[cleaned]
    if (aliasName) {
        const matched = counties.find(c => cleanString(c.name) === cleanString(aliasName))
        if (matched) return matched.id
    }
    return matchReferenceId(value, counties)
}

function matchConstituency(value: string | null, countyId: number | null, constituencies: Array<{ id: number; name: string; countyId: number }>) {
    if (!value) return null
    const cleaned = cleanString(value)
    const filtered = countyId ? constituencies.filter((c: any) => c.countyId === countyId) : constituencies

    const aliasName = constituencyAliases[cleaned]
    if (aliasName) {
        const matched = filtered.find(c => cleanString(c.name) === cleanString(aliasName))
        if (matched) return matched.id
    }

    return matchReferenceId(value, filtered)
}

function getRuleBasedWardAlias(cleaned: string): string | null {
    if (cleaned.includes('kiegoi') || cleaned.includes('antubochiu') || cleaned.includes('antobochiu')) return 'Kiegoi/Antubochiu';
    if (cleaned.includes('akirang')) return "Akirang'Ondu";
    if (cleaned.includes('abowest') || cleaned.includes('abothuguchiwest')) return 'Abothuguchi West';
    if (cleaned.includes('aboeast') || cleaned.includes('abothuguchieast')) return 'Abothuguchi East';
    if (cleaned.includes('abocentral') || cleaned.includes('abothuguchicentral')) return 'Abothuguchi Central';
    if (cleaned.includes('kiongo')) return 'Antubetwe Kiongo';
    if (cleaned.includes('kiirua') || cleaned.includes('naari')) return 'Kiirua/Naari';
    if (cleaned.includes('kigucwa') || cleaned.includes('kiguchwa')) return 'Kiguchwa';
    if (cleaned.includes('mirigamieruwest') || cleaned.includes('mirigamieruw')) return 'Ntima West';
    if (cleaned.includes('mirigamierueast') || cleaned.includes('mirigamierue')) return 'Ntima East';
    if (cleaned.includes('sobea') || cleaned.includes('visoi')) return 'Visoi';
    if (cleaned.includes('kagaarib') || cleaned.includes('kagaarinorth')) return 'Kagaari North';
    if (cleaned.includes('kagaarisouth')) return 'Kagaari South';
    if (cleaned.includes('kagaari')) {
        if (cleaned.includes('n') || cleaned.includes('w')) return 'Kagaari North';
        if (cleaned.includes('s')) return 'Kagaari South';
        return 'Kagaari North'; // default fallback
    }
    return null;
}

function matchWard(value: string | null, constituencyId: number | null, wards: Array<{ id: number; name: string; constituencyId: number }>) {
    if (!value) return null
    const cleaned = cleanString(value)
    const filtered = constituencyId ? wards.filter((w: any) => w.constituencyId === constituencyId) : wards

    const aliasName = wardAliases[cleaned] || getRuleBasedWardAlias(cleaned)
    if (aliasName) {
        const matched = filtered.find(w => cleanString(w.name) === cleanString(aliasName))
        if (matched) return matched.id
    }

    return matchReferenceId(value, filtered)
}

async function loadReferenceRows(client: any, tableName: string) {
    let query = `SELECT id, name FROM public.${tableName} ORDER BY id`
    if (tableName === 'constituencies') {
        query = `SELECT id, name, county_id as "countyId" FROM public.${tableName} ORDER BY id`
    } else if (tableName === 'wards') {
        query = `SELECT id, name, constituency_id as "constituencyId" FROM public.${tableName} ORDER BY id`
    }
    const res = await client.query(query)
    return res.rows
}

async function getTableColumns(client: any, tableName: string) {
    const res = await client.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
        [tableName]
    )
    return res.rows.map((r: any) => r.column_name)
}

async function insertBatch(client: any, tableName: string, columns: string[], rows: any[][], conflictTarget: string = 'id') {
    if (rows.length === 0) return
    const placeholders = rows.map((row, rowIndex) => 
        `(${row.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(', ')})`
    ).join(', ')
    const flattened = rows.flat()
    const query = `INSERT INTO public.${tableName} (${columns.join(', ')}) OVERRIDING SYSTEM VALUE VALUES ${placeholders} ON CONFLICT (${conflictTarget}) DO NOTHING`
    await client.query(query, flattened)
}


async function main() {
    const sourcePath = resolveSourcePath(process.argv)
    console.log(`🚀 Starting comprehensive import from: ${sourcePath}`)

    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        const ethnicities = await loadReferenceRows(client, 'ethnicities')
        const counties = await loadReferenceRows(client, 'counties')
        const constituencies = await loadReferenceRows(client, 'constituencies')
        const wards = await loadReferenceRows(client, 'wards')

        const tableColumnMetadata: Record<string, string[]> = {}
        const counts: Record<string, number> = {}
        const wantedTables = [
            'job_groups', 'departments', 'users', 'applicant_profiles', 'qualifications', 'employment_history',
            'professional_memberships', 'professional_details', 'training_courses', 'referees', 'applications'
        ]
        
        console.log('🧹 Truncating tables...')
        for (const t of wantedTables.slice().reverse()) {
            await client.query(`TRUNCATE TABLE public.${t} RESTART IDENTITY CASCADE`)
        }

        for (const t of wantedTables) {
            tableColumnMetadata[t] = await getTableColumns(client, t)
            console.log(`🔍 Columns for ${t}: ${tableColumnMetadata[t].join(', ')}`)
        }

        const refs = { ethnicities, counties, constituencies, wards }

        // Pass 0: Job Groups and Departments
        console.log('🏁 Pass 0: Importing Job Groups and Departments...')
        await processPass(sourcePath, ['job_groups', 'departments'], client, tableColumnMetadata, refs, counts)

        // Pass 1: Users only
        console.log('🏁 Pass 1: Importing Users...')
        await processPass(sourcePath, ['users'], client, tableColumnMetadata, refs, counts)

        // Pass 2: Everything else
        console.log('🏁 Pass 2: Importing Profiles and Related Data...')
        const otherTables = wantedTables.filter(t => !['users', 'job_groups', 'departments'].includes(t))
        await processPass(sourcePath, otherTables, client, tableColumnMetadata, refs, counts)

        console.log('🔄 Syncing phone numbers from profiles to users...')
        // We use a multi-step approach to avoid unique constraint violations during update
        await client.query(`
            CREATE TEMP TABLE profile_phone_map AS
            SELECT DISTINCT ON (phone_number) user_id, phone_number
            FROM public.applicant_profiles
            WHERE phone_number IS NOT NULL AND phone_number != ''
            ORDER BY phone_number, created_at DESC
        `)
        
        await client.query(`
            UPDATE public.users u
            SET phone_number = m.phone_number
            FROM profile_phone_map m
            WHERE u.id = m.user_id
              AND NOT EXISTS (
                  SELECT 1 FROM public.users u2 
                  WHERE u2.phone_number = m.phone_number 
                    AND u2.id != u.id
              )
        `)
        
        await client.query(`DROP TABLE profile_phone_map`)

        console.log('🔄 Updating sequences...')

        for (const t of wantedTables) {
            await client.query(`SELECT setval(pg_get_serial_sequence('public.${t}', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM public.${t}), 999), 999), true)`)
        }

        await client.query('COMMIT')
        console.log('✅ Import completed successfully!')
        Object.entries(counts).forEach(([table, count]) => console.log(`   - ${table}: ${count} rows`))

    } catch (error) {
        await client.query('ROLLBACK')
        console.error('❌ Import failed:', error)
    } finally {
        client.release()
        await pool.end()
    }
}

async function processPass(sourcePath: string, wantedTables: string[], client: any, tableColumnMetadata: any, refs: any, counts: Record<string, number>) {
    const fileStream = createReadStream(sourcePath)
    const rl = createInterface({ input: fileStream, crlfDelay: Infinity })

    let currentBlock: CopyBlock | null = null
    let batch: any[] = []
    let pendingLine = ''
    const BATCH_SIZE = 500

    for await (const line of rl) {
        if (!currentBlock) {
            const match = line.match(/^COPY\s+public\.([a-z_]+)\s+\((.+)\)\s+FROM stdin;$/)
            if (match && wantedTables.includes(match[1])) {
                currentBlock = {
                    tableName: match[1],
                    columns: match[2].split(',').map(c => c.trim())
                }
                batch = []
                pendingLine = ''
                console.log(`📦 Processing ${currentBlock.tableName}...`)
            }
            continue
        }

        if (line === '\\.') {
            if (batch.length > 0) {
                await processAndInsertBatch(client, currentBlock, batch, { ...refs, tableColumnMetadata })
                counts[currentBlock.tableName] = (counts[currentBlock.tableName] || 0) + batch.length
            }
            currentBlock = null
            batch = []
            pendingLine = ''
            continue
        }

        const combinedLine = pendingLine ? pendingLine + '\n' + line : line
        const tabCount = (combinedLine.match(/\t/g) || []).length

        if (tabCount < currentBlock.columns.length - 1) {
            pendingLine = combinedLine
            continue
        }

        pendingLine = ''
        const rawRow = combinedLine.split('\t').map(unescapeCopyField)
        const rowObj = Object.fromEntries(currentBlock.columns.map((col, i) => [col, rawRow[i]]))
        batch.push(rowObj)

        if (batch.length >= BATCH_SIZE) {
            await processAndInsertBatch(client, currentBlock, batch, { ...refs, tableColumnMetadata })
            counts[currentBlock.tableName] = (counts[currentBlock.tableName] || 0) + batch.length
            batch = []
        }
    }
}

async function processAndInsertBatch(client: any, block: CopyBlock, rows: any[], refs: any) {
    const { tableName } = block
    const targetColumns = refs.tableColumnMetadata[tableName]
    let transformedRows: any[][] = []

    if (tableName === 'users') {
        transformedRows = rows.map(r => {
            const data: any = { ...r }
            const phone = emptyToNull(r.phone_number) || emptyToNull(r.phone)
            data.phone_number = phone || `0700${r.id}`
            if (data.phone_number.length > 20) data.phone_number = data.phone_number.slice(0, 20)
            data.token_version = r.token_version || 0
            data.two_factor_enabled = r.two_factor_enabled || false
            data.failed_login_attempts = r.failed_login_attempts || 0
            data.is_locked = r.is_locked || false
            return targetColumns.map((col: string) => data[col] ?? null)
        })
    } else if (tableName === 'applicant_profiles') {
        transformedRows = rows.map(r => {
            const data: any = { ...r }
            data.full_name = emptyToNull(r.full_name) || emptyToNull(r.applicant_name)
            data.phone_number = emptyToNull(r.phone_number) || emptyToNull(r.phone) || emptyToNull(r.email)
            data.ethnicity_id = matchReferenceId(r.ethnicity, refs.ethnicities)
            
            // Optimized hierarchical location matching
            const homeCountyId = matchCounty(r.home_county, refs.counties)
            data.home_county_id = homeCountyId

            // Filter wards under this county to narrow search space and prevent cross-county duplicates
            const countyConstituencyIds = homeCountyId 
                ? refs.constituencies.filter((c: any) => c.countyId === homeCountyId).map((c: any) => c.id)
                : []
            const countyWards = countyConstituencyIds.length > 0
                ? refs.wards.filter((w: any) => countyConstituencyIds.includes(w.constituencyId))
                : refs.wards

            const wardId = matchWard(r.ward, null, countyWards)
            data.ward_id = wardId

            // Resolve Constituency
            let homeSubCountyId: number | null = null
            if (wardId) {
                const matchedWard = refs.wards.find((w: any) => w.id === wardId)
                if (matchedWard) {
                    homeSubCountyId = matchedWard.constituencyId
                }
            }
            if (!homeSubCountyId && r.home_sub_county) {
                homeSubCountyId = matchConstituency(r.home_sub_county, homeCountyId, refs.constituencies)
            }
            data.home_sub_county_id = homeSubCountyId

            // Residence location - default to home
            data.residence_county_id = data.home_county_id
            data.residence_sub_county_id = data.home_sub_county_id
            data.residence_ward_id = data.ward_id

            data.date_of_birth = r.date_of_birth || (r.birth_year ? `${r.birth_year}-01-01` : null)
            data.has_no_experience = r.has_no_experience || false
            data.has_no_certificates = r.has_no_certificates || false
            data.has_no_memberships = r.has_no_memberships || false
            data.has_no_trainings = r.has_no_trainings || false
            data.has_no_referees = r.has_no_referees || false
            return targetColumns.map((col: string) => data[col] ?? null)
        })
    } else {
        // Generic mapping for simple tables with common legacy field handling
        transformedRows = rows.map(r => {
            const data: any = { ...r }
            
            // Map applicant_id to applicant_profile_id if needed for child tables
            if (!data.applicant_profile_id && (r.applicant_id || r.profile_id)) {
                data.applicant_profile_id = r.applicant_id || r.profile_id
            }

            if (tableName === 'qualifications') {
                data.level = r.level || r.education_level || 'UNKNOWN'
                data.course = r.course || r.specialization || r.course_name || 'General'
                data.institution = r.institution || r.institution_name || r.university || 'Unknown Institution'
            }

            if (tableName === 'professional_details') {
                data.issuing_body = r.issuing_body || r.registration_body
                data.license_type = r.license_type || 'Professional Registration'
                data.issue_date = r.issue_date || (r.created_at ? r.created_at.split(' ')[0] : '2000-01-01')
            }

            if (tableName === 'employment_history') {
                data.start_date = r.start_date || (r.from_date ? r.from_date.split(' ')[0] : '2000-01-01')
                data.job_title = r.job_title || r.designation || 'Staff'
            }

            return targetColumns.map((col: string) => data[col] ?? null)
        })
    }

    await insertBatch(client, tableName, targetColumns, transformedRows, 'id')
}

main().catch(console.error)
