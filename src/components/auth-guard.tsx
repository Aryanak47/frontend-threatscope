'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, isAuthenticated, refreshUser } = useAuthStore()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 AuthGuard: Starting initialization')
      
      const token = localStorage.getItem('threatscope_token')
      const storedUser = localStorage.getItem('threatscope_user')
      
      console.log('🔍 AuthGuard: localStorage - hasToken:', !!token, 'hasStoredUser:', !!storedUser)
      console.log('🔍 AuthGuard: Current state - isAuthenticated:', isAuthenticated, 'user:', user?.email)
      
      if (token && storedUser) {
        if (!isAuthenticated) {
          console.log('🔍 AuthGuard: Token exists but not authenticated, refreshing')
          try {
            await refreshUser()
            console.log('✅ AuthGuard: User refresh completed')
          } catch (error) {
            console.error('❌ AuthGuard: Failed to refresh user:', error)
          }
        } else {
          console.log('✅ AuthGuard: Already authenticated, no refresh needed')
        }
      } else {
        console.log('🔍 AuthGuard: No valid session found')
      }
      
      setIsInitializing(false)
      console.log('✅ AuthGuard: Initialization completed')
    }

    initializeAuth()
  }, []) // FIXED: Only run once on mount, remove refreshUser dependency

  // Show loading state during initialization
  if (isInitializing) {
    return (
      fallback || (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-security-600" />
            <p className="text-muted-foreground">Loading your session...</p>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}

export default AuthGuard
