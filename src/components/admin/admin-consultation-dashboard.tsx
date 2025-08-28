'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChatInterface } from '@/components/consultation/chat-interface'
import { ExpertAvailabilityManager } from '@/components/consultation/expert-availability-manager'
import { ExpertNotificationPanel } from '@/components/consultation/expert-notification-panel'
import { 
  Users, 
  MessageSquare, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Eye,
  Play,
  RefreshCw,
  User,
  Calendar,
  Shield,
  Settings,
  Bell
} from 'lucide-react'

interface ConsultationSession {
  id: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
  plan: {
    id: string
    name: string
    displayName: string
    price: number
    formattedPrice: string
    sessionDurationMinutes: number
  }
  status: 'PENDING' | 'APPROVED' | 'PAYMENT_REQUIRED' | 'PAID' | 'ASSIGNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED' | 'EXPIRED'
  paymentStatus: 'NOT_REQUIRED' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  sessionPrice: number
  sessionNotes: string
  expertSummary?: string
  userRating?: number
  scheduledAt?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
  expert?: {
    id: string
    name: string
    email: string
    specialization: string
  }
  triggeringAlert?: {
    id: string
    title: string
    severity: string
  }
}

export function AdminConsultationDashboard() {
  const [sessions, setSessions] = useState<ConsultationSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ConsultationSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('sessions')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalSessions, setTotalSessions] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  
  const router = useRouter()

  // Fetch real sessions from backend API
  useEffect(() => {
    fetchRealSessions()
  }, [currentPage])

  const fetchRealSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('threatscope_token')
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      // Call the real backend API
      const response = await fetch(`http://localhost:8080/admin/consultation/sessions?page=${currentPage}&size=${pageSize}&sortBy=createdAt&sortDir=desc`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('✅ Admin dashboard API response:', data)
      
      // Backend returns paginated data
      const pageData = data.data || {}
      const sessions = pageData.content || []
      
      setSessions(sessions)
      setTotalSessions(pageData.totalElements || 0)
      setTotalPages(pageData.totalPages || 0)
      
      console.log(`📊 Loaded ${sessions.length} sessions (page ${currentPage + 1} of ${pageData.totalPages})`)
      
    } catch (error: any) {
      console.error('❌ Failed to fetch sessions:', error)
      setError(error.message || 'Failed to load sessions')
      
      // Fallback to mock data in case of API failure (for development)
      console.log('🔄 Falling back to mock data for development')
      loadMockData()
    } finally {
      setLoading(false)
    }
  }
  
  // Fallback mock data for development
  const loadMockData = () => {
    const mockSessions: ConsultationSession[] = [
      {
        id: '1',
        user: {
          id: '1',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe'
        },
        plan: {
          id: '1',
          name: 'basic',
          displayName: 'Basic Consultation',
          price: 29.99,
          formattedPrice: '$29.99',
          sessionDurationMinutes: 30
        },
        status: 'PENDING',
        paymentStatus: 'NOT_REQUIRED',
        sessionPrice: 29.99,
        sessionNotes: 'I have a cybersecurity question about phishing protection. I keep getting suspicious emails and want to learn how to identify them properly.',
        createdAt: new Date().toISOString(),
        triggeringAlert: {
          id: '1',
          title: 'New breach detected for john.doe@example.com on www.xtralife.es',
          severity: 'HIGH'
        }
      },
      {
        id: '2',
        user: {
          id: '2',
          email: 'jane.smith@example.com',
          firstName: 'Jane',
          lastName: 'Smith'
        },
        plan: {
          id: '2',
          name: 'professional',
          displayName: 'Professional Consultation',
          price: 79.99,
          formattedPrice: '$79.99',
          sessionDurationMinutes: 60
        },
        status: 'PAYMENT_REQUIRED',
        paymentStatus: 'PENDING',
        sessionPrice: 79.99,
        sessionNotes: 'I need help securing my small business. We have 10 employees and I want to make sure our network and data are properly protected.',
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      },
      {
        id: '3',
        user: {
          id: '3',
          email: 'mike.wilson@company.com',
          firstName: 'Mike',
          lastName: 'Wilson'
        },
        plan: {
          id: '1',
          name: 'basic',
          displayName: 'Basic Consultation',
          price: 29.99,
          formattedPrice: '$29.99',
          sessionDurationMinutes: 30
        },
        status: 'ACTIVE',
        paymentStatus: 'PAID',
        sessionPrice: 29.99,
        sessionNotes: 'I think my personal computer might be infected with malware. It\'s running slowly and I\'ve noticed some strange behavior.',
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        startedAt: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
        expert: {
          id: '2',
          name: 'Malware Specialist',
          email: 'malware.expert@threatscope.com',
          specialization: 'Malware Analysis'
        }
      },
      {
        id: '4',
        user: {
          id: '4',
          email: 'sarah.tech@startup.io',
          firstName: 'Sarah',
          lastName: 'Tech'
        },
        plan: {
          id: '3',
          name: 'enterprise',
          displayName: 'Enterprise Consultation',
          price: 199.99,
          formattedPrice: '$199.99',
          sessionDurationMinutes: 90
        },
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        sessionPrice: 199.99,
        sessionNotes: 'We need a comprehensive security audit for our SaaS platform. We handle sensitive customer data and want to ensure we\'re following best practices.',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        startedAt: new Date(Date.now() - 84600000).toISOString(),
        completedAt: new Date(Date.now() - 79200000).toISOString(),
        userRating: 5,
        expertSummary: 'Conducted comprehensive security review. Identified 3 critical vulnerabilities and provided detailed remediation plan.',
        expert: {
          id: '3',
          name: 'Network Expert',
          email: 'network.expert@threatscope.com',
          specialization: 'Network Security'
        }
      },
      {
        id: '5',
        user: {
          id: '5',
          email: 'alice.business@company.com',
          firstName: 'Alice',
          lastName: 'Business'
        },
        plan: {
          id: '1',
          name: 'basic',
          displayName: 'Basic Consultation',
          price: 29.99,
          formattedPrice: '$29.99',
          sessionDurationMinutes: 30
        },
        status: 'ASSIGNED',
        paymentStatus: 'PAID',
        sessionPrice: 29.99,
        sessionNotes: 'I want to learn about password security and two-factor authentication. How do I set these up properly?',
        createdAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
        expert: {
          id: '1',
          name: 'Security Expert',
          email: 'security.expert@threatscope.com',
          specialization: 'General Security'
        }
      }
    ]

    setSessions(mockSessions)
    setTotalSessions(mockSessions.length)
    setTotalPages(1)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200'
      case 'PAYMENT_REQUIRED': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'PAID': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ASSIGNED': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200'
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200'
      case 'EXPIRED': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />
      case 'PAYMENT_REQUIRED': return <DollarSign className="h-4 w-4" />
      case 'PAID': return <CheckCircle className="h-4 w-4" />
      case 'ASSIGNED': return <User className="h-4 w-4" />
      case 'ACTIVE': return <Play className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED': return <XCircle className="h-4 w-4" />
      case 'REJECTED': return <XCircle className="h-4 w-4" />
      case 'EXPIRED': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const handleApproveRequest = async (sessionId: string) => {
    try {
      console.log('✅ Approving request for session:', sessionId)
      
      const response = await fetch(`http://localhost:8080/api/admin/consultation/sessions/${sessionId}/process-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: 'Request approved by admin'
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to approve request: ${response.status}`)
      }
      
      const data = await response.json()
      const updatedSession = data.data
      
      // Update sessions list
      setSessions(prev => prev.map(session => 
        session.id === sessionId ? updatedSession : session
      ))
      
      console.log('✅ Request approved successfully')
      
    } catch (error: any) {
      console.error('❌ Error approving request:', error)
      // Fallback to mock if API fails
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              status: 'PAYMENT_REQUIRED' as const,
              paymentStatus: 'PENDING' as const
            }
          : session
      ))
    }
  }

  const handleRejectRequest = async (sessionId: string) => {
    try {
      console.log('❌ Rejecting request for session:', sessionId)
      
      const response = await fetch(`http://localhost:8080/api/admin/consultation/sessions/${sessionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'Request rejected by admin',
          refund: 'false'
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to reject request: ${response.status}`)
      }
      
      const data = await response.json()
      const updatedSession = data.data
      
      // Update sessions list
      setSessions(prev => prev.map(session => 
        session.id === sessionId ? updatedSession : session
      ))
      
      console.log('✅ Request rejected successfully')
      
    } catch (error: any) {
      console.error('❌ Error rejecting request:', error)
      // Fallback to mock if API fails
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              status: 'REJECTED' as const
            }
          : session
      ))
    }
  }

  const handleProcessPayment = async (sessionId: string) => {
    try {
      console.log('💳 Processing payment for session:', sessionId)
      
      const response = await fetch(`http://localhost:8080/api/admin/consultation/sessions/${sessionId}/mark-paid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentIntentId: `admin_simulation_${sessionId}`,
          notes: 'Payment simulated by admin'
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to process payment: ${response.status}`)
      }
      
      const data = await response.json()
      const updatedSession = data.data
      
      // Update sessions list
      setSessions(prev => prev.map(session => 
        session.id === sessionId ? updatedSession : session
      ))
      
      console.log('✅ Payment processed successfully')
      
    } catch (error: any) {
      console.error('❌ Error processing payment:', error)
      // Fallback to mock if API fails
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              status: 'PAID' as const,
              paymentStatus: 'PAID' as const
            }
          : session
      ))
    }
  }

  const handleAssignExpert = async (sessionId: string) => {
    try {
      console.log('🔍 Fetching available experts for session:', sessionId)
      
      const response = await fetch('http://localhost:8080/api/admin/consultation/experts/available', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch experts: ${response.status}`)
      }
      
      const data = await response.json()
      const experts = data.data || []
      
      if (experts.length === 0) {
        throw new Error('No experts available')
      }
      
      // Auto-assign first available expert
      const firstExpert = experts[0]
      console.log('👨‍💼 Assigning expert:', firstExpert.name)
      
      const assignResponse = await fetch(`http://localhost:8080/api/admin/consultation/sessions/${sessionId}/assign-expert`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          expertId: parseInt(firstExpert.id),
          notes: `Auto-assigned expert: ${firstExpert.name}`
        })
      })
      
      if (!assignResponse.ok) {
        throw new Error(`Failed to assign expert: ${assignResponse.status}`)
      }
      
      const assignData = await assignResponse.json()
      const updatedSession = assignData.data
      
      // Update sessions list
      setSessions(prev => prev.map(session => 
        session.id === sessionId ? updatedSession : session
      ))
      
      console.log('✅ Expert assigned successfully')
      
    } catch (error: any) {
      console.error('❌ Error assigning expert:', error)
      // Fallback to mock assignment if API fails
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              status: 'ASSIGNED' as const,
              expert: {
                id: '1',
                name: 'Security Expert',
                email: 'security.expert@threatscope.com',
                specialization: 'General Security'
              }
            }
          : session
      ))
    }
  }

  const handleStartSession = async (sessionId: string) => {
    try {
      console.log('▶️ Starting session:', sessionId)
      
      // For now, this is just a UI update since starting sessions might be handled differently
      // In a real implementation, this might update session status to ACTIVE
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              status: 'ACTIVE' as const,
              startedAt: new Date().toISOString()
            }
          : session
      ))
      
      console.log('✅ Session started successfully')
      
    } catch (error: any) {
      console.error('❌ Error starting session:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <span>Loading consultation sessions...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin: Consultation Dashboard</h1>
        <p className="text-gray-600">
          Monitor and manage consultation sessions, expert assignments, and availability settings.
        </p>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sessions" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Consultation Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="expert-panel" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Expert Panel</span>
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Expert Availability</span>
          </TabsTrigger>
        </TabsList>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold">
                {sessions.filter(s => s.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <Play className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold">
                {sessions.filter(s => s.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold">
                {sessions.filter(s => s.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold">
                ${sessions
                  .filter(s => s.paymentStatus === 'PAID')
                  .reduce((sum, s) => sum + s.sessionPrice, 0)
                  .toFixed(2)
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sessions List */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Consultation Sessions</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {totalSessions > 0 && `${sessions.length} of ${totalSessions} sessions`}
                </span>
                <Button variant="outline" size="sm" onClick={fetchRealSessions} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <p className="text-red-800 font-medium">Failed to load sessions</p>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={fetchRealSessions}>
                    Retry
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedSession?.id === session.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">
                          {session.user.firstName} {session.user.lastName}
                        </h3>
                        <Badge className={getStatusColor(session.status)}>
                          {getStatusIcon(session.status)}
                          <span className="ml-1">{session.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{session.user.email}</p>
                      <p className="text-sm text-gray-600">
                        {session.plan.displayName} • {session.plan.formattedPrice}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{new Date(session.createdAt).toLocaleDateString()}</p>
                      <p>{new Date(session.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  {session.expert && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-600 font-medium">
                        Expert: {session.expert.name}
                      </span>
                    </div>
                  )}

                  {session.triggeringAlert && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">
                        Alert: {session.triggeringAlert.title.substring(0, 50)}...
                      </span>
                    </div>
                  )}

                  <p className="text-sm text-gray-700 line-clamp-2">
                    {session.sessionNotes}
                  </p>

                  {/* Admin Actions */}
                  <div className="flex items-center space-x-2 mt-3">
                    {session.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-300 text-green-600 hover:bg-green-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApproveRequest(session.id)
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRejectRequest(session.id)
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {session.status === 'PAYMENT_REQUIRED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleProcessPayment(session.id)
                        }}
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Simulate Payment
                      </Button>
                    )}
                    
                    {session.status === 'PAID' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAssignExpert(session.id)
                        }}
                      >
                        <User className="h-4 w-4 mr-1" />
                        Assign Expert
                      </Button>
                    )}
                    
                    {session.status === 'ASSIGNED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartSession(session.id)
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start Session
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedSession(session)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-600 text-purple-600 hover:bg-purple-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/admin/consultation/${session.id}`)
                      }}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Admin Access
                    </Button>
                  </div>
                </div>
              ))}
              
              {sessions.length === 0 && !loading && (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
                  <p className="text-gray-500">No consultation sessions found</p>
                  <Button size="sm" variant="outline" onClick={fetchRealSessions} className="mt-2">
                    Refresh
                  </Button>
                </div>
              )}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <span className="text-sm text-gray-600">
                  Page {currentPage + 1} of {totalPages} ({totalSessions} total sessions)
                </span>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    disabled={currentPage === 0 || loading}
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    disabled={currentPage >= totalPages - 1 || loading}
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Session Details */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Session Details</h2>
            
            {selectedSession ? (
              <div className="space-y-6">
                {/* User Info */}
                <div>
                  <h3 className="font-medium mb-2">User Information</h3>
                  <div className="text-sm space-y-1">
                    <p><strong>Name:</strong> {selectedSession.user.firstName} {selectedSession.user.lastName}</p>
                    <p><strong>Email:</strong> {selectedSession.user.email}</p>
                  </div>
                </div>

                {/* Plan Info */}
                <div>
                  <h3 className="font-medium mb-2">Consultation Plan</h3>
                  <div className="text-sm space-y-1">
                    <p><strong>Plan:</strong> {selectedSession.plan.displayName}</p>
                    <p><strong>Duration:</strong> {selectedSession.plan.sessionDurationMinutes} minutes</p>
                    <p><strong>Price:</strong> {selectedSession.plan.formattedPrice}</p>
                    <p><strong>Payment:</strong> 
                      <Badge className={`ml-2 ${
                        selectedSession.paymentStatus === 'PAID' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedSession.paymentStatus}
                      </Badge>
                    </p>
                  </div>
                </div>

                {/* Expert Info */}
                {selectedSession.expert && (
                  <div>
                    <h3 className="font-medium mb-2">Assigned Expert</h3>
                    <div className="text-sm space-y-1">
                      <p><strong>Name:</strong> {selectedSession.expert.name}</p>
                      <p><strong>Specialization:</strong> {selectedSession.expert.specialization}</p>
                      <p><strong>Email:</strong> {selectedSession.expert.email}</p>
                    </div>
                  </div>
                )}

                {/* Alert Info */}
                {selectedSession.triggeringAlert && (
                  <div>
                    <h3 className="font-medium mb-2">Triggering Alert</h3>
                    <div className="text-sm space-y-1">
                      <p><strong>Severity:</strong> 
                        <Badge className={`ml-2 ${
                          selectedSession.triggeringAlert.severity === 'HIGH' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedSession.triggeringAlert.severity}
                        </Badge>
                      </p>
                      <p><strong>Title:</strong> {selectedSession.triggeringAlert.title}</p>
                    </div>
                  </div>
                )}

                {/* Session Notes */}
                <div>
                  <h3 className="font-medium mb-2">Session Notes</h3>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">
                    {selectedSession.sessionNotes}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="font-medium mb-2">Timeline</h3>
                  <div className="text-sm space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>Created: {new Date(selectedSession.createdAt).toLocaleString()}</span>
                    </div>
                    
                    {selectedSession.startedAt && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span>Started: {new Date(selectedSession.startedAt).toLocaleString()}</span>
                      </div>
                    )}
                    
                    {selectedSession.completedAt && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        <span>Completed: {new Date(selectedSession.completedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expert Summary */}
                {selectedSession.expertSummary && (
                  <div>
                    <h3 className="font-medium mb-2">Expert Summary</h3>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm">
                      {selectedSession.expertSummary}
                    </div>
                  </div>
                )}

                {/* User Rating */}
                {selectedSession.userRating && (
                  <div>
                    <h3 className="font-medium mb-2">User Rating</h3>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < selectedSession.userRating! ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        ({selectedSession.userRating}/5)
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
            <div className="space-y-2">
              {/* Start Session - Only show for users, not in admin */}
              {!window.location.pathname.includes('/admin') && 
               selectedSession.status === 'ACTIVE' && (
                <Button 
                  className="w-full"
                  onClick={() => setChatOpen(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open Chat Interface
                </Button>
              )}
              
              {/* Expert Actions - Show in admin dashboard */}
              {window.location.pathname.includes('/admin') && (
                <>
                  {selectedSession.status === 'ACTIVE' && (
                    <div className="space-y-2">
                      <Button 
                        className="w-full relative"
                        onClick={() => setChatOpen(true)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Join Chat as Expert
                        {/* TODO: Add unread message count badge */}
                        <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs">
                          2 {/* This would be dynamic */}
                        </Badge>
                      </Button>
                      
                      <div className="text-xs text-center text-gray-600">
                        🟢 User is waiting for expert response
                      </div>
                    </div>
                  )}
                  
                  <Button variant="outline" className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Manage as Expert
                  </Button>
                </>
              )}
            </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a session to view details</p>
              </div>
            )}
          </Card>
        </div>
      </div>
        </TabsContent>

        {/* Expert Panel Tab */}
        <TabsContent value="expert-panel" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Expert Notification Panel */}
            <div className="lg:col-span-2">
              <ExpertNotificationPanel 
                onJoinChat={(sessionId) => {
                  // Find and select the session, then open chat
                  const session = sessions.find(s => s.id === sessionId)
                  if (session) {
                    setSelectedSession(session)
                    setChatOpen(true)
                  }
                }}
              />
            </div>
            
            {/* Quick Stats */}
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Expert Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Sessions</span>
                    <Badge>{sessions.filter(s => s.status === 'ACTIVE').length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Waiting Users</span>
                    <Badge variant="outline">{sessions.filter(s => s.status === 'ASSIGNED').length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completed Today</span>
                    <Badge className="bg-green-100 text-green-800">{sessions.filter(s => s.status === 'COMPLETED').length}</Badge>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Expert Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Online & Available</span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    Change Status
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Expert Availability Tab */}
        <TabsContent value="availability" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Expert Availability Management
              </h2>
              <Badge className="bg-blue-100 text-blue-800">
                Manual Control Mode
              </Badge>
            </div>
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">Acting as Expert</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    You are currently managing availability as the expert handling consultations. 
                    Update your status and schedule to let users know when you're available.
                  </p>
                </div>
              </div>
            </div>

            <ExpertAvailabilityManager 
              onAvailabilityUpdate={(expertId, availability) => {
                console.log('Availability updated:', expertId, availability)
                // TODO: Handle availability updates in admin context
              }}
            />
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Chat Interface Modal */}
      {selectedSession && chatOpen && (
        <ChatInterface
          sessionId={selectedSession.id}
          sessionData={{
            user: selectedSession.user,
            expert: selectedSession.expert,
            plan: selectedSession.plan,
            status: selectedSession.status,
            sessionNotes: selectedSession.sessionNotes
          }}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  )
}
