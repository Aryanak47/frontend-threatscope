'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MainLayout } from '@/components/layout/main-layout'
import AuthGuard from '@/components/auth-guard'

function ConsultationTestContent() {
  const [results, setResults] = useState<string>('')
  const [sessionId, setSessionId] = useState('')
  const [loading, setLoading] = useState(false)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('threatscope_token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const log = (message: string) => {
    setResults(prev => prev + '\n' + message)
    console.log(message)
  }

  const testEndpoint = async (url: string, method = 'GET', body?: any) => {
    try {
      log(`🚀 Testing ${method} ${url}`)
      const response = await fetch(`http://localhost:8080${url}`, {
        method,
        headers: getAuthHeaders(),
        body: body ? JSON.stringify(body) : undefined
      })
      
      log(`📊 Status: ${response.status} ${response.statusText}`)
      
      if (response.ok) {
        const data = await response.json()
        log(`✅ Success: ${JSON.stringify(data, null, 2)}`)
        return data
      } else {
        const errorData = await response.text()
        log(`❌ Error: ${errorData}`)
        return null
      }
    } catch (error: any) {
      log(`💥 Network Error: ${error.message}`)
      return null
    }
  }

  const runTests = async () => {
    setLoading(true)
    setResults('')
    
    log('🔍 Starting consultation backend tests...')
    log('⏰ ' + new Date().toISOString())
    log('='.repeat(50))
    
    // Test authentication
    const token = localStorage.getItem('threatscope_token')
    log(`🔑 Auth Token: ${token ? 'Present' : 'Missing'}`)
    
    if (!token) {
      log('❌ No auth token found! Please log in first.')
      setLoading(false)
      return
    }
    
    log('='.repeat(50))
    
    // Test 1: List all sessions
    log('📋 Test 1: Fetch all consultation sessions')
    const sessions = await testEndpoint('/api/v1/consultation/sessions')
    
    // Test 2: Create test session
    log('\n🧪 Test 2: Create test session')
    const testSession = await testEndpoint('/api/v1/consultation/test/create-mock-session')
    
    if (testSession?.data?.id) {
      const newSessionId = testSession.data.id
      log(`📝 Created session ID: ${newSessionId}`)
      setSessionId(newSessionId)
      
      // Test 3: Fetch specific session
      log('\n🔍 Test 3: Fetch specific session')
      const specificSession = await testEndpoint(`/api/v1/consultation/sessions/${newSessionId}`)
      
      // Test 4: Fetch chat data
      log('\n💬 Test 4: Fetch chat data')
      const chatData = await testEndpoint(`/api/consultation/${newSessionId}/chat`)
    }
    
    // Test 5: Test with manual session ID if provided
    if (sessionId && sessionId !== testSession?.data?.id) {
      log(`\n🎯 Test 5: Manual session test (${sessionId})`)
      await testEndpoint(`/api/v1/consultation/sessions/${sessionId}`)
    }
    
    log('\n✅ Tests completed!')
    setLoading(false)
  }

  const testSpecificSession = async () => {
    if (!sessionId.trim()) return
    
    setLoading(true)
    setResults('')

    log(`🎯 Testing specific session: ${sessionId}`)
    log('='.repeat(50))

    await testEndpoint(`/api/v1/consultation/sessions/${sessionId}`)

    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Consultation Backend Test</h1>
        <p className="text-gray-600 mt-2">Test consultation endpoints to debug issues</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Quick Tests</h3>
          <div className="space-y-3">
            <Button 
              onClick={runTests} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Running Tests...' : '🧪 Run All Tests'}
            </Button>
            
            <div className="flex space-x-2">
              <Input
                placeholder="Session ID to test"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={testSpecificSession}
                disabled={loading || !sessionId.trim()}
                variant="outline"
              >
                Test
              </Button>
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
              <p><strong>Token:</strong> {typeof window !== 'undefined' && localStorage.getItem('threatscope_token') ? 'Present' : 'Missing'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Manual Commands</h3>
          <div className="space-y-2 text-sm font-mono bg-gray-100 p-3 rounded">
            <div>// Create test session</div>
            <div className="text-blue-600">fetch('/api/v1/consultation/test/create-mock-session')</div>
            <br />
            <div>// List all sessions</div>
            <div className="text-blue-600">fetch('/api/v1/consultation/sessions')</div>
            <br />
            <div>// Get specific session</div>
            <div className="text-blue-600">fetch('/api/v1/consultation/sessions/{'{id}'}')</div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Test Results</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setResults('')}
          >
            Clear
          </Button>
        </div>
        <Textarea
          value={results}
          placeholder="Test results will appear here..."
          className="font-mono text-sm h-96"
          readOnly
        />
      </Card>
    </div>
  )
}

export default function ConsultationTestPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <ConsultationTestContent />
      </MainLayout>
    </AuthGuard>
  )
}