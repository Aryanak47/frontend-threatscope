'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { apiClient } from '@/lib/api'
import { 
  Shield, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import React from 'react'

export default function DebugPage() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addTestResult = (test: string, status: 'success' | 'error' | 'info', message: string, details?: any) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    }])
  }

  const checkBackendHealth = async () => {
    setIsLoading(true)
    setTestResults([])
    addTestResult('Backend Health Check', 'info', 'Checking backend connectivity...')
    
    try {
      const isHealthy = await apiClient.checkBackendHealth()
      if (isHealthy) {
        setBackendStatus('online')
        addTestResult('Backend Health Check', 'success', 'Backend is online and responding')
      } else {
        setBackendStatus('offline')
        addTestResult('Backend Health Check', 'error', 'Backend health check failed')
      }
    } catch (error: any) {
      setBackendStatus('offline')
      addTestResult('Backend Health Check', 'error', `Backend connection failed: ${error.message}`, error)
    }
    
    setIsLoading(false)
  }

  const testRegistration = async () => {
    setIsLoading(true)
    addTestResult('Registration Test', 'info', 'Testing registration with sample data...')
    
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test.${Date.now()}@example.com`,
      password: 'TestPassword123!',
      phoneNumber: '+1234567890',
      acceptTerms: true,
      subscribeToNewsletter: false,
      company: 'Test Company',
      jobTitle: 'Developer'
    }
    
    try {
      const result = await apiClient.register(testUser)
      addTestResult('Registration Test', 'success', 'Registration successful!', result)
    } catch (error: any) {
      addTestResult('Registration Test', 'error', `Registration failed: ${error.message}`, {
        error: error.response?.data || error.message,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      })
    }
    
    setIsLoading(false)
  }

  const testApiEndpoints = async () => {
    setIsLoading(true)
    addTestResult('API Endpoints Test', 'info', 'Testing various API endpoints...')
    
    const endpoints = [
      { name: 'Health Check', method: 'GET', url: '/health' },
      { name: 'Auth Register', method: 'POST', url: '/v1/auth/register' },
      { name: 'Auth Login', method: 'POST', url: '/v1/auth/login' },
    ]
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}${endpoint.url}`, {
          method: endpoint.method,
          headers: endpoint.method === 'POST' ? { 'Content-Type': 'application/json' } : {},
          body: endpoint.method === 'POST' ? JSON.stringify({}) : undefined
        })
        
        addTestResult(`${endpoint.name} Endpoint`, 'info', `${endpoint.method} ${endpoint.url} - Status: ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        })
      } catch (error: any) {
        addTestResult(`${endpoint.name} Endpoint`, 'error', `${endpoint.method} ${endpoint.url} - Failed: ${error.message}`, error)
      }
    }
    
    setIsLoading(false)
  }

  const clearResults = () => {
    setTestResults([])
  }

  React.useEffect(() => {
    checkBackendHealth()
  }, [])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold">ThreatScope Debug Console</h1>
          </div>
          <p className="text-gray-600">
            Use this page to diagnose registration and API connectivity issues.
          </p>
        </div>

        {/* Backend Status */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {backendStatus === 'online' ? (
                <Wifi className="h-6 w-6 text-green-600" />
              ) : backendStatus === 'offline' ? (
                <WifiOff className="h-6 w-6 text-red-600" />
              ) : (
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              )}
              <div>
                <h3 className="text-lg font-semibold">Backend Status</h3>
                <p className={`text-sm ${
                  backendStatus === 'online' ? 'text-green-600' :
                  backendStatus === 'offline' ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {backendStatus === 'online' ? 'Connected to http://localhost:8080/api' :
                   backendStatus === 'offline' ? 'Cannot connect to backend' :
                   'Checking connection...'}
                </p>
              </div>
            </div>
            <Button onClick={checkBackendHealth} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </Card>

        {/* Test Actions */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Debug Tests</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={checkBackendHealth} disabled={isLoading} variant="outline">
              <Wifi className="h-4 w-4 mr-2" />
              Check Backend
            </Button>
            <Button onClick={testApiEndpoints} disabled={isLoading} variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Test Endpoints
            </Button>
            <Button onClick={testRegistration} disabled={isLoading} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Test Registration
            </Button>
          </div>
        </Card>

        {/* Current Configuration */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Current Configuration</h3>
          <div className="space-y-2 text-sm font-mono">
            <div><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}</div>
            <div><strong>Timeout:</strong> {process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'}ms</div>
            <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
            <div><strong>Debug Mode:</strong> {process.env.NEXT_PUBLIC_ENABLE_DEBUG || 'false'}</div>
          </div>
        </Card>

        {/* Test Results */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Test Results</h3>
            <Button onClick={clearResults} variant="ghost" size="sm">
              Clear Results
            </Button>
          </div>
          
          {testResults.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No test results yet. Run a test to see results here.
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  result.status === 'success' ? 'bg-green-50 border-green-200' :
                  result.status === 'error' ? 'bg-red-50 border-red-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    {result.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : result.status === 'error' ? (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{result.test}</h4>
                        <span className="text-xs text-gray-500">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{result.message}</p>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-600 cursor-pointer">
                            View Details
                          </summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Troubleshooting Guide */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Troubleshooting Guide</h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-red-600">❌ Backend Connection Failed</h4>
              <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                <li>Check if your backend server is running on <code className="bg-gray-100 px-1 rounded">http://localhost:8080</code></li>
                <li>Verify the <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_API_URL</code> in your <code className="bg-gray-100 px-1 rounded">.env.local</code> file</li>
                <li>Make sure there are no firewall or CORS issues</li>
                <li>Check the backend logs for any startup errors</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-yellow-600">⚠️ Registration Endpoint Missing</h4>
              <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                <li>Ensure the <code className="bg-gray-100 px-1 rounded">/auth/register</code> endpoint exists in your backend</li>
                <li>Check if the endpoint accepts POST requests with JSON data</li>
                <li>Verify the request/response format matches what the frontend expects</li>
                <li>Look for authentication or middleware issues blocking the request</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-blue-600">💡 Quick Fixes</h4>
              <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                <li>Try starting your backend with <code className="bg-gray-100 px-1 rounded">npm run dev</code> or <code className="bg-gray-100 px-1 rounded">mvn spring-boot:run</code></li>
                <li>Check if the backend is listening on the correct port (8080)</li>
                <li>Verify CORS is configured to allow requests from <code className="bg-gray-100 px-1 rounded">http://localhost:3000</code></li>
                <li>Use the demo mode (<code className="bg-gray-100 px-1 rounded">/demo</code>) to test frontend functionality without backend</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-green-600">✅ Alternative Testing</h4>
              <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                <li>Visit <code className="bg-gray-100 px-1 rounded">/demo</code> to test the platform without backend dependencies</li>
                <li>Use browser network tools (F12) to inspect API requests and responses</li>
                <li>Check the browser console for detailed error messages</li>
                <li>Test the backend directly with tools like Postman or curl</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline">
              <a href="/demo" target="_blank">
                <Shield className="h-4 w-4 mr-2" />
                Try Demo Mode
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="http://localhost:8080/api/health" target="_blank">
                <Wifi className="h-4 w-4 mr-2" />
                Test Backend URL
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/search" target="_blank">
                <CheckCircle className="h-4 w-4 mr-2" />
                Try Search Page
              </a>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
