'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { MainLayout } from '@/components/layout/main-layout'
import { SessionChatInterface } from '@/components/consultation/session-chat-interface'
import { useConsultationStore } from '@/stores/consultation'
import { useAuthStore } from '@/stores/auth'
import { useSimpleChat } from '@/hooks/use-simple-chat'
import AuthGuard from '@/components/auth-guard'
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  FileText,
  Crown,
  Loader2,
  Shield,
  Settings,
  Timer,
} from 'lucide-react'
import toastUtils from '@/lib/toast/index'
import { format } from 'date-fns'
import { AdminSessionExtensionDialog } from '@/components/admin/admin-session-extension-dialog'

function AdminConsultationSessionContent() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  
  // ✅ Get current admin user
  const { user: currentAdminUser } = useAuthStore()
  
  // 🔌 Real-time WebSocket chat for admin
  
  const { 
    connected: wsConnected, 
    sendMessage: sendWSMessage
  } = useSimpleChat({
    sessionId,
    onChatMessage: (chatMessage) => {
      console.log('💬 Admin received real-time chat message:', chatMessage)
      // Refresh chat from database to sync
      setTimeout(() => fetchChat(sessionId), 500)
    },
    onConsultationNotification: (notification) => {
      console.log('🔔 Admin received consultation notification:', notification)
      // Refresh session data when notifications are received
      setTimeout(() => fetchSession(sessionId), 1000)
    }
  })
  
  const {
    currentSession,
    currentChat,
    loading,
    error,
    fetchSession,
    fetchChat,
    sendMessage,
    markMessagesAsRead,
    clearError
  } = useConsultationStore()
  
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showExtensionDialog, setShowExtensionDialog] = useState(false)
  const [showStopTimerConfirm, setShowStopTimerConfirm] = useState(false)

  // Fetch session and chat data with admin context
  useEffect(() => {
    if (sessionId) {
      // Force admin context by ensuring we're on admin route
      fetchSession(sessionId)
      fetchChat(sessionId)
    }
  }, [sessionId, fetchSession, fetchChat])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(`Admin Access Error: ${error}`)
      clearError()
    }
  }, [error, clearError])

  const handleSendMessage = async (content: string, type = 'TEXT') => {
    if (!content.trim()) return
    
    setSendingMessage(true)
    try {
      console.log('📨 Admin sending real-time message to session:', sessionId)
      
      // First, try to send via WebSocket for real-time delivery
      if (wsConnected && sendWSMessage) {
        const success = sendWSMessage(content)
        if (success) {
          console.log('✅ Admin real-time message sent successfully')
          // Also save to database via HTTP API for persistence
          try {
            await sendMessage(sessionId, { content, messageType: type })
            await markMessagesAsRead(sessionId)
          } catch (dbError) {
            console.warn('⚠️ Failed to save admin message to database:', dbError)
            // Don't show error to user since real-time delivery worked
          }
        } else {
          throw new Error('Admin WebSocket message failed')
        }
      } else {
        // Fallback to HTTP API only
        console.log('📤 Admin using HTTP fallback for message')
        await sendMessage(sessionId, { content, messageType: type })
        await markMessagesAsRead(sessionId)
        await fetchChat(sessionId)
      }
      
    } catch (error: any) {
      console.error('❌ Failed to send admin message:', error)
      toast.error(error.message || 'Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800'
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-purple-100 text-purple-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'EXPIRED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy - HH:mm')
  }

  const handleAssignExpert = async () => {
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
        toastUtils.warning({
          title: 'No Experts Available',
          message: 'There are currently no experts available for assignment.',
          tip: 'Please try again later or contact system administrator.'
        })
        return
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
          notes: `Expert assigned by admin: ${firstExpert.name} (${firstExpert.specialization})`
        })
      })
      
      if (!assignResponse.ok) {
        throw new Error(`Failed to assign expert: ${assignResponse.status}`)
      }
      
      const assignData = await assignResponse.json()
      
      toastUtils.success({
        title: 'Expert Assigned!',
        message: `${firstExpert.name} has been assigned to this consultation.`,
        tip: 'The expert will be notified and can now start the session.'
      })
      
      // Refresh session data
      fetchSession(sessionId)
      
      console.log('✅ Expert assigned successfully')
      
    } catch (error: any) {
      console.error('❌ Error assigning expert:', error)
      toastUtils.error({
        title: 'Assignment Failed',
        message: error.message || 'Failed to assign expert to the session.',
        tip: 'Please check expert availability and try again.'
      })
    }
  }

  const handleCompleteSession = async () => {
    // Check if timer is still running
    const isTimerRunning = currentSession?.timerStartedAt && currentSession?.status === 'ACTIVE'
    
    if (isTimerRunning) {
      toastUtils.warning({
        title: 'Timer Still Running!',
        message: 'Please stop the timer first before completing the session.',
        tip: 'Use the "Stop Timer" button to end the consultation billing period.'
      })
      return
    }
    
    try {
      console.log('✅ Completing session:', sessionId)
      
      const response = await fetch(`http://localhost:8080/api/admin/consultation/sessions/${sessionId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          expertSummary: 'Session completed by admin - all issues addressed.',
          deliverables: 'Consultation completed, recommendations provided.'
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to complete session: ${response.status}`)
      }
      
      const data = await response.json()
      
      toastUtils.success({
        title: 'Session Completed!',
        message: 'The consultation session has been marked as complete.',
        tip: 'The user will be notified and can view the session summary.'
      })
      
      // Refresh session data
      fetchSession(sessionId)
      
      console.log('✅ Session completed successfully')
      
    } catch (error: any) {
      console.error('❌ Error completing session:', error)
      toastUtils.error({
        title: 'Completion Failed',
        message: error.message || 'Failed to complete the session.',
        tip: 'Please check the session status and try again.'
      })
    }
  }

  const handleExtendSession = () => {
    setShowExtensionDialog(true)
  }

  const handleExtensionSuccess = () => {
    // Refresh session data
    fetchSession(sessionId)
    toast.success('Session updated successfully')
  }

  const handleStartSession = async () => {
    try {
      console.log('▶️ Admin starting session:', sessionId)
      
      const response = await fetch(`http://localhost:8080/api/v1/consultation/sessions/${sessionId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to start session: ${response.status}`)
      }
      
      const data = await response.json()
      
      toast.success('Session started successfully by admin!')
      
      // Refresh session data
      fetchSession(sessionId)
      
      console.log('✅ Session started by admin')
      
    } catch (error: any) {
      console.error('❌ Error starting session:', error)
      toast.error(error.message || 'Failed to start session')
    }
  }

  const handleStartTimer = async () => {
    try {
      console.log('⏰ Admin starting timer for session:', sessionId)
      
      const response = await fetch(`http://localhost:8080/api/admin/consultation/sessions/${sessionId}/start-timer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: 'Consultation timer started by admin - session billing begins now'
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to start timer: ${response.status}`)
      }
      
      const data = await response.json()
      
      toastUtils.success({
        title: 'Timer Started!',
        message: 'Session billing is now active and time tracking has begun.',
        tip: 'The consultation clock is now running and will be billed accordingly.'
      })
      
      // Auto-refresh session data after a short delay to see timer updates
      setTimeout(() => {
        fetchSession(sessionId)
      }, 1000)
      
      console.log('✅ Timer started by admin')
      
    } catch (error: any) {
      console.error('❌ Error starting timer:', error)
      toastUtils.error({
        title: 'Failed to Start Timer',
        message: error.message || 'Unable to start the session timer.',
        tip: 'Please check the session status and try again.'
      })
    }
  }

  const handleStopTimer = () => {
    setShowStopTimerConfirm(true)
  }

  const confirmStopTimer = async () => {
    setShowStopTimerConfirm(false)
    
    try {
      console.log('⏹️ Admin stopping timer for session:', sessionId)
      
      const response = await fetch(`http://localhost:8080/api/admin/consultation/sessions/${sessionId}/stop-timer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: 'Session timer stopped by admin - consultation completed'
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to stop timer: ${response.status}`)
      }
      
      const data = await response.json()
      
      toastUtils.success({
        title: 'Timer Stopped!',
        message: 'Session billing has ended and the consultation is complete.',
        tip: 'The user will be notified and can view their session summary.'
      })
      
      // Auto-refresh session data after a short delay to see completion status
      setTimeout(() => {
        fetchSession(sessionId)
      }, 1000)
      
      console.log('✅ Timer stopped by admin')
      
    } catch (error: any) {
      console.error('❌ Error stopping timer:', error)
      toastUtils.error({
        title: 'Failed to Stop Timer',
        message: error.message || 'Unable to stop the session timer.',
        tip: 'Please try again or contact support if the issue persists.'
      })
    }
  }

  if (loading && !currentSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading session as admin...</p>
        </div>
      </div>
    )
  }

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Session Not Found</h2>
          <p className="text-gray-600 mb-4">The consultation session doesn't exist or couldn't be loaded.</p>
          <Button onClick={() => router.push('/admin/consultation')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/consultation')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Admin: Consultation Session</h1>
            <p className="text-gray-600">Session ID: {sessionId}</p>
          </div>
        </div>
        <Badge className={getStatusColor(currentSession.status)}>
          {currentSession.status}
        </Badge>
      </div>

      {/* Admin Context Banner */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <Shield className="h-5 w-5 text-purple-600" />
          <div className="flex-1">
            <h3 className="font-medium text-purple-900">Administrator Access</h3>
            <p className="text-sm text-purple-700">
              You are viewing {currentSession.user?.firstName} {currentSession.user?.lastName}'s consultation session with full administrative privileges.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Session Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Info */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              User Information
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <p className="font-medium">{currentSession.user?.firstName} {currentSession.user?.lastName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-medium">{currentSession.user?.email}</p>
              </div>
            </div>
          </Card>

          {/* Session Info */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Session Details
            </h3>
            
            <div className="space-y-4">
              {/* Plan Info */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Crown className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">{currentSession.plan?.displayName || 'Basic Consultation'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">Duration: {currentSession.plan?.durationDisplay || '30 min'}</span>
                  <span className="font-semibold text-blue-900">{currentSession.plan?.formattedPrice || '$29.99'}</span>
                </div>
              </div>

              {/* Session Status Message */}
          {currentSession.status === 'ASSIGNED' && currentSession.paymentStatus === 'PAID' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Session is ready to start</p>
                  <p className="text-sm text-green-700">Click "Start Session" to begin the consultation.</p>
                </div>
              </div>
            </div>
          )}
          
          {currentSession.status === 'ACTIVE' && !currentSession.timerStartedAt && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Timer className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Session active - Timer not started</p>
                  <p className="text-sm text-yellow-700">Click "Start Timer" to begin billing consultation time.</p>
                </div>
              </div>
            </div>
          )}
          
          {currentSession.status === 'ACTIVE' && currentSession.timerStartedAt && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
                <div>
                  <p className="font-medium text-blue-900">Timer is running</p>
                  <p className="text-sm text-blue-700">Consultation time started: {formatDateTime(currentSession.timerStartedAt || '')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Expert Info */}
              <div className={`p-3 rounded-lg ${currentSession.expert ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <User className={`h-4 w-4 ${currentSession.expert ? 'text-green-600' : 'text-yellow-600'}`} />
                  <span className={`font-medium ${currentSession.expert ? 'text-green-900' : 'text-yellow-900'}`}>
                    {currentSession.expert ? currentSession.expert.name : 'No Expert Assigned'}
                  </span>
                </div>
                {currentSession.expert && (
                  <p className="text-sm text-green-700">{currentSession.expert.specialization}</p>
                )}
              </div>

              {/* Timestamps */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Created: {formatDateTime(currentSession.createdAt)}</span>
                </div>
                {currentSession.startedAt && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>Started: {formatDateTime(currentSession.startedAt)}</span>
                  </div>
                )}
                {currentSession.completedAt && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-gray-400" />
                    <span>Completed: {formatDateTime(currentSession.completedAt)}</span>
                  </div>
                )}
              </div>

              {/* Payment Status */}
              <div className={`p-3 rounded-lg ${
                currentSession.paymentStatus === 'PAID' ? 'bg-green-50' :
                currentSession.paymentStatus === 'PENDING' ? 'bg-yellow-50' :
                'bg-red-50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Status</span>
                  <Badge className={
                    currentSession.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                    currentSession.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {currentSession.paymentStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Admin Actions */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Admin Actions
            </h3>
            <div className="space-y-3">
              {/* Admin Start Session Button */}
              {currentSession.status === 'ASSIGNED' && currentSession.paymentStatus === 'PAID' && (
                <Button 
                  onClick={handleStartSession}
                  className="w-full bg-green-600 hover:bg-green-700 text-white" 
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Session (Admin)
                </Button>
              )}
              
              {/* Timer Control Buttons */}
              {currentSession.status === 'ACTIVE' && !currentSession.timerStartedAt && (
                <Button 
                  onClick={handleStartTimer}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                >
                  <Timer className="h-4 w-4 mr-2" />
                  Start Timer
                </Button>
              )}
              
              {currentSession.timerStartedAt && currentSession.status === 'ACTIVE' && (
                <Button 
                  onClick={handleStopTimer}
                  className="w-full bg-red-600 hover:bg-red-700 text-white" 
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Stop Timer
                </Button>
              )}
              
              <Button 
                onClick={handleExtendSession}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
              >
                <Timer className="h-4 w-4 mr-2" />
                Extend Session
              </Button>
              
              <Button 
                onClick={handleAssignExpert}
                className="w-full" 
                variant="outline"
                disabled={!!currentSession.expert}
              >
                <User className="h-4 w-4 mr-2" />
                {currentSession.expert ? 'Expert Assigned' : 'Assign Expert'}
              </Button>
              
              <Button 
                onClick={handleCompleteSession}
                className="w-full"
                variant="outline"
                disabled={currentSession.status === 'COMPLETED'}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {currentSession.status === 'COMPLETED' ? 'Session Completed' : 'Mark Complete'}
              </Button>

              <Button 
                onClick={() => router.push('/admin/consultation')}
                variant="ghost"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Chat Interface */}
        <div className="lg:col-span-2">
          {currentChat ? (
            <SessionChatInterface
              messages={currentChat.messages || []}
              onSendMessage={handleSendMessage}
              canSendMessages={!sendingMessage}
              loading={sendingMessage}
              expertName={currentSession.expert?.name}
              sessionStatus={currentSession.status}
              sessionStartTime={currentSession.timerStartedAt || currentSession.startedAt}
              sessionDurationMinutes={currentSession.plan?.sessionDurationMinutes || 30}
              onSessionExpired={() => {
                toast.success('Session completed by admin')
                fetchSession(sessionId)
              }}
              sessionId={sessionId}
              userId={currentAdminUser?.id || ''} // ✅ FIXED: Use admin's ID, not user's ID
              isAdmin={true}
              isExpired={currentSession.isExpired || false}
              isAdminManaged={currentSession.isAdminManaged || false}
              adminExtendedUntil={currentSession.adminExtendedUntil}
              effectiveExpirationTime={currentSession.effectiveExpirationTime}
              extensionReason={currentSession.extensionReason}
            />
          ) : (
            <Card className="p-6 h-[600px] flex items-center justify-center">
              <div className="text-center">
                {error ? (
                  <>
                    <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
                    <p className="text-red-600">Failed to load chat</p>
                    <p className="text-sm text-gray-500 mt-2">{error}</p>
                    <Button 
                      onClick={() => fetchChat(sessionId)} 
                      className="mt-4"
                      variant="outline"
                    >
                      Retry
                    </Button>
                  </>
                ) : (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p>Loading chat as admin...</p>
                  </>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Stop Timer Confirmation Dialog */}
      <Dialog open={showStopTimerConfirm} onOpenChange={setShowStopTimerConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-red-600" />
              Stop Session Timer?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to stop the timer? This action will:
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-red-800">End the billing period for this consultation</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-800">Mark the session as completed</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-yellow-800">Notify the user that the session has ended</span>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowStopTimerConfirm(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmStopTimer}
              className="bg-red-600 hover:bg-red-700"
            >
              <Timer className="h-4 w-4 mr-2" />
              Stop Timer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Session Extension Dialog */}
      <AdminSessionExtensionDialog
        open={showExtensionDialog}
        onOpenChange={setShowExtensionDialog}
        sessionId={sessionId}
        sessionStatus={currentSession.status}
        currentExpiry={currentSession.expiresAt}
        isExpired={currentSession.isExpired || false}
        isAdminManaged={currentSession.isAdminManaged || false}
        onSuccess={handleExtensionSuccess}
      />
    </div>
  )
}

export default function AdminConsultationSessionPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <AdminConsultationSessionContent />
      </MainLayout>
    </AuthGuard>
  )
}
