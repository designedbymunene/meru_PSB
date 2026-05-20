import { z } from 'zod'

// User registration schema
export const registerSchema = z.object({
    email: z.string().email().max(320),
    phoneNumber: z.string().min(10).max(20),
    password: z.string().min(8).max(100),
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    nationalId: z.string().min(5).max(50),
    role: z.enum(['applicant', 'admin']).optional().default('applicant')
})

// User login schema
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    deviceId: z.string().optional(),
    deviceName: z.string().optional(),
    os: z.string().optional()
})

// 2FA login schema
export const login2faSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    deviceId: z.string().optional(),
    deviceName: z.string().optional(),
    os: z.string().optional()
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

// Change password schema (for authenticated users)
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(100)
})

// OTP login request schema
export const otpLoginRequestSchema = z.object({
    email: z.string().email()
})

// OTP login verification schema
export const otpLoginVerifySchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    deviceId: z.string().optional(),
    deviceName: z.string().optional(),
    os: z.string().optional()
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type Login2faInput = z.infer<typeof login2faSchema>
export type ForgotPasswordRequestInput = z.infer<typeof forgotPasswordRequestSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type OtpLoginRequestInput = z.infer<typeof otpLoginRequestSchema>
export type OtpLoginVerifyInput = z.infer<typeof otpLoginVerifySchema>
