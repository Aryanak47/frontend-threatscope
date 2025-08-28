'use client'

import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'

function MinimalDashboard() {
  const { user, isAuthenticated } = useAuthStore()
  
  console.log('🔍 Minimal Dashboard render:', { isAuthenticated, userEmail: user?.email })

  return (
    <div className="container max-w-4xl mx-auto px-6 py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Minimal Dashboard Test</h1>
        <div className="space-y-2">
          <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>User:</strong> {user?.email || 'Not logged in'}</p>
          <p><strong>First Name:</strong> {user?.firstName || 'N/A'}</p>
          <p className="text-sm text-gray-500 mt-4">
            If you can see this page without errors, the auth store is working correctly.
          </p>
        </div>
      </Card>
    </div>
  )
}

export default function TestDashboardPage() {
  return <MinimalDashboard />
}
