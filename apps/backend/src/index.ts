import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import dotenv from 'dotenv'

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

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { cors } from 'hono/cors'

// Load environment variables
dotenv.config()

const app = new Hono()

// Global middleware
app.use('*', logger())

// Debug logger for development
if (process.env.NODE_ENV !== 'production') {
  app.use('*', async (c, next) => {
    const { method, url } = c.req
    const reqId = Math.random().toString(36).substring(7)
    const startTime = Date.now()
    console.log(`\x1b[36m[DEBUG] [${reqId}] 🚀 START ${method} ${url}\x1b[0m`)
    
    // We only log the body for POST/PUT/PATCH and if it's JSON
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const contentType = c.req.header('Content-Type') || ''
      if (contentType.includes('application/json')) {
        try {
          // Clone the request to read the body without consuming it
          const body = await c.req.raw.clone().json() as any
          // Sanitize sensitive fields
          const sensitiveFields = ['password', 'token', 'refreshToken', 'accessToken', 'currentPassword', 'newPassword']
          const sanitizedBody = { ...body }
          sensitiveFields.forEach(field => {
            if (sanitizedBody[field]) sanitizedBody[field] = '********'
          })
          console.log(`\x1b[36m[DEBUG] [${reqId}] Body: ${JSON.stringify(sanitizedBody, null, 2)}\x1b[0m`)
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }
    
    await next()
    
    const duration = Date.now() - startTime
    const status = c.res.status
    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m'
    
    console.log(`${color}[DEBUG] [${reqId}] ✅ END ${method} ${url} - ${status} - ${duration}ms\x1b[0m`)
  })
}

// Middleware to normalize double slashes in the path
app.use('*', async (c, next) => {
  const path = c.req.path
  if (path.includes('//')) {
    const normalizedPath = path.replace(/\/+/g, '/')
    return c.redirect(normalizedPath, 307)
  }
  return await next()
})

app.use(
  '*',
  cors({
    origin: [
      'http://localhost:3000', 
      'http://localhost:3001', 
      'http://127.0.0.1:3000', 
      'http://127.0.0.1:3001'
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
  })
)

// Health check
app.get('/health', (c) =>
  c.json({
    success: true,
    message: 'Meru County Recruitment Portal API',
    timestamp: new Date().toISOString()
  })
)

// Root route for health checks
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

// Start server
const port = parseInt(process.env.PORT || '4000')

if (process.env.NODE_ENV !== 'test') {
  serve(
    {
      fetch: app.fetch,
      port
    },
    (info) => {
      console.log('🚀 Meru County Recruitment Portal API')
      console.log(`📍 Server running on http://localhost:${info.port}`)
      console.log(`🏥 Health check: http://localhost:${info.port}/health`)
      console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`)
    }
  )
}

export default app
