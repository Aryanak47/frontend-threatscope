'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

interface ApiHealthStatus {
  isHealthy: boolean
  baseURL: string
  envVariable: string | undefined
  error?: string
}

export function ApiHealthChecker() {
  const [status, setStatus] = useState<ApiHealthStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkApiHealth = async () => {
    setIsLoading(true)
    try {
      const isHealthy = await apiClient.checkBackendHealth()
      
      setStatus({
        isHealthy,
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
        envVariable: process.env.NEXT_PUBLIC_API_URL,
        error: isHealthy ? undefined : 'Backend is not responding'
      })
    } catch (error: any) {
      setStatus({
        isHealthy: false,
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
        envVariable: process.env.NEXT_PUBLIC_API_URL,
        error: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkApiHealth()
  }, [])

  if (!status && !isLoading) return null

  return (
    <Card className="p-4 mb-4 border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          ) : status?.isHealthy ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          
          <div>
            <h4 className="font-semibold text-sm">
              API Status: {isLoading ? 'Checking...' : status?.isHealthy ? 'Connected' : 'Disconnected'}
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Base URL: <code className="bg-gray-100 px-1 rounded">{status?.baseURL}</code></div>
              <div>Env Variable: <code className="bg-gray-100 px-1 rounded">{status?.envVariable || 'Not set'}</code></div>
              {status?.error && (
                <div className="text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{status.error}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkApiHealth}
          disabled={isLoading}
        >
          {isLoading ? 'Checking...' : 'Recheck'}
        </Button>
      </div>
    </Card>
  )
}
