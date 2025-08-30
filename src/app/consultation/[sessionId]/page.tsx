'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { MainLayout } from '@/components/layout/main-layout'
import { SessionChatInterface } from '@/components/consultation/session-chat-interface'
import { useConsultationStore } from '@/stores/consultation'
import { useAuthStore } from '@/stores/auth'
import { useConsultationUpdates } from '@/hooks/use-consultation-chat'
import AuthGuard from '@/components/auth-guard'
import { 
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  User,
  Star,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  FileText,
  Crown,
  Loader2,
  CreditCard,
  Shield
} from 'lucide-react'
import toastUtils from '@/lib/toast/index'
import { format } from 'date-fns'

function ConsultationSessionContent() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  
  const { user } = useAuthStore()
  
  // FIXED: Extract individual functions instead of whole store object
  const currentSession = useConsultationStore(state => state.currentSession)
  const currentChat = useConsultationStore(state => state.currentChat)
  const error = useConsultationStore(state => state.error)
  const loadingStates = useConsultationStore(state => state.loadingStates)
  
  // Extract individual store actions
  const fetchSession = useConsultationStore(state => state.fetchSession)
  const fetchChat = useConsultationStore(state => state.fetchChat)
  const sendMessage = useConsultationStore(state => state.sendMessage)
  const markMessagesAsRead = useConsultationStore(state => state.markMessagesAsRead)
  const startSession = useConsultationStore(state => state.startSession)
  const cancelSession = useConsultationStore(state => state.cancelSession)
  const processPayment = useConsultationStore(state => state.processPayment)
  const rateSession = useConsultationStore(state => state.rateSession)
  const clearError = useConsultationStore(state => state.clearError)
  
  // Local state
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Refs for managing state
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null)
  const sessionExpiredNotifiedRef = useRef(false)
  
  // ENHANCED: Real-time WebSocket chat + admin notifications
  const { 
    isConnected: wsConnected, 
    testConnection,
    sendChatMessage: sendWSMessage,
    chatMessages: realtimeChatMessages,
    connectionMethod,
    fallbackPolling 
  } = useConsultationUpdates({
    sessionId,
    userName: user?.firstName || user?.email?.split('@')[0] || 'User',
    onMessage: (message) => {
      console.log('📨 Admin notification received:', message)
      
      // Handle important session events with enhanced notifications
      if (['TIMER_STARTED', 'SESSION_EXTENDED', 'SESSION_COMPLETED', 'EXPERT_ASSIGNED'].includes(message.type)) {
        
        // Special handling for session completion by admin
        if (message.type === 'SESSION_COMPLETED') {
          toastUtils.success({
            title: 'Session Completed by Expert!',
            message: 'Your consultation has been successfully completed.',
            tip: 'Check your email for a detailed summary and security recommendations.'
          })
          
          // Immediately update the session status in the store to prevent further messaging
          const currentSessionData = useConsultationStore.getState().currentSession
          if (currentSessionData) {
            useConsultationStore.setState({
              currentSession: {
                ...currentSessionData,
                status: 'COMPLETED'
              }
            })
          }
        }
        
        // Special handling for timer started by admin
        if (message.type === 'TIMER_STARTED') {
          toastUtils.info({
            title: 'Consultation Timer Started',
            message: 'Your session is now active and being tracked.',
            tip: 'Make the most of your consultation time with focused security questions.'
          })
        }
        
        // Immediate refresh for critical events
        if (message.type === 'SESSION_COMPLETED') {
          // Immediate refresh for session completion
          fetchSession(sessionId)
          fetchChat(sessionId)
        }
        
        // Additional refresh after delay for all events
        setTimeout(() => {
          fetchSession(sessionId)
          fetchChat(sessionId)
        }, 1000)
      }
    },
    onChatMessage: (chatMessage) => {
      console.log('💬 Real-time chat message received:', chatMessage)
      // Optionally refresh chat from database to sync
      setTimeout(() => fetchChat(sessionId), 500)
    },
    onStatusUpdate: (update) => {
      console.log('📊 Session status update via WebSocket/Polling:', update)
      // Immediately refresh session data
      setTimeout(() => fetchSession(sessionId), 500)
    },
    onConnectionChange: (connected) => {
      console.log('🔌 Connection status:', connected ? 'CONNECTED' : 'DISCONNECTED')
      console.log('🔄 Connection method:', connectionMethod)
    }
  })
  
  // FIXED: Remove useCallback dependencies on store functions
  const initializeSession = useCallback(async () => {
    if (!sessionId || isInitialized) return
    
    try {
      console.log('🚀 Initializing session:', sessionId)
      await fetchSession(sessionId)
      await fetchChat(sessionId)
      setIsInitialized(true)
      console.log('✅ Session initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize session:', error)
      setIsInitialized(true) // Set anyway to show error state
    }
  }, [sessionId, isInitialized]) // Only depend on primitives
  
  // FIXED: Simple initialization without complex dependencies
  useEffect(() => {
    initializeSession()
  }, [initializeSession])
  
  // FIXED: Simple auto-refresh without function dependencies
  useEffect(() => {
    // Clear existing interval
    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current)
      autoRefreshRef.current = null
    }
    
    // Only refresh for ACTIVE sessions
    if (currentSession?.status === 'ACTIVE' && isInitialized && sessionId) {
      console.log('⏰ Setting up auto-refresh for session:', sessionId)
      
      autoRefreshRef.current = setInterval(() => {
        console.log('🔄 Auto-refreshing chat data')
        // Call fetchChat directly without dependencies
        useConsultationStore.getState().fetchChat(sessionId)
      }, 30000)
    }
    
    // Cleanup
    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current)
        autoRefreshRef.current = null
      }
    }
  }, [currentSession?.status, isInitialized, sessionId])
  
  // FIXED: Simple error handling
  useEffect(() => {
    if (error) {
      toastUtils.error({
        title: 'Session Error',
        message: error,
        tip: 'Please refresh the page or contact support if the issue persists.'
      })
      clearError()
    }
  }, [error]) // clearError is stable in Zustand
  
  // Action handlers - FIXED: Remove complex dependencies
  const handleStartSession = async () => {
    if (!sessionId) return
    
    try {
      console.log('▶️ Starting session:', sessionId)
      await startSession(sessionId)
      toast.success('Session started!')
      // Refresh session data
      await fetchSession(sessionId)
    } catch (error: any) {
      console.error('❌ Failed to start session:', error)
      toast.error(error.message || 'Failed to start session')
    }
  }
  
  const handleCancelSession = async () => {
    if (!sessionId) return
    
    if (confirm('Are you sure you want to cancel this session? This action cannot be undone.')) {
      try {
        console.log('❌ Cancelling session:', sessionId)
        await cancelSession(sessionId)
        toast.success('Session cancelled')
        router.push('/consultation')
      } catch (error: any) {
        console.error('❌ Failed to cancel session:', error)
        toast.error(error.message || 'Failed to cancel session')
      }
    }
  }
  
  const handlePayment = async () => {
    if (!sessionId || !currentSession) return
    
    setProcessingPayment(true)
    try {
      console.log('💳 Processing payment for session:', sessionId)
      await processPayment(sessionId, {
        paymentMethod: 'credit_card',
        amount: currentSession.plan?.price || 0,
        currency: 'USD'
      })
      
      toast.success('Payment successful! Your session will start shortly.')
      await fetchSession(sessionId)
    } catch (error: any) {
      console.error('❌ Payment failed:', error)
      toast.error(error.message || 'Payment failed. Please try again.')
    } finally {
      setProcessingPayment(false)
    }
  }
  
  const handleSendMessage = async (content: string, type = 'TEXT') => {
    if (!sessionId || !content.trim()) return
    
    // Double-check session status before sending
    if (currentSession?.status === 'COMPLETED') {
      toastUtils.warning({
        title: 'Session Completed',
        message: 'This consultation session has been completed.',
        tip: 'You cannot send messages after the session is finished.'
      })
      return
    }
    
    setSendingMessage(true)
    try {
      console.log('📨 Sending real-time message to session:', sessionId)
      
      // First, try to send via WebSocket for real-time delivery
      if (wsConnected && sendWSMessage) {
        const success = sendWSMessage(content)
        if (success) {
          console.log('✅ Real-time message sent successfully')
          // Also save to database via HTTP API for persistence
          try {
            await sendMessage(sessionId, { content, messageType: type })
            await markMessagesAsRead(sessionId)
          } catch (dbError) {
            console.warn('⚠️ Failed to save message to database:', dbError)
            // Don't show error to user since real-time delivery worked
          }
        } else {
          throw new Error('WebSocket message failed')
        }
      } else {
        // Fallback to HTTP API only
        console.log('📤 Using HTTP fallback for message')
        await sendMessage(sessionId, { content, messageType: type })
        await markMessagesAsRead(sessionId)
        await fetchChat(sessionId)
      }
      
    } catch (error: any) {
      console.error('❌ Failed to send message:', error)
      toast.error(error.message || 'Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }
  
  const handleSubmitRating = async () => {
    if (!sessionId || rating === 0) {
      toast.error('Please select a rating')
      return
    }
    
    try {
      console.log('⭐ Submitting rating for session:', sessionId)
      await rateSession(sessionId, { rating, feedback })
      toast.success('Thank you for your feedback!')
      setShowRatingModal(false)
      await fetchSession(sessionId)
    } catch (error: any) {
      console.error('❌ Failed to submit rating:', error)
      toast.error(error.message || 'Failed to submit rating')
    }
  }
  
  // Utility functions
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
  
  // Loading state
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading consultation session...</p>
          <p className="text-sm text-gray-500 mt-2">Session ID: {sessionId}</p>
        </div>
      </div>
    )
  }
  
  // Show loading if we're still fetching
  if (loadingStates?.fetchingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Fetching session data...</p>
          <p className="text-sm text-gray-500 mt-2">Session ID: {sessionId}</p>
        </div>
      </div>
    )
  }
  
  // Session not found
  if (isInitialized && !loadingStates?.fetchingSession && !currentSession) {
    // Determine error type
    const isExpiredSession = error && (
      error.includes('expired') || 
      error.includes('expire') ||
      error.includes('410') ||
      error.includes('no longer')
    )
    
    const isAccessDenied = error && (
      error.includes('access') ||
      error.includes('403') ||
      error.includes('unauthorized') ||
      error.includes('401')
    )
    
    const isNotFound = error && (
      error.includes('not found') ||
      error.includes('404') ||
      error.includes("doesn't exist")
    )
    
    let title = 'Session Not Found'
    let message = 'The consultation session you\'re looking for doesn\'t exist.'
    
    if (isExpiredSession) {
      title = 'Session Expired'
      message = 'Your consultation session has expired and is no longer accessible.'
    } else if (isAccessDenied) {
      title = 'Access Denied'
      message = 'You do not have permission to access this consultation session.'
    } else if (isNotFound) {
      title = 'Session Not Found'
      message = 'This consultation session does not exist or has been deleted.'
    }
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-gray-600 mb-4">{message}</p>
          
          <div className="space-y-2 text-sm text-gray-500 mb-6">
            <p>Session ID: <span className="font-mono">{sessionId}</span></p>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 max-w-md mx-auto">
                <p className="font-medium text-sm">Technical Details:</p>
                <p className="text-xs mt-1 break-words">{error}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/consultation')} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Consultations
            </Button>
            
            {isExpiredSession && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Need another consultation?</p>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/alerts')}
                >
                  Start New Consultation
                </Button>
              </div>
            )}
          </div>
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
            onClick={() => router.push('/consultation')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Consultation Session</h1>
            <p className="text-gray-600">Session ID: {sessionId}</p>
          </div>
        </div>
        <Badge className={getStatusColor(currentSession.status)}>
          {currentSession.status}
        </Badge>
      </div>
      
      {/* Admin Context Banner */}
      {typeof window !== 'undefined' && window.location.pathname.includes('/admin') && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-purple-600" />
            <div>
              <h3 className="font-medium text-purple-900">Admin Access Mode</h3>
              <p className="text-sm text-purple-700">
                You are viewing {currentSession.user?.firstName} {currentSession.user?.lastName}'s consultation session as an administrator.
                You have full access regardless of payment status.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Session Details */}
        <div className="lg:col-span-1 space-y-6">
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
                  <span className="font-medium text-blue-900">{currentSession.plan?.displayName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">Duration: {currentSession.plan?.durationDisplay}</span>
                  <span className="font-semibold text-blue-900">{currentSession.plan?.formattedPrice}</span>
                </div>
              </div>
              
              {/* Expert Info */}
              {currentSession.expert && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">{currentSession.expert.name}</span>
                  </div>
                  <p className="text-sm text-green-700">{currentSession.expert.specialization}</p>
                  {currentSession.expert.averageRating && (
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-green-700">
                        {currentSession.expert.averageRating.toFixed(1)} ({currentSession.expert.completedSessions} sessions)
                      </span>
                    </div>
                  )}
                </div>
              )}
              
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
                currentSession.paymentStatus === 'PENDING' ? 'bg-yellow-50 border border-yellow-200' :
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
                {currentSession.paymentStatus === 'PENDING' && currentSession.status === 'ASSIGNED' && (
                  <p className="text-xs text-yellow-700 mt-1">
                    💳 Payment required to start consultation with your assigned security expert
                  </p>
                )}
              </div>
            </div>
          </Card>
          
          {/* Session Actions */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Actions</h3>
            <div className="space-y-3">
              {/* Payment Button */}
              {currentSession.status === 'ASSIGNED' && currentSession.paymentStatus === 'PENDING' && (
                <Button 
                  onClick={handlePayment} 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={processingPayment}
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Make Payment ({currentSession.plan?.formattedPrice})
                    </>
                  )}
                </Button>
              )}
              
              {/* Start Session Button */}
              {(currentSession.canStart || 
                (currentSession.status === 'PAID' || 
                 (currentSession.status === 'ASSIGNED' && currentSession.paymentStatus === 'PAID'))) && (
                <Button onClick={handleStartSession} className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Session
                </Button>
              )}
              
              {/* Rate Session Button */}
              {currentSession.status === 'COMPLETED' && currentSession.canRate && !currentSession.userRating && (
                <Button 
                  onClick={() => setShowRatingModal(true)}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Rate Session
                </Button>
              )}
              
              {/* Cancel Session Button */}
              {(currentSession.status === 'PENDING' || currentSession.status === 'ASSIGNED') && (
                <Button 
                  onClick={handleCancelSession}
                  variant="outline"
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                >
                  Cancel Session
                </Button>
              )}
            </div>
          </Card>
          
          {/* Alert Context */}
          {currentSession.triggeringAlert && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Related Alert
              </h3>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="font-medium text-red-900">{currentSession.triggeringAlert.title}</p>
                <p className="text-sm text-red-700 mt-1">{currentSession.triggeringAlert.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge className="bg-red-100 text-red-800">
                    {currentSession.triggeringAlert.severity}
                  </Badge>
                  <span className="text-xs text-red-600">
                    {formatDateTime(currentSession.triggeringAlert.createdAt)}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>
        
        {/* Right Column - Chat Interface */}
        <div className="lg:col-span-2">
          {currentChat ? (
            <SessionChatInterface
              messages={currentChat.messages}
              onSendMessage={handleSendMessage}
              canSendMessages={currentChat.canSendMessages && !sendingMessage}
              loading={sendingMessage}
              expertName={currentSession.expert?.name}
              sessionStatus={currentSession.status}
              sessionStartTime={currentSession.timerStartedAt || currentSession.startedAt}
              sessionDurationMinutes={currentSession.plan?.sessionDurationMinutes || 30}
              onSessionExpired={() => {
                if (!sessionExpiredNotifiedRef.current) {
                  sessionExpiredNotifiedRef.current = true
                  toastUtils.warning({
                    title: 'Session Expired',
                    message: 'Your consultation session has reached its time limit.',
                    tip: 'You can book another consultation or contact support if you need additional help.'
                  })
                  
                  // Clear auto-refresh
                  if (autoRefreshRef.current) {
                    clearInterval(autoRefreshRef.current)
                    autoRefreshRef.current = null
                  }
                  
                  // Refresh session data
                  setTimeout(() => {
                    useConsultationStore.getState().fetchSession(sessionId)
                  }, 1000)
                }
              }}
              sessionId={sessionId}
              userId={user?.id?.toString() || ''}
              isAdmin={false}
              isExpired={currentSession.isExpired || false}
              isAdminManaged={currentSession.isAdminManaged || false}
              adminExtendedUntil={currentSession.adminExtendedUntil}
              effectiveExpirationTime={currentSession.effectiveExpirationTime}
              extensionReason={currentSession.extensionReason}
              // ENHANCED: Pass WebSocket connection status and real-time chat
              wsConnected={wsConnected}
              onTestConnection={testConnection}
              // Real-time chat props
              sendWSMessage={sendWSMessage}
              realtimeChatMessages={realtimeChatMessages}
            />
          ) : (
            <Card className="p-6 h-[600px] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p>Loading chat...</p>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Rate Your Session</h3>
            
            {/* Star Rating */}
            <div className="flex items-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer transition-colors ${
                    star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
            
            {/* Feedback */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Additional Feedback (Optional)
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience with this consultation..."
                rows={3}
              />
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowRatingModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRating}
                className="flex-1"
                disabled={rating === 0}
              >
                Submit Rating
              </Button>
            </div>
          </Card>
        </div>
      )}
      
      {/* Session Summary */}
      {currentSession.status === 'COMPLETED' && currentSession.expertSummary && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Session Summary
          </h3>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{currentSession.expertSummary}</p>
          </div>
          
          {currentSession.userRating && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Your Rating:</span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= currentSession.userRating! ? 'text-yellow-500 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">({currentSession.userRating}/5)</span>
              </div>
              {currentSession.userFeedback && (
                <p className="text-sm text-gray-600 mt-2">"{currentSession.userFeedback}"</p>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

export default function ConsultationSessionPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <ConsultationSessionContent />
      </MainLayout>
    </AuthGuard>
  )
}