import { z } from 'zod'

// User registration schema
export const registerSchema = z.object({
    email: z.string().email().max(320),
    phoneNumber: z.string().min(10).max(20),
    password: z.string().min(8).max(100),
    fullName: z.string().min(1).max(200),
    nationalId: z.string().min(5).max(50),
    role: z.enum(['applicant', 'admin']).optional().default('applicant')
})

// User login schema
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
})

// Forgot password request schema
export const forgotPasswordRequestSchema = z.object({
    email: z.string().email()
})

// Refresh token schema
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1)
})

// Password reset confirmation schema
export const resetPasswordSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    newPassword: z.string().min(8).max(100)
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordRequestInput = z.infer<typeof forgotPasswordRequestSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
