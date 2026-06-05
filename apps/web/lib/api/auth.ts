import apiClient from './client'
import type {
    ApiResponse,
    User,
    AuthTokens,
    LoginCredentials,
    RegisterData,
} from '@/types'

interface LoginResponse {
    user: User
    accessToken: string
    refreshToken: string
}

interface RegisterResponse {
    user: User
    accessToken: string
    refreshToken: string
}

// Login user
export async function login(
    credentials: LoginCredentials
): Promise<ApiResponse<LoginResponse>> {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
        '/auth/login',
        credentials
    )
    return data
}

// Register new user
export async function register(
    userData: RegisterData
): Promise<ApiResponse<RegisterResponse>> {
    const { data } = await apiClient.post<ApiResponse<RegisterResponse>>(
        '/auth/register',
        userData
    )
    return data
}

// Refresh access token
export async function refreshAccessToken(
    refreshToken: string
): Promise<ApiResponse<{ accessToken: string }>> {
    const { data } = await apiClient.post<ApiResponse<{ accessToken: string }>>(
        '/auth/refresh',
        { refreshToken }
    )
    return data
}

// Request password reset code
export async function requestPasswordReset(
    email: string
): Promise<ApiResponse<{ message: string }>> {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
        '/auth/forgot-password/request',
        { email }
    )
    return data
}

// Reset password
export async function resetPassword(
    email: string,
    otp: string,
    newPassword: string
): Promise<ApiResponse<{ message: string }>> {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
        '/auth/reset-password',
        { email, otp, newPassword }
    )
    return data
}

// Get current user (optional - for session verification)
export async function getCurrentUser(): Promise<ApiResponse<User>> {
    const { data } = await apiClient.get<ApiResponse<User>>('/auth/me')
    return data
}

// Logout user
export async function logout(): Promise<ApiResponse<{ message: string }>> {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>('/auth/logout')
    return data
}
