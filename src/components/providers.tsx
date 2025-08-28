'use client'

import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'

// ✅ FIXED: Enhanced React Query configuration for better reliability
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ✅ Better caching and retry settings
      staleTime: 5 * 60 * 1000,    // 5 minutes
      gcTime: 10 * 60 * 1000,      // 10 minutes (was cacheTime)
      retry: 3,                    // ✅ Retry failed requests
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      
      // ✅ Background refetch settings
      refetchOnWindowFocus: false, // Don't refetch when window gains focus
      refetchOnReconnect: true,    // Refetch when network reconnects
      refetchOnMount: true,        // Refetch when component mounts
      
      // ✅ Network mode settings
      networkMode: 'offlineFirst', // Continue using cache when offline
    },
    mutations: {
      retry: 2,
      retryDelay: 1000,
      networkMode: 'offlineFirst',
    },
  },
})

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const { refreshUser, user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    console.log('🔍 Providers: Initializing auth state')
    console.log('🔍 Providers: Current state - user:', user?.email, 'isAuthenticated:', isAuthenticated)
    
    // Check for stored token and user data
    const token = localStorage.getItem('threatscope_token')
    const storedUser = localStorage.getItem('threatscope_user')
    
    console.log('🔍 Providers: localStorage - hasToken:', !!token, 'hasStoredUser:', !!storedUser)
    
    if (token && storedUser && !isAuthenticated) {
      console.log('🔍 Providers: Found token but not authenticated, refreshing user')
      refreshUser()
    } else if (token && !storedUser) {
      console.log('🔍 Providers: Found token but no stored user, refreshing')
      refreshUser()
    } else if (!token && isAuthenticated) {
      console.log('🔍 Providers: No token but authenticated state exists, clearing auth')
      // Clear authentication state if no token
      useAuthStore.setState({ user: null, isAuthenticated: false })
    } else {
      console.log('🔍 Providers: Auth state is consistent, no action needed')
    }
  }, []) // FIXED: Remove refreshUser from dependencies to avoid unnecessary reruns

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}
