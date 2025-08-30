'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { useConsultationStore } from '@/stores/consultation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/main-layout'
import AuthGuard from '@/components/auth-guard'
import { 
  Users, 
  MessageSquare, 
  Timer,
  UserCheck,
  Settings,
  Shield,
  Eye,
  AlertTriangle,
  User,
  RefreshCw,
  Activity
} from 'lucide-react'
import toastUtils from '@/lib/toast/index'
import { format, formatDistanceToNow } from 'date-fns'

function AdminConsultationDashboardContent() {
  const router = useRouter()
  const {
    sessions,
    loading,
    error,
    adminPagination,
    loadingStates,
    fetchAdminSessions,
    loadNextPage,
    refreshSessions,
    setPage,
    setPageSize,
    setSorting,
    setAdminFilters,
    clearError
  } = useConsultationStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Load initial data
  useEffect(() => {
    fetchAdminSessions({ page: 0, size: 20 })
  }, [])

  // Handle search and filters
  useEffect(() => {
    if (debouncedSearch !== adminPagination.filters.search ||
        statusFilter !== adminPagination.filters.status ||
        paymentFilter !== adminPagination.filters.paymentStatus) {
      
      setAdminFilters({
        search: debouncedSearch,
        status: statusFilter || undefined,
        paymentStatus: paymentFilter || undefined
      })
    }
  }, [debouncedSearch, statusFilter, paymentFilter])

  // Handle sorting change
  useEffect(() => {
    if (sortBy !== adminPagination.sortBy || sortDir !== adminPagination.sortDir) {
      setSorting(sortBy, sortDir)
    }
  }, [sortBy, sortDir])

  // Handle errors
  useEffect(() => {
    if (error) {
      toastUtils.error({
        title: 'Admin Console Error',
        message: error,
        tip: 'Please refresh the page or check your admin permissions.'
      })
      clearError()
    }
  }, [error, clearError])

  // Helper functions
  const handleRefresh = async () => {
    await refreshSessions()
    toastUtils.success({
      title: 'Sessions Refreshed!',
      message: 'All consultation sessions have been updated.',
      tip: 'The data is now current with the latest session statuses.'
    })
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setPaymentFilter('')
    setSortBy('createdAt')
    setSortDir('desc')
  }

  const handleLoadMore = async () => {
    if (adminPagination.hasNext && !loadingStates.loadingNextPage) {
      await loadNextPage()
    }
  }

  const handlePageChange = (page: number) => {
    setPage(page)
  }

  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size))
  }

  // THE KEY FIX: Proper status logic that shows "Waiting for Expert Reply"
  const getStatusInfo = (session: any) => {
    // If expert is assigned but hasn't replied yet (no timerStartedAt)
    if (session.expert && !session.timerStartedAt) {
      return {
        status: 'WAITING_FOR_EXPERT',
        label: 'Waiting for Expert Reply',
        color: 'bg-orange-100 text-orange-800',
        icon: Timer,
        description: 'Expert assigned but hasn\'t responded yet. Timer will start when expert replies.'
      }
    }
    
    // Only show ACTIVE if timer has actually started (expert replied)
    if (session.status === 'ACTIVE' && session.timerStartedAt) {
      return {
        status: 'ACTIVE',
        label: 'Active Session',
        color: 'bg-green-100 text-green-800',
        icon: Activity,
        description: 'Expert and user are actively communicating'
      }
    }
    
    // Default case
    return {
      status: 'ASSIGNED',
      label: 'Expert Assigned',
      color: 'bg-blue-100 text-blue-800',
      icon: UserCheck,
      description: 'Expert assigned and ready to start'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    // For recent dates (< 7 days), use relative format
    if (diffDays < 7) {
      return formatDistanceToNow(date, { addSuffix: true })
    }
    
    // For older dates, show the actual date
    return format(date, 'MMM dd, yyyy')
  }

  const stats = {
    totalSessions: adminPagination.totalElements,
    waitingForExpert: sessions.filter(s => getStatusInfo(s).status === 'WAITING_FOR_EXPERT').length,
    activeSessions: sessions.filter(s => s.status === 'ACTIVE' && s.timerStartedAt).length,
    pendingSessions: sessions.filter(s => s.status === 'PENDING').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading admin consultation dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Admin Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  🛡️ Admin: Consultation Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage consultation sessions with full administrative control
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge className="bg-blue-100 text-blue-800">
                <Shield className="h-3 w-3 mr-1" />
                Administrator Access
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white shadow-sm border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Timer className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Waiting for Expert</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.waitingForExpert}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Activity className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Experts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.availableExperts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions Management */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="flex items-center text-xl">
              <MessageSquare className="h-6 w-6 mr-3 text-blue-600" />
              Active Consultation Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {sessions.map((session) => {
                const statusInfo = getStatusInfo(session)
                const StatusIcon = statusInfo.icon
                
                return (
                  <div key={session.id} className="border-2 rounded-xl p-6 space-y-4 bg-white">
                    {/* Session Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-orange-100">
                          <StatusIcon className="h-6 w-6 text-orange-800" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-xl font-bold text-gray-900">Session #{session.id}</h3>
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                            <Badge className="bg-green-100 text-green-800">
                              💳 {session.paymentStatus}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{statusInfo.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">${session.plan?.price}</p>
                        <p className="text-sm text-gray-500">{session.plan?.duration} minutes</p>
                      </div>
                    </div>

                    {/* User Information */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        User Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <p><strong>Name:</strong> {session.user?.fullName || 'N/A'}</p>
                        <p><strong>Email:</strong> {session.user?.email || 'N/A'}</p>
                        <p><strong>Plan:</strong> {session.user?.planType || 'FREE'}</p>
                        <p><strong>Member Since:</strong> {session.user?.createdAt ? 
                          formatTimeAgo(session.user.createdAt) : 'N/A'}</p>
                      </div>
                    </div>

                    {/* Session Notes */}
                    {session.sessionNotes && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          User's Request
                        </h4>
                        <p className="text-sm text-blue-800">{session.sessionNotes}</p>
                      </div>
                    )}

                    {/* Expert Status - THE KEY PART */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      {session.expert ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <UserCheck className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-green-900">{session.expert.name}</p>
                              <p className="text-sm text-green-700">{session.expert.specialization}</p>
                              <p className="text-xs text-gray-500">Assigned {formatTimeAgo(session.assignedAt)}</p>
                            </div>
                          </div>
                          
                          {/* THE FIX: Shows proper status based on timerStartedAt */}
                          {!session.timerStartedAt ? (
                            <div className="text-right">
                              <Badge className="bg-orange-100 text-orange-800">
                                ⏳ Waiting for expert response
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">Timer starts when expert replies</p>
                            </div>
                          ) : (
                            <div className="text-right">
                              <Badge className="bg-green-100 text-green-800">
                                ✅ Expert is responding
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">Timer started {formatTimeAgo(session.timerStartedAt)}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                              <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            </div>
                            <span className="font-medium text-yellow-900">No expert assigned yet</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3 pt-4 border-t">
                      <Button
                        onClick={() => router.push(`/admin/consultation/${session.id}`)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Manage Session
                      </Button>
                      
                      {statusInfo.status === 'WAITING_FOR_EXPERT' && (
                        <Button
                          onClick={() => {
                            toastUtils.info({
                            title: 'Expert Notified',
                            message: 'The expert will be notified to respond immediately.',
                            tip: 'You can track the response time in the session status.'
                          })
                          }}
                          variant="outline"
                          className="text-orange-600 border-orange-300 hover:bg-orange-50"
                        >
                          <Timer className="h-4 w-4 mr-2" />
                          Notify Expert
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AdminGuard({ children }) {
  const { user, isAuthenticated, isAdmin } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [isAuthenticated, user])

  const checkAdminAccess = async () => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        router.push('/login')
        return
      }
      
      // Check if user has admin role
      if (!isAdmin()) {
        router.push('/dashboard')
        return
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/login')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Checking admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin dashboard.</p>
          <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  return children
}

export default function AdminConsultationDashboardPage() {
  return (
    <AuthGuard>
      <AdminGuard>
        <MainLayout>
          <AdminConsultationDashboardContent />
        </MainLayout>
      </AdminGuard>
    </AuthGuard>
  )
}