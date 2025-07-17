'use client'

import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { useAuthStore } from '@/stores/auth'

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
  }, []) // Remove refreshUser from dependencies to avoid unnecessary reruns

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}
