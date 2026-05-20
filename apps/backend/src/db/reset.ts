import dotenv from 'dotenv'
import { Pool, type PoolClient } from 'pg'

dotenv.config()

function quoteIdentifier(identifier: string) {
    return `"${identifier.replace(/"/g, '""')}"`
}

async function getPublicTableNames(client: PoolClient) {
    const result = await client.query(
        `SELECT tablename
         FROM pg_tables
         WHERE schemaname = 'public'
         ORDER BY tablename`
    )

    return result.rows.map((row: { tablename: string }) => row.tablename)
}

/**
 * Completely wipes the database for a fresh seed.
 * BE CAREFUL: This deletes ALL data in the public schema tables.
 */
export async function resetDatabase() {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
        throw new Error('DATABASE_URL is required')
    }

    console.warn('⚠️  WARNING: Resetting database...')

    const pool = new Pool({ connectionString: databaseUrl })
    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        const tableNames = await getPublicTableNames(client)
        if (tableNames.length === 0) {
            console.log('ℹ️ No public tables found to reset.')
            await client.query('COMMIT')
            return
        }

        const tables = tableNames.map((name: string) => `public.${quoteIdentifier(name)}`).join(', ')
        await client.query(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`)

        await client.query('COMMIT')
        console.log('✅ Database wiped successfully.')
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('❌ Database wipe failed:', error)
        throw error
    } finally {
        client.release()
        await pool.end()
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    resetDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
}
