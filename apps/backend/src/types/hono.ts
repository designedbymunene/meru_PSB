import 'hono'

declare module 'hono' {
    interface ContextVariableMap {
        user: {
            userId: number
            email: string
            role: 'applicant' | 'admin'
        }
        validatedData: unknown
        requestId: string
    }
}
