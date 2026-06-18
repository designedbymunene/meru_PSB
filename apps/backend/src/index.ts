import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { secureHeaders } from 'hono/secure-headers'
import { getAppConfig } from './utils/env'
import { requestLogger, logger } from './utils/logger'
import { getHealthReport } from './utils/health'
import { timeout } from 'hono/timeout'
import { pool } from './db'
import { notificationWorker } from './workers/notification-worker'
import { redisConnection } from './utils/queue'

// Import routes
import { authRouter } from './routes/auth'
import { vacanciesRouter } from './routes/vacancies'
import { applicationsRouter } from './routes/applications'
import { dashboardRouter } from './routes/dashboard'
import { departmentsRouter } from './routes/departments'
import { jobGroupsRouter } from './routes/job-groups'
import { venuesRouter } from './routes/venues'
import { venueTagsRouter } from './routes/venue-tags'
import { applicantProfilesRouter } from './routes/applicant-profiles'
import { referenceRouter } from './routes/reference'
import { accountRouter } from './routes/account'
import { usersRouter } from './routes/users'
import { shortlistingRouter } from './routes/shortlisting'
import { interviewsRouter } from './routes/interviews'
import { boardRouter } from './routes/board'
import { reportsRouter } from './routes/reports'
import { downloadsRouter } from './routes/downloads'
import { notificationsRouter } from './routes/notifications'

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { cors } from 'hono/cors'

const { NODE_ENV, PORT, CORS_ORIGINS } = getAppConfig()

const app = new Hono()

// Secure headers middleware
app.use('*', secureHeaders())

// Request timeout middleware
app.use('*', timeout(15000))

// Request logger middleware (uses Pino)
app.use('*', requestLogger())

// Middleware to normalize double slashes in the path
app.use('*', async (c, next) => {
  const path = c.req.path
  if (path.includes('//')) {
    const normalizedPath = path.replace(/\/+/g, '/')
    return c.redirect(normalizedPath, 307)
  }
  return await next()
})

// Configure CORS origins
const parsedUserOrigins = CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
const devOrigins = [
  // Web app ports (Next.js dev server varies)
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
  'http://127.0.0.1:3004',
  'http://127.0.0.1:3005',
  // Expo dev server ports (for mobile development)
  'http://localhost:19000',
  'http://localhost:19001',
  'http://localhost:19002',
  'http://localhost:19006',
  'http://127.0.0.1:19000',
  'http://127.0.0.1:19001',
  'http://127.0.0.1:19002',
  'http://127.0.0.1:19006',
  // React Native Metro bundler
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  // Local network for physical devices
  'http://192.168.100.92:4000',
  'http://192.168.100.92:8081',
]
const corsOrigins = NODE_ENV === 'production' ? parsedUserOrigins : [...parsedUserOrigins, ...devOrigins]

app.use(
  '*',
  cors({
    origin: corsOrigins,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
  })
)

// Health check endpoints (Phase 4)

// Liveness probe - lightweight check to see if the process is alive
app.get('/health', (c) =>
  c.json({
    success: true,
    status: 'healthy',
    message: 'Meru County Recruitment Portal API is running',
    timestamp: new Date().toISOString(),
  })
)

// Readiness probe - deep check that verifies database connection and pool status
app.get('/health/ready', async (c) => {
  const report = await getHealthReport(pool)
  return c.json(report, report.status === 'unhealthy' ? 503 : 200)
})

// Startup probe - verifies startup completeness (in this case, it matches readiness)
app.get('/health/startup', async (c) => {
  const report = await getHealthReport(pool)
  return c.json(report, report.status === 'unhealthy' ? 503 : 200)
})

// Root route
app.get('/', (c) =>
  c.json({
    success: true,
    message: 'Meru County Recruitment Portal API',
    version: '1.0.0'
  })
)

// Mount API routes
app.route('/api/auth', authRouter)
app.route('/api/account', accountRouter)
app.route('/api/users', usersRouter)
app.route('/api/vacancies', vacanciesRouter)
app.route('/api/applications', applicationsRouter)
app.route('/api/dashboard', dashboardRouter)
app.route('/api/departments', departmentsRouter)
app.route('/api/job-groups', jobGroupsRouter)
app.route('/api/venues', venuesRouter)
app.route('/api/venue-tags', venueTagsRouter)
app.route('/api/applicant-profiles', applicantProfilesRouter)
app.route('/api/reference', referenceRouter)
app.route('/api/shortlisting', shortlistingRouter)
app.route('/api/interviews', interviewsRouter)
app.route('/api/board', boardRouter)
app.route('/api/reports', reportsRouter)
app.route('/api/downloads', downloadsRouter)
app.route('/api/notifications', notificationsRouter)

// Error handler
app.onError(errorHandler)

// 404 handler
app.notFound((c) =>
  c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found'
      }
    },
    404
  )
)

let server: any

// Start server
if (NODE_ENV !== 'test') {
  server = serve(
    {
      fetch: app.fetch,
      port: PORT,
      hostname: '0.0.0.0'
    },
    (info) => {
      logger.info(
        { port: info.port, env: NODE_ENV },
        `🚀 Meru County Recruitment Portal API running on port ${info.port}`
      )
    }
  )
}

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  logger.info({ signal }, `Received ${signal}, initiating graceful shutdown...`)
  
  if (server) {
    logger.info('Closing HTTP server...')
    server.close()
  }

  logger.info('Closing background workers...')
  try {
    await notificationWorker.close()
    logger.info('Background worker closed')
  } catch (err) {
    logger.error({ err }, 'Error closing background worker')
  }

  logger.info('Closing Redis connection...')
  try {
    await redisConnection.quit()
    logger.info('Redis connection closed')
  } catch (err) {
    logger.error({ err }, 'Error closing Redis connection')
  }

  logger.info('Draining database connection pool...')
  try {
    await pool.end()
    logger.info('Database connection pool drained successfully')
  } catch (err) {
    logger.error({ err }, 'Error during database pool draining')
  }

  logger.info('Shutdown complete. Exiting process.')
  process.exit(0)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

export default app

