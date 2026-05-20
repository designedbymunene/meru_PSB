import type { Pool } from 'pg'

export type DbHealthReport = {
    status: 'up' | 'down'
    responseTimeMs?: number
    poolSize?: number
    idleCount?: number
    waitingCount?: number
    error?: string
}

export type MemoryHealthReport = {
    status: 'up' | 'warning'
    heapUsedMB: number
    heapTotalMB: number
    rssMB: number
    warning?: string
}

export type HealthReport = {
    status: 'healthy' | 'degraded' | 'unhealthy'
    version: string
    uptimeSeconds: number
    timestamp: string
    checks: {
        database: DbHealthReport
        memory: MemoryHealthReport
    }
}

export async function checkDatabase(pool: Pool): Promise<DbHealthReport> {
    const start = Date.now()
    try {
        // Query selective system view to check connectivity with timeout
        const client = await pool.connect()
        try {
            await client.query('SELECT 1')
        } finally {
            client.release()
        }
        
        return {
            status: 'up',
            responseTimeMs: Date.now() - start,
            poolSize: pool.totalCount,
            idleCount: pool.idleCount,
            waitingCount: pool.waitingCount
        }
    } catch (err: any) {
        return {
            status: 'down',
            error: err.message || String(err)
        }
    }
}

export function checkMemory(): MemoryHealthReport {
    const usage = process.memoryUsage()
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024)
    const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024)
    const rssMB = Math.round(usage.rss / 1024 / 1024)

    // Alert if heap usage is above 512MB
    const isWarning = heapUsedMB > 512

    return {
        status: isWarning ? 'warning' : 'up',
        heapUsedMB,
        heapTotalMB,
        rssMB,
        ...(isWarning ? { warning: 'Heap usage is high (> 512MB)' } : {})
    }
}

export async function getHealthReport(pool: Pool, version = '1.0.0'): Promise<HealthReport> {
    const [dbCheck, memoryCheck] = await Promise.all([
        checkDatabase(pool),
        Promise.resolve(checkMemory())
    ])

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (dbCheck.status === 'down') {
        status = 'unhealthy'
    } else if (memoryCheck.status === 'warning') {
        status = 'degraded'
    }

    return {
        status,
        version,
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
        checks: {
            database: dbCheck,
            memory: memoryCheck
        }
    }
}
