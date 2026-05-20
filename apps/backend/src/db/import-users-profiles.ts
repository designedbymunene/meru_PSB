import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { Pool, type PoolClient } from 'pg'

dotenv.config()

type CopyBlock = {
    columns: string[]
    rows: Array<Array<string | null>>
}

type LegacyUserRow = Record<string, string | null>
type LegacyProfileRow = Record<string, string | null>

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultBackupCandidates = [
    resolve(__dirname, '../../meru_county_psb_backup.sql'),
    resolve(__dirname, '../../meru_county_psb_current_backup_20260517_170853.sql')
]

function resolveSourcePath(argv: string[]) {
    const sourceFlagIndex = argv.findIndex(arg => arg === '--source' || arg === '-s')
    if (sourceFlagIndex !== -1) {
        const source = argv[sourceFlagIndex + 1]
        if (!source) {
            throw new Error('Missing value for --source')
        }
        const resolved = resolve(process.cwd(), source)
        if (!existsSync(resolved)) {
            throw new Error(`Backup file not found: ${resolved}`)
        }
        return resolved
    }

    const positional = argv.slice(2).find(arg => !arg.startsWith('-'))
    if (positional) {
        const resolved = resolve(process.cwd(), positional)
        if (!existsSync(resolved)) {
            throw new Error(`Backup file not found: ${resolved}`)
        }
        return resolved
    }

    const candidate = defaultBackupCandidates.find(filePath => existsSync(filePath))
    if (!candidate) {
        throw new Error('No backup file found. Pass one with --source <path>.')
    }
    return candidate
}

function normalizeKey(value: string | null | undefined) {
    return (value ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
}

function tokenSet(value: string) {
    return normalizeKey(value)
        .split(' ')
        .filter(Boolean)
        .sort()
        .join(' ')
}

function matchReferenceId(
    value: string | null,
    entries: Array<{ id: number; name: string }>,
    aliases: Record<string, string> = {}
) {
    if (!value) return null

    const normalized = normalizeKey(value)
    const aliasTarget = aliases[normalized]
    const candidates = aliasTarget ? [aliasTarget, normalized] : [normalized]

    for (const candidate of candidates) {
        const direct = entries.find(entry => normalizeKey(entry.name) === candidate)
        if (direct) return direct.id
    }

    const tokenized = tokenSet(value)
    if (tokenized) {
        const tokenMatch = entries.find(entry => tokenSet(entry.name) === tokenized)
        if (tokenMatch) return tokenMatch.id
    }

    for (const entry of entries) {
        const entryKey = normalizeKey(entry.name)
        if (entryKey.includes(normalized) || normalized.includes(entryKey)) {
            return entry.id
        }
    }

    return null
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
            case 'b':
                result += '\b'
                break
            case 'f':
                result += '\f'
                break
            case 'n':
                result += '\n'
                break
            case 'r':
                result += '\r'
                break
            case 't':
                result += '\t'
                break
            case 'v':
                result += '\v'
                break
            case '\\':
                result += '\\'
                break
            default:
                result += next
                break
        }
    }

    return result
}

function parseCopyBlocks(sql: string, wantedTables: Set<string>) {
    const blocks = new Map<string, CopyBlock>()
    const lines = sql.split(/\r?\n/)
    let currentTable: string | null = null
    let currentColumns: string[] = []
    let currentRows: Array<Array<string | null>> = []

    for (const line of lines) {
        if (!currentTable) {
            const match = line.match(/^COPY\s+public\.([a-z_]+)\s+\((.+)\)\s+FROM stdin;$/)
            if (match && wantedTables.has(match[1])) {
                currentTable = match[1]
                currentColumns = match[2].split(',').map(part => part.trim())
                currentRows = []
            }
            continue
        }

        if (line === '\\.') {
            blocks.set(currentTable, { columns: currentColumns, rows: currentRows })
            currentTable = null
            currentColumns = []
            currentRows = []
            continue
        }

        currentRows.push(line.split('\t').map(unescapeCopyField))
    }

    return blocks
}

function rowsToObjects(block: CopyBlock) {
    return block.rows.map(row => Object.fromEntries(block.columns.map((column, index) => [column, row[index] ?? null]))) as Array<Record<string, string | null>>
}

function parseBool(value: string | null) {
    if (value === null) return null
    return value === 't' || value === 'true' || value === '1'
}

function emptyToNull(value: string | null | undefined) {
    if (value === null) return null
    if (value === undefined) return null
    const trimmed = value.trim()
    return trimmed.length > 0 ? value : null
}

function yearToDate(value: string | null) {
    if (!value) return null
    const trimmed = value.trim()
    if (!/^\d{4}$/.test(trimmed)) return null
    return `${trimmed}-01-01`
}

function chunk<T>(values: T[], size: number) {
    const result: T[][] = []
    for (let index = 0; index < values.length; index += size) {
        result.push(values.slice(index, index + size))
    }
    return result
}

async function loadReferenceRows(
    client: PoolClient,
    tableName: string
) {
    const exists = await client.query(
        'select to_regclass($1) is not null as exists',
        [`public.${tableName}`]
    )

    if (!exists.rows[0]?.exists) {
        return [] as Array<{ id: number; name: string }>
    }

    const rows = await client.query(`select id, name from public.${tableName} order by id`)
    return rows.rows as Array<{ id: number; name: string }>
}

async function usesIdentityColumns(client: PoolClient, tableName: string) {
    const result = await client.query(
        `select column_name, is_identity
         from information_schema.columns
         where table_schema = 'public' and table_name = $1 and column_name = 'id'`,
        [tableName]
    )

    return result.rows[0]?.is_identity === 'YES'
}

async function tableColumns(client: PoolClient, tableName: string) {
    const result = await client.query(
        `select column_name
         from information_schema.columns
         where table_schema = 'public' and table_name = $1
         order by ordinal_position`,
        [tableName]
    )

    return result.rows.map((row: any) => row.column_name as string)
}

async function main() {
    const sourcePath = resolveSourcePath(process.argv)
    const sql = await readFile(sourcePath, 'utf8')

    const blocks = parseCopyBlocks(
        sql,
        new Set(['users', 'applicant_profiles'])
    )

    const usersBlock = blocks.get('users')
    const profilesBlock = blocks.get('applicant_profiles')

    if (!usersBlock || !profilesBlock) {
        throw new Error('The source dump must include both public.users and public.applicant_profiles COPY blocks.')
    }

    const users = rowsToObjects(usersBlock) as LegacyUserRow[]
    const profiles = rowsToObjects(profilesBlock) as LegacyProfileRow[]

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10
    })

    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        const ethnicities = await loadReferenceRows(client, 'ethnicities')
        const counties = await loadReferenceRows(client, 'counties')
        const constituencies = await loadReferenceRows(client, 'constituencies')
        const wards = await loadReferenceRows(client, 'wards')

        const userById = new Map<number, LegacyUserRow>()
        for (const user of users) {
            const userId = Number(user.id)
            if (!Number.isNaN(userId)) {
                userById.set(userId, user)
            }
        }

        const profileByUserId = new Map<number, LegacyProfileRow>()
        for (const profile of profiles) {
            const userId = Number(profile.user_id)
            if (!Number.isNaN(userId)) {
                profileByUserId.set(userId, profile)
            }
        }

        const legacyEthnicityAliases: Record<string, string> = {
            ameru: 'ameru',
            meru: 'ameru',
            kenyan: 'other',
            kenya: 'other',
            other: 'other'
        }

        const usersToInsert = users.map(user => {
            const id = Number(user.id)
            const profile = profileByUserId.get(id)
            const phoneNumber = emptyToNull(user.phone_number)
                ?? emptyToNull(profile?.phone)
                ?? emptyToNull(user.email)
            const fullName = emptyToNull(user.full_name)

            if (!phoneNumber) {
                throw new Error(`Unable to resolve phone number for user ${id}`)
            }

            return {
                id,
                username: fullName ?? emptyToNull(user.email) ?? `user-${id}`,
                email: emptyToNull(user.email),
                phone_number: phoneNumber,
                password: emptyToNull(user.password),
                full_name: fullName,
                role: emptyToNull(user.role) ?? 'applicant',
                token_version: user.token_version ? Number(user.token_version) : 0,
                two_factor_enabled: parseBool(user.two_factor_enabled) ?? false,
                failed_login_attempts: user.failed_login_attempts ? Number(user.failed_login_attempts) : 0,
                is_locked: parseBool(user.is_locked) ?? false,
                lockout_until: emptyToNull(user.lockout_until),
                push_token: emptyToNull(user.push_token),
                created_at: emptyToNull(user.created_at),
                updated_at: emptyToNull(user.updated_at)
            }
        })

        const profilesToInsert = profiles.map(profile => {
            const id = Number(profile.id)
            const userId = Number(profile.user_id)
            const sourceIsCurrentSchema = Object.prototype.hasOwnProperty.call(profile, 'full_name')

            const ethnicityValue = sourceIsCurrentSchema
                ? profile.ethnicity_id
                : profile.ethnicity

            const countyValue = sourceIsCurrentSchema
                ? profile.home_county_id
                : profile.home_county

            const constituencyValue = sourceIsCurrentSchema
                ? profile.home_sub_county_id
                : profile.home_sub_county

            const wardValue = sourceIsCurrentSchema
                ? profile.ward_id
                : profile.ward

            const dateOfBirth = sourceIsCurrentSchema
                ? emptyToNull(profile.date_of_birth)
                : yearToDate(profile.birth_year)

            const fullName = sourceIsCurrentSchema
                ? emptyToNull(profile.full_name)
                : emptyToNull(profile.applicant_name)

            const phoneNumber = sourceIsCurrentSchema
                ? emptyToNull(profile.phone_number)
                : emptyToNull(profile.phone) ?? emptyToNull(userById.get(userId)?.phone_number) ?? emptyToNull(userById.get(userId)?.email)

            const birthYear = sourceIsCurrentSchema
                ? (dateOfBirth ? Number(dateOfBirth.slice(0, 4)) : 0)
                : (profile.birth_year ? Number(profile.birth_year) : 0)

            const ethnicityId = sourceIsCurrentSchema
                ? (profile.ethnicity_id ? Number(profile.ethnicity_id) : null)
                : matchReferenceId(ethnicityValue, ethnicities, legacyEthnicityAliases)

            const homeCountyId = sourceIsCurrentSchema
                ? (profile.home_county_id ? Number(profile.home_county_id) : null)
                : matchReferenceId(countyValue, counties)

            const homeSubCountyId = sourceIsCurrentSchema
                ? (profile.home_sub_county_id ? Number(profile.home_sub_county_id) : null)
                : matchReferenceId(constituencyValue, constituencies)

            const wardId = sourceIsCurrentSchema
                ? (profile.ward_id ? Number(profile.ward_id) : null)
                : matchReferenceId(wardValue, wards)

            return {
                id,
                user_id: userId,
                applicant_name: fullName ?? `Applicant ${id}`,
                full_name: fullName,
                id_number: emptyToNull(profile.id_number),
                gender: emptyToNull(profile.gender) ?? 'Unknown',
                birth_year: birthYear,
                ethnicity: sourceIsCurrentSchema ? null : emptyToNull(profile.ethnicity),
                phone: phoneNumber ?? null,
                home_county: sourceIsCurrentSchema ? null : emptyToNull(profile.home_county),
                home_sub_county: sourceIsCurrentSchema ? null : emptyToNull(profile.home_sub_county),
                ward: sourceIsCurrentSchema ? null : emptyToNull(profile.ward),
                date_of_birth: dateOfBirth,
                phone_number: phoneNumber ?? null,
                email: emptyToNull(profile.email),
                impairment: parseBool(profile.impairment) ?? false,
                impairment_details: emptyToNull(profile.impairment_details),
                public_service_info: emptyToNull(profile.public_service_info),
                personal_number: emptyToNull(profile.personal_number),
                ethnicity_id: ethnicityId,
                home_county_id: homeCountyId,
                home_sub_county_id: homeSubCountyId,
                ward_id: wardId,
                has_no_experience: sourceIsCurrentSchema ? (parseBool(profile.has_no_experience) ?? false) : false,
                has_no_certificates: sourceIsCurrentSchema ? (parseBool(profile.has_no_certificates) ?? false) : false,
                has_no_memberships: sourceIsCurrentSchema ? (parseBool(profile.has_no_memberships) ?? false) : false,
                has_no_trainings: sourceIsCurrentSchema ? (parseBool(profile.has_no_trainings) ?? false) : false,
                has_no_referees: sourceIsCurrentSchema ? (parseBool(profile.has_no_referees) ?? false) : false,
                created_at: emptyToNull(profile.created_at),
                updated_at: emptyToNull(profile.updated_at)
            }
        })

        const userColumns = [
            'id',
            'username',
            'email',
            'phone_number',
            'password',
            'full_name',
            'role',
            'token_version',
            'two_factor_enabled',
            'failed_login_attempts',
            'is_locked',
            'lockout_until',
            'push_token',
            'created_at',
            'updated_at'
        ]

        const profileColumns = [
            'id',
            'user_id',
            'applicant_name',
            'full_name',
            'id_number',
            'gender',
            'birth_year',
            'ethnicity',
            'phone',
            'home_county',
            'home_sub_county',
            'ward',
            'date_of_birth',
            'phone_number',
            'email',
            'impairment',
            'impairment_details',
            'public_service_info',
            'personal_number',
            'ethnicity_id',
            'home_county_id',
            'home_sub_county_id',
            'ward_id',
            'has_no_experience',
            'has_no_certificates',
            'has_no_memberships',
            'has_no_trainings',
            'has_no_referees',
            'created_at',
            'updated_at'
        ]

        const insertBatch = async (tableName: string, columns: string[], rows: unknown[][], overrideSystemValue: boolean) => {
            for (const batch of chunk(rows, 100)) {
                const placeholders = batch.map((row, rowIndex) => {
                    const values = row.map((_, columnIndex) => `$${rowIndex * columns.length + columnIndex + 1}`)
                    return `(${values.join(', ')})`
                })

                const flattened = batch.flat()
                await client.query(
                    `INSERT INTO public.${tableName} (${columns.join(', ')}) ${overrideSystemValue ? 'OVERRIDING SYSTEM VALUE' : ''} VALUES ${placeholders.join(', ')} ON CONFLICT DO NOTHING`,
                    flattened
                )
            }
        }

        const liveUserColumns = new Set(await tableColumns(client, 'users'))
        const liveProfileColumns = new Set(await tableColumns(client, 'applicant_profiles'))
        const usersUseIdentity = await usesIdentityColumns(client, 'users')
        const profilesUseIdentity = await usesIdentityColumns(client, 'applicant_profiles')

        await insertBatch(
            'users',
            userColumns.filter(column => liveUserColumns.has(column)),
            usersToInsert.map(user => userColumns.filter(column => liveUserColumns.has(column)).map(column => (user as Record<string, unknown>)[column])),
            usersUseIdentity
        )

        await insertBatch(
            'applicant_profiles',
            profileColumns.filter(column => liveProfileColumns.has(column)),
            profilesToInsert.map(profile => profileColumns.filter(column => liveProfileColumns.has(column)).map(column => (profile as Record<string, unknown>)[column])),
            profilesUseIdentity
        )

        await client.query(
            `SELECT setval(pg_get_serial_sequence('public.users', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM public.users), 999), 999), true)`
        )
        await client.query(
            `SELECT setval(pg_get_serial_sequence('public.applicant_profiles', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM public.applicant_profiles), 999), 999), true)`
        )

        await client.query('COMMIT')

        console.log(`✅ Imported ${usersToInsert.length} users and ${profilesToInsert.length} applicant profiles from ${sourcePath}`)
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
        await pool.end()
    }
}

main().catch(error => {
    console.error('❌ User/profile import failed:', error)
    process.exit(1)
})
