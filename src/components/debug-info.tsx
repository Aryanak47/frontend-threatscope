'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useUsageStore } from '@/stores/usage'

export function DebugInfo() {
  const { isAuthenticated, user } = useAuthStore()
  const { quota, todayUsage, isLoadingQuota } = useUsageStore()

  useEffect(() => {
    console.log('=== Debug Info ===')
    console.log('Auth State:', { isAuthenticated, user: user?.email })
    console.log('Usage State:', { quota, todayUsage, isLoadingQuota })
    console.log('==================')
  }, [isAuthenticated, user, quota, todayUsage, isLoadingQuota])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">Debug Info</div>
      <div>Auth: {isAuthenticated ? '✓' : '✗'}</div>
      <div>User: {user?.email || 'None'}</div>
      <div>Quota: {quota ? `${quota.remainingSearches}/${quota.totalSearches}` : 'None'}</div>
      <div>Loading: {isLoadingQuota ? 'Yes' : 'No'}</div>
    </div>
  )
}
