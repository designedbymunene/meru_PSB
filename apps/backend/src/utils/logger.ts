import pino from 'pino'
import type { MiddlewareHandler } from 'hono'

const isDev = process.env.NODE_ENV !== 'production'

export const logger = pino({
    level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
    redact: {
        paths: [
            'req.headers.authorization',
            '*.password',
            '*.token',
            '*.refreshToken',
            '*.accessToken',
            '*.currentPassword',
            '*.newPassword',
            'password',
            'token',
            'refreshToken',
            'accessToken',
            'currentPassword',
            'newPassword'
        ],
        censor: '[REDACTED]'
    },
    transport: isDev
        ? {
              target: 'pino-pretty',
              options: {
                  colorize: true,
                  translateTime: 'SYS:standard'
              }
          }
        : undefined
})

export const createLogger = (name: string) => logger.child({ module: name })

export const requestLogger = (): MiddlewareHandler => {
    return async (c, next) => {
        const requestId = crypto.randomUUID()
        c.set('requestId', requestId)
        c.header('X-Request-ID', requestId)

        const startTime = Date.now()
        const method = c.req.method
        const path = c.req.path

        logger.info({
            type: 'request',
            requestId,
            method,
            path,
            ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip')
        }, `Incoming ${method} ${path}`)

        try {
            await next()
        } finally {
            const duration = Date.now() - startTime
            const status = c.res.status

            logger.info({
                type: 'response',
                requestId,
                method,
                path,
                status,
                durationMs: duration
            }, `Completed ${method} ${path} with status ${status} in ${duration}ms`)
        }
    }
}
