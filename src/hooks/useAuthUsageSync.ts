'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useUsageStore } from '@/stores/usage'

/**
 * Simple hook to initialize usage data on component mount
 * No automatic syncing - just manual initialization
 */
export function useInitializeUsage() {
  const { isAuthenticated, user } = useAuthStore()
  const { refreshAllUsageData } = useUsageStore()
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    // Only initialize once per component mount
    if (hasInitializedRef.current) return
    
    console.log('🔄 [Usage Init] Initializing usage data:', {
      isAuthenticated,
      hasUser: !!user
    })
    
    hasInitializedRef.current = true
    
    // Initialize with a small delay
    setTimeout(() => {
      refreshAllUsageData(isAuthenticated)
    }, 100)
    
    // Cleanup on unmount
    return () => {
      hasInitializedRef.current = false
    }
  }, []) // No dependencies - only run once

  return {
    isAuthenticated,
    user
  }
}

/**
 * Hook for components that need to manually refresh usage data
 */
export function useUsageRefresh() {
  const { isAuthenticated } = useAuthStore()
  const { refreshAllUsageData } = useUsageStore()
  
  const refreshUsage = () => {
    refreshAllUsageData(isAuthenticated)
  }
  
  return { refreshUsage }
}
