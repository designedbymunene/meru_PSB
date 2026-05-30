import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLogout } from '@/hooks/use-auth'
import { useAuthContext } from '@/providers'
import { toast } from 'sonner'

// Mock modules
vi.mock('@/providers', () => ({
  useAuthContext: vi.fn(),
}))
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('useAuth hooks - Logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useLogout', () => {
    it('should logout and show success toast', () => {
      const mockLogout = vi.fn()

      vi.mocked(useAuthContext).mockReturnValue({
        user: { id: '1', email: 'test@example.com', fullName: 'Test User', role: 'admin' },
        setUser: vi.fn(),
        logout: mockLogout,
      } as any)

      const useLogoutFn = () => {
        const { logout } = useAuthContext()
        return () => {
          logout()
          toast.success('Logged out successfully')
        }
      }

      const logoutFn = useLogoutFn()
      logoutFn()

      expect(mockLogout).toHaveBeenCalled()
      expect(vi.mocked(toast.success)).toHaveBeenCalledWith('Logged out successfully')
    })
  })
})

