import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const authEnvSchema = z.object({
    JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
    JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
    JWT_ACCESS_EXPIRY: z.string().min(1).default('15m'),
    JWT_REFRESH_EXPIRY: z.string().min(1).default('7d')
})

const uploadEnvSchema = z.object({
    MAX_FILE_SIZE: z.coerce.number().int().positive().default(5 * 1024 * 1024)
})

const appEnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    FRONTEND_URL: z.string().url().default('http://localhost:3000'),
    CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001')
})

const dbEnvSchema = z.object({
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required')
})

const smtpEnvSchema = z.object({
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_SECURE: z.string().transform(v => v === 'true').default('false'),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().default('"Meru County PSB" <noreply@merupsb.go.ke>')
})

const redisEnvSchema = z.object({
    REDIS_URL: z.string().default('redis://127.0.0.1:6379')
})

export const getAuthConfig = () => authEnvSchema.parse(process.env)

export const getUploadConfig = () => uploadEnvSchema.parse(process.env)

export const getAppConfig = () => appEnvSchema.parse(process.env)

export const getDbConfig = () => dbEnvSchema.parse(process.env)

export const getSmtpConfig = () => smtpEnvSchema.parse(process.env)

export const getRedisConfig = () => redisEnvSchema.parse(process.env)

