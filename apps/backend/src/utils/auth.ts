import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomInt } from 'node:crypto'
import { getAuthConfig } from './env'

const {
    JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRY,
    JWT_REFRESH_EXPIRY
} = getAuthConfig()

export interface TokenPayload {
    userId: number
    email: string
    role: string
    tokenVersion: number
    exp?: number
}

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
}

// Verify password
export const verifyPassword = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword)
}

// Generate a one-time password reset code
export const generatePasswordResetOtp = (): string => {
    return randomInt(0, 1_000_000).toString().padStart(6, '0')
}

// Hash a password reset code
export const hashPasswordResetOtp = async (otp: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(otp, salt)
}

// Verify a password reset code
export const verifyPasswordResetOtp = async (
    otp: string,
    hashedOtp: string
): Promise<boolean> => {
    return bcrypt.compare(otp, hashedOtp)
}

// Generate access token
export const generateAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_ACCESS_SECRET, {
        expiresIn: JWT_ACCESS_EXPIRY
    } as jwt.SignOptions)
}

// Generate refresh token
export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRY
    } as jwt.SignOptions)
}

// Verify access token
export const verifyAccessToken = (token: string): TokenPayload => {
    return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload
}

// Verify refresh token
export const verifyRefreshToken = (token: string): TokenPayload => {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload
}
