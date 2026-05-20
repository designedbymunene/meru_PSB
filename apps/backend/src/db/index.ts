import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { schema as schemaObject } from './schema'
import { getDbConfig } from '../utils/env'

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: getDbConfig().DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
})

// Initialize Drizzle with schema for relational queries
// The schema object enables the query API (db.query.*)
export const db = drizzle({ client: pool, schema: schemaObject })

// Export all schema types and tables
export * from './schema'
