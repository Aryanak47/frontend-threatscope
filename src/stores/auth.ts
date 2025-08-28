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
    phoneNumber: string
    acceptTerms: boolean
    subscribeToNewsletter?: boolean
    company?: string
    jobTitle?: string
  }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
  
  // Admin utilities
  isAdmin: () => boolean
  hasRole: (roleName: string) => boolean
  getUserRoles: () => string[]
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
          console.log('🔍 Starting login process for:', email)
          set({ isLoading: true, error: null })
          
          const authData = await apiClient.login({ email, password })
          console.log('✅ Login successful, received auth data:', {
            user: authData.user ? {
              id: authData.user.id,
              email: authData.user.email,
              firstName: authData.user.firstName
            } : null,
            hasAccessToken: !!authData.accessToken,
            hasRefreshToken: !!authData.refreshToken
          })
          
          // Validate the received user data
          if (!authData.user || !authData.user.email || !authData.user.id) {
            throw new Error('Invalid user data received from login')
          }
          
          // Store both tokens and user data (manual + Zustand persist)
          localStorage.setItem('threatscope_token', authData.accessToken)
          localStorage.setItem('threatscope_refresh_token', authData.refreshToken)
          localStorage.setItem('threatscope_user', JSON.stringify(authData.user))
          
          // Update Zustand state (this will also trigger persist)
          set({
            user: authData.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          console.log('✅ Auth state updated successfully')
          console.log('🔍 Stored user in localStorage:', authData.user.email)
          
        } catch (error: any) {
          console.error('❌ Login failed:', error)
          const errorMessage = error.response?.data?.message || error.message || 'Login failed'
          
          // Clear any existing tokens on login failure
          localStorage.removeItem('threatscope_token')
          localStorage.removeItem('threatscope_refresh_token')
          localStorage.removeItem('threatscope_user')
          
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
          console.log('🏪 Auth store: register function called')
          console.log('📥 Auth store: received userData:', userData)
          
          set({ isLoading: true, error: null })
          
          console.log('📡 Auth store: calling apiClient.register...')
          const authData = await apiClient.register(userData)
          
          console.log('✅ Auth store: registration successful:', authData)
          
          set({
            user: authData.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          localStorage.setItem('threatscope_user', JSON.stringify(authData.user))
          
        } catch (error: any) {
          // Get the exact error message from backend
          let errorMessage = error.response?.data?.message || 'Registration failed'
          
          console.error('❌ Auth store: registration error:', errorMessage, error)
          console.error('💬 Backend message:', error.response?.data?.message)
          console.error('💬 Full error response:', error.response?.data)
          
          // TEMPORARY FIX: Force the correct message if it contains the backend message
          if (error.response?.data?.message === 'Email address already in use') {
            errorMessage = 'Email address already in use'
            console.log('📬 FORCING correct error message:', errorMessage)
          }
          
          set({
            error: errorMessage, // Show exact backend message
            isLoading: false,
            user: null,
            isAuthenticated: false
          })
          throw error
        }
      },

      logout: async () => {
        try {
          console.log('🔍 Starting logout process')
          await apiClient.logout()
        } catch (error) {
          // Continue with logout even if API call fails
          console.warn('Logout API call failed:', error)
        } finally {
          console.log('🔍 Clearing auth state and localStorage')
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
          localStorage.removeItem('threatscope_user')
          localStorage.removeItem('threatscope_token')
          localStorage.removeItem('threatscope_refresh_token')
          console.log('✅ Logout completed')
        }
      },

      refreshUser: async () => {
        try {
          console.log('🔍 Starting user refresh')
          const token = localStorage.getItem('threatscope_token')
          
          if (!token) {
            console.log('🔍 No token found, clearing auth state')
            set({ isAuthenticated: false, user: null })
            return
          }

          console.log('🔍 Token found, fetching fresh user data from backend')
          
          try {
            set({ isLoading: true })
            console.log('🔍 Calling getCurrentUser for fresh data...')
            const user = await apiClient.getCurrentUser()
            
            // Validate backend response
            if (user && user.email && user.id) {
              console.log('✅ User data refreshed from backend:', user.email)
              console.log('💳 User subscription:', user.subscription?.planType || 'No subscription')
              
              // Update both manual localStorage and Zustand state
              localStorage.setItem('threatscope_user', JSON.stringify(user))
              
              set({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null
              })
              
              console.log('🔍 Updated localStorage and Zustand state with fresh data')
            } else {
              console.error('❌ Invalid user data from backend:', user)
              throw new Error('Invalid user data received from backend')
            }
          } catch (backendError: any) {
            console.warn('⚠️ Backend verification failed:', backendError.message)
            console.error('❌ Backend error details:', backendError)
            
            // If backend fails, clear the session to force re-login
            console.log('🔍 Backend verification failed, clearing session')
            throw backendError
          }
          
        } catch (error: any) {
          console.error('❌ Failed to refresh user:', error)
          console.log('🔍 Clearing invalid session')
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
          localStorage.removeItem('threatscope_user')
          localStorage.removeItem('threatscope_token')
          localStorage.removeItem('threatscope_refresh_token')
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      
      // Admin utilities
      isAdmin: () => {
        const { user } = get()
        if (!user) return false
        
        // Check roles array first
        if (user.roles) {
          const hasAdminRole = user.roles.some(role => role.name === 'ROLE_ADMIN')
          if (hasAdminRole) return true
        }
        
        // Fallback to role string
        if (user.role) {
          if (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN') return true
        }
        
        // Temporary: Allow admin access for emails containing 'admin'
        if (user.email && user.email.includes('admin')) {
          return true
        }
        
        // REMOVED: For testing line that allowed any authenticated user
        return false
      },
      
      hasRole: (roleName: string) => {
        const { user } = get()
        if (!user) return false
        
        // Normalize role name
        const normalizedRole = roleName.startsWith('ROLE_') ? roleName : `ROLE_${roleName}`
        
        // Check roles array first
        if (user.roles) {
          return user.roles.some(role => role.name === normalizedRole)
        }
        
        // Fallback to role string
        if (user.role) {
          return user.role === normalizedRole || user.role === roleName
        }
        
        return false
      },
      
      getUserRoles: () => {
        const { user } = get()
        if (!user) return []
        
        // Return roles array if available
        if (user.roles) {
          return user.roles.map(role => role.name)
        }
        
        // Fallback to single role
        if (user.role) {
          return [user.role]
        }
        
        return []
      },
    }),
    {
      name: 'threatscope-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // FIXED: Don't modify state during hydration - this was causing infinite loops
      onRehydrateStorage: () => (state) => {
        console.log('🔍 Zustand: Rehydrating auth state')
        if (state) {
          console.log('🔍 Zustand: Rehydrated state - user:', state.user?.email, 'isAuthenticated:', state.isAuthenticated)
          
          // If we have user data but no token, schedule clearing AFTER hydration
          const token = localStorage.getItem('threatscope_token')
          if (state.isAuthenticated && !token) {
            console.log('🔍 Zustand: No token found, will clear auth state after hydration')
            // Use setTimeout to clear AFTER hydration completes
            setTimeout(() => {
              useAuthStore.setState({ user: null, isAuthenticated: false })
            }, 0)
          }
        }
        // CRITICAL: Always return the original state, never modify during hydration
        return state
      },
      // Simplified storage - remove excessive logging during hydration
      storage: {
        getItem: (name) => localStorage.getItem(name),
        setItem: (name, value) => localStorage.setItem(name, value),
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)

// Initialize auth state on app start
export const initializeAuth = () => {
  const { refreshUser } = useAuthStore.getState()
  
  // Clean up any corrupted localStorage data
  try {
    const token = localStorage.getItem('threatscope_token')
    const storedUser = localStorage.getItem('threatscope_user')
    
    console.log('🔍 InitializeAuth: Checking localStorage integrity')
    
    // Validate stored user data
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        if (!user || !user.email) {
          console.log('🔍 InitializeAuth: Invalid user data, clearing')
          localStorage.removeItem('threatscope_user')
        }
      } catch (e) {
        console.log('🔍 InitializeAuth: Corrupted user data, clearing')
        localStorage.removeItem('threatscope_user')
      }
    }
    
    // If we have a valid token, try to refresh
    if (token) {
      console.log('🔍 InitializeAuth: Token found, refreshing user')
      refreshUser()
    } else {
      console.log('🔍 InitializeAuth: No token found')
    }
  } catch (error) {
    console.error('❌ InitializeAuth: Error during initialization:', error)
    // Clear all auth data if there's an error
    localStorage.removeItem('threatscope_user')
    localStorage.removeItem('threatscope_token')
    localStorage.removeItem('threatscope_refresh_token')
  }
}
