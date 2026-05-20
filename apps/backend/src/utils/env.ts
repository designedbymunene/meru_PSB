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
    FRONTEND_URL: z.string().url().default('http://localhost:3000')
})

const dbEnvSchema = z.object({
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required')
})

export const getAuthConfig = () => authEnvSchema.parse(process.env)

export const getUploadConfig = () => uploadEnvSchema.parse(process.env)

export const getAppConfig = () => appEnvSchema.parse(process.env)

export const getDbConfig = () => dbEnvSchema.parse(process.env)
