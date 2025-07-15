import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthResponse } from '@/types'
import { apiClient } from '@/lib/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    company?: string
    jobTitle?: string
  }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })
          
          const authData = await apiClient.login({ email, password })
          
          set({
            user: authData.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          // Store token in localStorage (handled by API client)
          localStorage.setItem('threatscope_user', JSON.stringify(authData.user))
          
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed'
          set({
            error: errorMessage,
            isLoading: false,
            user: null,
            isAuthenticated: false
          })
          throw error
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null })
          
          const authData = await apiClient.register(userData)
          
          set({
            user: authData.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          localStorage.setItem('threatscope_user', JSON.stringify(authData.user))
          
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Registration failed'
          set({
            error: errorMessage,
            isLoading: false,
            user: null,
            isAuthenticated: false
          })
          throw error
        }
      },

      logout: async () => {
        try {
          await apiClient.logout()
        } catch (error) {
          // Continue with logout even if API call fails
          console.warn('Logout API call failed:', error)
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
          localStorage.removeItem('threatscope_user')
          localStorage.removeItem('threatscope_token')
        }
      },

      refreshUser: async () => {
        try {
          const token = localStorage.getItem('threatscope_token')
          if (!token) {
            set({ isAuthenticated: false, user: null })
            return
          }

          set({ isLoading: true })
          const user = await apiClient.getCurrentUser()
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          localStorage.setItem('threatscope_user', JSON.stringify(user))
          
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
          localStorage.removeItem('threatscope_user')
          localStorage.removeItem('threatscope_token')
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'threatscope-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Initialize auth state on app start
export const initializeAuth = () => {
  const { refreshUser } = useAuthStore.getState()
  const token = localStorage.getItem('threatscope_token')
  
  if (token) {
    refreshUser()
  }
}
