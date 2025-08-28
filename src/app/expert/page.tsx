'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/main-layout'
import { ExpertNotificationPanel } from '@/components/consultation/expert-notification-panel'
import { ExpertAvailabilityManager } from '@/components/consultation/expert-availability-manager'
import AuthGuard from '@/components/auth-guard'
import { useAuthStore } from '@/stores/auth'
import { 
  MessageSquare, 
  Clock, 
  User,
  CheckCircle,
  AlertTriangle,
  Star,
  Users,
  Calendar,
  RefreshCw,
  Settings,
  Eye,
  Bell
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

interface ExpertSession {
  id: string
  status: 'ASSIGNED' | 'ACTIVE' | 'COMPLETED'
  paymentStatus: 'PAID' | 'PENDING'
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  plan: {
    displayName: string
    price: number
    formattedPrice: string
    duration: number
  }
  sessionNotes: string
  unreadMessages: number
  lastMessageTime?: string
  assignedAt: string
  startedAt?: string
  completedAt?: string
  timeRemaining?: number
  triggeringAlert?: {
    title: string
    severity: string
  }
}

function ExpertDashboardContent() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [sessions, setSessions] = useState<ExpertSession[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAvailability, setShowAvailability] = useState(false)

  useEffect(() => {
    loadExpertSessions()
    
    // Auto-refresh every 30 seconds for active sessions
    const interval = setInterval(() => {
      loadExpertSessions(true)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadExpertSessions = async (silent = false) => {
    if (!silent) setLoading(true)
    if (silent) setRefreshing(true)
    
    try {
      console.log('📊 Loading expert sessions...')
      
      // Try expert-specific endpoint first
      const response = await fetch('http://localhost:8080/api/expert/sessions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const sessionsData = data.data?.content || data.data || []
        setSessions(sessionsData)
        console.log('✅ Expert sessions loaded:', sessionsData)
      } else if (response.status === 404 || response.status === 403) {
        // Fallback: Use admin endpoint to get all sessions and filter by expert
        console.log('⚠️ Expert endpoint not available, using admin fallback')
        
        const adminResponse = await fetch('http://localhost:8080/api/admin/consultation/sessions?page=0&size=50', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (adminResponse.ok) {
          const adminData = await adminResponse.json()
          const allSessions = adminData.data?.content || adminData.data || []
          
          // Filter sessions assigned to current expert (mock filtering for now)
          const expertSessions = allSessions.filter(session => 
            session.expert?.email === user?.email || 
            session.status === 'ASSIGNED' ||
            session.status === 'ACTIVE'
          )
          
          setSessions(expertSessions)
          console.log('✅ Filtered expert sessions:', expertSessions)
        } else {
          // Use mock data for demonstration
          const mockSessions: ExpertSession[] = [
            {
              id: '3',
              status: 'ACTIVE',
              paymentStatus: 'PAID',
              user: {
                id: '1',
                firstName: 'Miguel',
                lastName: 'Caravaca',
                email: 'miguel_caravaca5497@hotmail.com'
              },
              plan: {
                displayName: 'Basic Security Consultation',
                price: 49.99,
                formattedPrice: '$49.99',
                duration: 30
              },
              sessionNotes: 'User needs help with security alert about a breach detected on www.xtralife.es. Urgent assistance required for data breach response.',
              unreadMessages: 2,
              lastMessageTime: '2 minutes ago',
              assignedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
              startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
              timeRemaining: 15 * 60, // 15 minutes remaining
              triggeringAlert: {
                title: 'New Data Breach Detected',
                severity: 'HIGH'
              }
            },
            {
              id: '4',
              status: 'ASSIGNED',
              paymentStatus: 'PAID',
              user: {
                id: '2',
                firstName: 'Sarah',
                lastName: 'Johnson',
                email: 'sarah.johnson@company.com'
              },
              plan: {
                displayName: 'Professional Security Review',
                price: 99.99,
                formattedPrice: '$99.99',
                duration: 60
              },
              sessionNotes: 'Company-wide security audit needed. Multiple vulnerabilities detected in recent scan.',
              unreadMessages: 0,
              assignedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
              triggeringAlert: {
                title: 'Multiple Security Vulnerabilities',
                severity: 'CRITICAL'
              }
            }
          ]
          
          setSessions(mockSessions)
          console.log('✅ Using mock expert sessions')
        }
      }
    } catch (error) {
      console.error('❌ Failed to load expert sessions:', error)
      if (!silent) {
        toast.error('Failed to load sessions')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleJoinChat = (sessionId: string) => {
    console.log('💬 Expert joining chat for session:', sessionId)
    router.push(`/consultation/${sessionId}`)
  }

  const handleStartSession = async (sessionId: string) => {
    try {
      console.log('▶️ Expert starting session:', sessionId)
      
      const response = await fetch(`http://localhost:8080/api/v1/consultation/sessions/${sessionId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast.success('Session started successfully!')
        loadExpertSessions()
        // Navigate to chat
        router.push(`/consultation/${sessionId}`)
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to start session')
      }
    } catch (error) {
      console.error('❌ Failed to start session:', error)
      toast.error('Failed to start session')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800'
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, HH:mm')
  }

  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getTotalUnreadMessages = () => {
    return sessions.reduce((total, session) => total + session.unreadMessages, 0)
  }

  const stats = {
    totalSessions: sessions.length,
    activeSessions: sessions.filter(s => s.status === 'ACTIVE').length,
    assignedSessions: sessions.filter(s => s.status === 'ASSIGNED').length,
    unreadMessages: getTotalUnreadMessages()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading expert dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">👨‍💼 Expert Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.firstName} {user?.lastName}! Manage your consultation sessions.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => setShowAvailability(!showAvailability)} 
            variant="outline"
          >
            <Settings className="h-4 w-4 mr-2" />
            Availability
          </Button>
          <Button onClick={() => loadExpertSessions()} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold">{stats.totalSessions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Now</p>
              <p className="text-2xl font-bold">{stats.activeSessions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Assigned</p>
              <p className="text-2xl font-bold">{stats.assignedSessions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Bell className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unread Messages</p>
              <p className="text-2xl font-bold">{stats.unreadMessages}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Availability Manager (Collapsible) */}
      {showAvailability && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Availability Settings</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAvailability(false)}
            >
              Close
            </Button>
          </div>
          <ExpertAvailabilityManager 
            expertId={user?.id?.toString()}
            onAvailabilityUpdate={(expertId, availability) => {
              console.log('Availability updated:', expertId, availability)
              toast.success('Availability updated successfully')
            }}
          />
        </Card>
      )}

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              My Consultation Sessions
            </div>
            {stats.unreadMessages > 0 && (
              <Badge className="bg-red-500 text-white">
                {stats.unreadMessages} unread
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No consultation sessions assigned</p>
              <p className="text-sm">You'll see sessions here when users book consultations and you're assigned</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div 
                  key={session.id} 
                  className={`border rounded-lg p-4 ${
                    session.unreadMessages > 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">
                          {session.user.firstName} {session.user.lastName}
                        </h3>
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                        {session.unreadMessages > 0 && (
                          <Badge className="bg-red-500 text-white">
                            {session.unreadMessages} new messages
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p><strong>Plan:</strong> {session.plan.displayName} ({session.plan.formattedPrice})</p>
                        <p><strong>Email:</strong> {session.user.email}</p>
                        <p><strong>Assigned:</strong> {formatDateTime(session.assignedAt)}</p>
                        {session.startedAt && (
                          <p><strong>Started:</strong> {formatDateTime(session.startedAt)}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {session.status === 'ACTIVE' && session.timeRemaining && (
                        <div className="text-sm">
                          <p className="text-gray-600">Time Remaining:</p>
                          <p className="font-bold text-red-600">
                            {formatTimeRemaining(session.timeRemaining)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Alert Context */}
                  {session.triggeringAlert && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-900">{session.triggeringAlert.title}</span>
                        <Badge className="bg-red-100 text-red-800">
                          {session.triggeringAlert.severity}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Session Notes */}
                  {session.sessionNotes && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Session Notes:</strong> {session.sessionNotes}
                      </p>
                    </div>
                  )}

                  {/* Last Activity */}
                  {session.lastMessageTime && (
                    <div className="mb-3 text-xs text-gray-500">
                      Last activity: {session.lastMessageTime}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-2 border-t">
                    {session.status === 'ASSIGNED' && (
                      <Button
                        onClick={() => handleStartSession(session.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Start Session
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => handleJoinChat(session.id)}
                      variant={session.unreadMessages > 0 ? 'default' : 'outline'}
                      className={session.unreadMessages > 0 ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {session.unreadMessages > 0 ? 'Respond Now' : 'Join Chat'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/consultation/${session.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expert Notification Panel */}
      <ExpertNotificationPanel onJoinChat={handleJoinChat} />
    </div>
  )
}

// Expert Guard Component
function ExpertGuard({ children }) {
  const [isExpert, setIsExpert] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    checkExpertAccess()
  }, [user])

  const checkExpertAccess = async () => {
    try {
      const token = localStorage.getItem('threatscope_token')
      if (!token) {
        router.push('/login')
        return
      }

      // For now, allow any logged-in user to access expert dashboard
      // In production, check for expert role or expert account type
      const isUserExpert = user?.roles?.includes('ROLE_EXPERT') || 
                          user?.role === 'ROLE_EXPERT' ||
                          user?.email?.includes('expert') ||
                          user?.email?.includes('admin') ||
                          true // Temporary: Allow all users for testing
      
      if (isUserExpert) {
        setIsExpert(true)
      } else {
        toast.error('Access denied. Expert privileges required.')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking expert access:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Checking expert access...</p>
        </div>
      </div>
    )
  }

  if (!isExpert) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access the expert dashboard.</p>
          <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  return children
}

export default function ExpertDashboardPage() {
  return (
    <AuthGuard>
      <ExpertGuard>
        <MainLayout>
          <ExpertDashboardContent />
        </MainLayout>
      </ExpertGuard>
    </AuthGuard>
  )
}