'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/main-layout'
import { useConsultationStore } from '@/stores/consultation'
import AuthGuard from '@/components/auth-guard'
import { 
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  Calendar,
  User,
  FileText,
  Crown,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Star
} from 'lucide-react'
import { format } from 'date-fns'
import toastUtils from '@/lib/toast/index'

function ConsultationDashboardContent() {
  const router = useRouter()
  
  const {
    sessions,
    loading,
    error,
    pagination,
    loadingStates,
    fetchSessions,
    fetchSession,
    loadNextPage,
    refreshSessions,
    setPageSize,
    setSorting,
    clearError
  } = useConsultationStore()
  
  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions(0, 10, 'priority', 'desc')
  }, []) // Empty dependency array to run only once

  // Handle errors
  useEffect(() => {
    if (error) {
      toastUtils.error({
        title: 'Consultation Error',
        message: error,
        tip: 'Please try refreshing the page or contact support if the issue persists.'
      })
      clearError()
    }
  }, [error, clearError])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-slate-700/30 text-slate-300 border-slate-600/50'
      case 'ASSIGNED': return 'bg-slate-700/30 text-slate-300 border-slate-600/50'
      case 'ACTIVE': return 'bg-slate-700/30 text-slate-300 border-slate-600/50'
      case 'COMPLETED': return 'bg-slate-700/30 text-slate-300 border-slate-600/50'
      case 'CANCELLED': return 'bg-slate-700/30 text-slate-300 border-slate-600/50'
      case 'EXPIRED': return 'bg-slate-700/30 text-slate-300 border-slate-600/50'
      default: return 'bg-slate-700/30 text-slate-300 border-slate-600/50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'ASSIGNED': return <User className="h-4 w-4" />
      case 'ACTIVE': return <MessageSquare className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED': return <AlertTriangle className="h-4 w-4" />
      case 'EXPIRED': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const isSessionAccessible = (session: any) => {
    // Check if session is accessible based on status
    return !['EXPIRED', 'CANCELLED'].includes(session.status)
  }

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy - HH:mm')
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'basic': return '🛡️'
      case 'professional': return '👥'
      case 'enterprise': return '👑'
      default: return '💬'
    }
  }

  // Group sessions by status
  const activeSessions = sessions.filter(s => ['PENDING', 'ASSIGNED', 'ACTIVE'].includes(s.status))
  const completedSessions = sessions.filter(s => s.status === 'COMPLETED')
  const otherSessions = sessions.filter(s => !['PENDING', 'ASSIGNED', 'ACTIVE', 'COMPLETED'].includes(s.status))

  if (loading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading your consultations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expert Consultations</h1>
          <p className="text-slate-400 mt-1">Get personalized cybersecurity guidance from our experts</p>
        </div>
        <div>
          <Button onClick={() => router.push('/alerts')} variant="security">
            <Plus className="h-4 w-4 mr-2" />
            New Consultation
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {sessions.length === 0 && !loading && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-200">No Consultations Yet</h3>
            <p className="text-slate-400 mb-6">
              When you encounter a security alert, you can get expert help by clicking the "Take Action" button on any alert.
            </p>
            <Button onClick={() => router.push('/alerts')} variant="security">
              <Plus className="h-4 w-4 mr-2" />
              Start Your First Consultation
            </Button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 hover:border-slate-600/50 transition-all">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-700/30 rounded-xl">
                <MessageSquare className="h-6 w-6 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Total Sessions</p>
                <p className="text-2xl font-bold text-slate-100">{sessions.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 hover:border-slate-600/50 transition-all">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-700/30 rounded-xl">
                <Clock className="h-6 w-6 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Active</p>
                <p className="text-2xl font-bold text-slate-100">{activeSessions.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 hover:border-slate-600/50 transition-all">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-700/30 rounded-xl">
                <CheckCircle className="h-6 w-6 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-slate-100">{completedSessions.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-6 flex items-center text-slate-200">
            <Clock className="h-5 w-5 mr-2 text-slate-400" />
            Active Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSessions.map((session) => (
              <div key={session.id} className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 hover:border-slate-600/50 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getPlanIcon(session.plan.name)}</span>
                    <div>
                      <h3 className="font-semibold text-slate-200">{session.plan.displayName}</h3>
                      <p className="text-sm text-slate-400">{session.plan.formattedPrice}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(session.status)}>
                    {getStatusIcon(session.status)}
                    <span className="ml-1">{session.status}</span>
                  </Badge>
                </div>

                {session.expert && (
                  <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-slate-300" />
                      <span className="text-sm font-medium text-slate-200">{session.expert.name}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{session.expert.specialization}</p>
                  </div>
                )}

                <div className="space-y-2 text-sm text-slate-400 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {formatDateTime(session.createdAt)}</span>
                  </div>
                  {session.startedAt && (
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Started: {formatDateTime(session.startedAt)}</span>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={async () => {
                    // Check if session is accessible first
                    if (!isSessionAccessible(session)) {
                      toastUtils.error({
                        title: 'Session Not Accessible',
                        message: `Cannot access ${session.status.toLowerCase()} session.`,
                        tip: 'Only active and assigned sessions can be accessed.'
                      })
                      return
                    }
                    
                    // Check session status before navigating
                    try {
                      console.log('🔍 Checking session status before navigation:', session.id)
                      await fetchSession(session.id)
                      
                      // If we get here, session is accessible, navigate to it
                      router.push(`/consultation/${session.id}`)
                    } catch (error: any) {
                      // Session has issues, show appropriate message
                      console.error('❌ Session access failed:', error)
                      
                      if (error.message?.includes('expired') || error.message?.includes('410')) {
                        toast.error(`Session ${session.id} has expired and is no longer accessible`)
                      } else if (error.message?.includes('403') || error.message?.includes('access')) {
                        toast.error(`You no longer have access to session ${session.id}`)
                      } else if (error.message?.includes('404') || error.message?.includes('not found')) {
                        toast.error(`Session ${session.id} no longer exists`)
                      } else {
                        toast.error(`Cannot access session ${session.id}: ${error.message}`)
                      }
                      
                      // Refresh the sessions list to update status
                      fetchSessions(0, 10, 'priority', 'desc')
                    }
                  }}
                  className={`w-full ${
                    !isSessionAccessible(session) 
                      ? 'opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400' 
                      : ''
                  }`}
                  size="sm"
                  disabled={!isSessionAccessible(session)}
                >
                  {session.status === 'ACTIVE' ? 'Continue Chat' : 'View Session'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Completed Sessions */}
      {completedSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-slate-300" />
            Recent Completed Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedSessions.slice(0, 6).map((session) => (
              <div key={session.id} className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 hover:border-slate-600/50 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getPlanIcon(session.plan.name)}</span>
                    <div>
                      <h3 className="font-semibold text-slate-200">{session.plan.displayName}</h3>
                      <p className="text-sm text-slate-400">{session.plan.formattedPrice}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(session.status)}>
                    {getStatusIcon(session.status)}
                    <span className="ml-1">{session.status}</span>
                  </Badge>
                </div>

                {session.expert && (
                  <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-slate-300" />
                      <span className="text-sm font-medium text-slate-200">{session.expert.name}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{session.expert.specialization}</p>
                  </div>
                )}

                {session.userRating && (
                  <div className="mb-4 flex items-center space-x-2">
                    <span className="text-sm text-slate-400">Your Rating:</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= session.userRating! ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-sm text-slate-400 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Completed: {formatDateTime(session.completedAt!)}</span>
                  </div>
                  {session.durationMinutes && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Duration: {session.durationMinutes} minutes</span>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={async () => {
                    // Check session status before navigating
                    try {
                      console.log('🔍 Checking completed session status:', session.id)
                      await fetchSession(session.id)
                      
                      // Navigate to session
                      router.push(`/consultation/${session.id}`)
                    } catch (error: any) {
                      console.error('❌ Completed session access failed:', error)
                      
                      if (error.message?.includes('expired') || error.message?.includes('410')) {
                        toast.error(`Session ${session.id} has expired and is no longer accessible`)
                      } else {
                        toast.error(`Cannot access session ${session.id}: ${error.message}`)
                      }
                      
                      // Refresh the sessions list
                      fetchSessions()
                    }
                  }}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  View Summary
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>

          {completedSessions.length > 6 && (
            <div className="text-center mt-6">
              <Button variant="outline" onClick={() => {/* TODO: View all sessions */}}>
                View All Sessions
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Other Sessions (Cancelled, Expired) */}
      {otherSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-slate-400" />
            Other Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherSessions.slice(0, 3).map((session) => (
              <div key={session.id} className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 hover:border-slate-600/50 transition-all cursor-pointer opacity-75">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl grayscale">{getPlanIcon(session.plan.name)}</span>
                    <div>
                      <h3 className="font-semibold text-slate-200">{session.plan.displayName}</h3>
                      <p className="text-sm text-slate-400">{session.plan.formattedPrice}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(session.status)}>
                    {getStatusIcon(session.status)}
                    <span className="ml-1">{session.status}</span>
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-slate-400 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {formatDateTime(session.createdAt)}</span>
                  </div>
                </div>

                <Button 
                  onClick={async () => {
                    // Check session status before navigating
                    try {
                      console.log('🔍 Checking other session status:', session.id)
                      await fetchSession(session.id)
                      
                      // Navigate to session
                      router.push(`/consultation/${session.id}`)
                    } catch (error: any) {
                      console.error('❌ Other session access failed:', error)
                      
                      if (error.message?.includes('expired') || error.message?.includes('410')) {
                        toast.error(`Session ${session.id} has expired and is no longer accessible`)
                      } else if (error.message?.includes('404') || error.message?.includes('not found')) {
                        toast.error(`Session ${session.id} no longer exists`)
                      } else {
                        toast.error(`Cannot access session ${session.id}: ${error.message}`)
                      }
                      
                      // Refresh the sessions list
                      fetchSessions()
                    }
                  }}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  View Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works Section (for new users) */}
      {sessions.length === 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-8">
          <h3 className="text-2xl font-bold mb-4 text-center text-slate-200">How Expert Consultations Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-slate-300" />
              </div>
              <h4 className="font-semibold mb-2 text-slate-200">1. Security Alert</h4>
              <p className="text-sm text-slate-400">
                When we detect a security breach involving your data, you'll see a "Take Action" button on the alert.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-slate-300" />
              </div>
              <h4 className="font-semibold mb-2 text-slate-200">2. Choose Your Plan</h4>
              <p className="text-sm text-slate-400">
                Select from Basic ($29), Professional ($79), or Enterprise ($199) consultation plans based on your needs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-slate-300" />
              </div>
              <h4 className="font-semibold mb-2 text-slate-200">3. Get Expert Help</h4>
              <p className="text-sm text-slate-400">
                Chat directly with a cybersecurity expert who will guide you through securing your accounts and data.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ConsultationDashboardPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <ConsultationDashboardContent />
      </MainLayout>
    </AuthGuard>
  )
}
