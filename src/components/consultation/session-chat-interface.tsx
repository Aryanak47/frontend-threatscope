'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  MessageSquare, 
  Send, 
  Clock, 
  User, 
  Bot,
  FileText,
  Loader2,
  AlertCircle,
  Timer,
  Wifi,
  WifiOff,
  Shield,
  CheckCircle,
  Calendar,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'

interface ChatMessage {
  id: string
  sender: 'USER' | 'EXPERT' | 'SYSTEM'
  messageType: 'TEXT' | 'FILE' | 'LINK' | 'ZOOM_LINK' | 'SYSTEM_MESSAGE'
  content: string
  isRead: boolean
  isSystemMessage: boolean
  createdAt: string
  senderName?: string
}

interface SessionChatInterfaceProps {
  messages: ChatMessage[]
  onSendMessage: (content: string, type?: string) => Promise<void>
  canSendMessages: boolean
  loading: boolean
  expertName?: string
  sessionStatus: string
  sessionStartTime?: string
  sessionDurationMinutes?: number
  onSessionExpired?: () => void
  sessionId: string
  userId: string
  isAdmin?: boolean
  // Admin extension data
  isExpired?: boolean
  isAdminManaged?: boolean
  adminExtendedUntil?: string
  effectiveExpirationTime?: string
  extensionReason?: string
  // ENHANCED: WebSocket connection status
  wsConnected?: boolean
  onTestConnection?: () => void
}

export function SessionChatInterface({ 
  messages: initialMessages,
  onSendMessage, 
  canSendMessages, 
  loading, 
  expertName,
  sessionStatus,
  sessionStartTime,
  sessionDurationMinutes = 30,
  onSessionExpired,
  sessionId,
  userId,
  isAdmin = false,
  isExpired = false,
  isAdminManaged = false,
  adminExtendedUntil,
  effectiveExpirationTime,
  extensionReason,
  // ENHANCED: WebSocket props
  wsConnected = false,
  onTestConnection
}: SessionChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const timerExpiredRef = useRef(false)


  // Update messages when props change
  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])


  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // REMOVED: Auto-refresh that was causing page reloads
  // We'll let the parent component handle real-time updates properly

  // FIXED: Enhanced session expiration logic with proper admin extension support
  useEffect(() => {
    console.log('🕒 Timer Effect:', {
      sessionStatus,
      isAdminManaged,
      adminExtendedUntil,
      effectiveExpirationTime,
      isAdmin,
      isExpired
    })
    
    // Check if session has active admin extension
    const hasActiveExtension = (adminExtendedUntil && new Date(adminExtendedUntil) > new Date()) ||
                              (effectiveExpirationTime && new Date(effectiveExpirationTime) > new Date())
    
    console.log('🔍 Extension check:', {
      hasActiveExtension,
      adminExtendedUntil,
      effectiveExpirationTime,
      now: new Date().toISOString()
    })
    
    // If admin-managed with no expiration time, session never expires
    if (isAdminManaged && !effectiveExpirationTime && !adminExtendedUntil) {
      console.log('🔧 Admin-managed session with no expiration')
      setSessionExpired(false)
      setTimeRemaining(null)
      timerExpiredRef.current = false
      return
    }
    
    // If session has active admin extension, use that time
    if (hasActiveExtension) {
      console.log('✅ Session has active admin extension')
      setSessionExpired(false)
      timerExpiredRef.current = false
      
      // Calculate time remaining with extension
      if (sessionStatus === 'ACTIVE') {
        const extendedTime = adminExtendedUntil || effectiveExpirationTime
        if (extendedTime) {
          const endTime = new Date(extendedTime)
          const now = new Date()
          const remainingSeconds = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000))
          setTimeRemaining(remainingSeconds)
          
          if (remainingSeconds <= 0 && !isAdmin) {
            console.log('❌ Extended session expired for user')
            timerExpiredRef.current = true
            setSessionExpired(true)
            onSessionExpired?.()
          }
        }
      }
      return
    }
    
    // Regular session timer logic
    if (sessionStatus === 'ACTIVE' && sessionStartTime && !timerExpiredRef.current) {
      const startTime = new Date(sessionStartTime)
      const endTime = new Date(startTime.getTime() + sessionDurationMinutes * 60 * 1000)
      const now = new Date()
      const remainingSeconds = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000))
      
      console.log('⏳ Regular timer - remaining:', remainingSeconds)
      setTimeRemaining(remainingSeconds)
      
      if (remainingSeconds <= 0 && !timerExpiredRef.current && !isAdmin) {
        console.log('❌ Regular session expired')
        timerExpiredRef.current = true
        setSessionExpired(true)
        onSessionExpired?.()
      } else if (remainingSeconds > 0) {
        setSessionExpired(false)
      }
    } else if (sessionStatus === 'EXPIRED' && !hasActiveExtension && !isAdminManaged) {
      console.log('❌ Session status is EXPIRED')
      setSessionExpired(true)
      setTimeRemaining(0)
    }
  }, [sessionStatus, sessionStartTime, sessionDurationMinutes, isAdmin, isAdminManaged, adminExtendedUntil, effectiveExpirationTime, isExpired])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || loading) return
    
    // Check if user can send messages (admin can always send)
    const canSend = isAdmin || (!sessionExpired && canSendMessages) || 
                   (adminExtendedUntil && new Date(adminExtendedUntil) > new Date()) ||
                   (effectiveExpirationTime && new Date(effectiveExpirationTime) > new Date()) ||
                   isAdminManaged

    if (!canSend) return

    setSending(true)
    try {
      console.log('📤 Sending message:', {
        content: newMessage,
        isAdmin,
        sessionId
      })
      
      
      await onSendMessage(newMessage, 'TEXT')
      setNewMessage('')
      
      // REMOVED: No more automatic page reload - it's annoying!
      // Let the parent component handle message updates properly
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
  }

  // Utility functions
  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm')
  }

  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getTimeProgress = () => {
    if (!timeRemaining || !sessionDurationMinutes) return 100
    const totalSeconds = sessionDurationMinutes * 60
    return ((totalSeconds - timeRemaining) / totalSeconds) * 100
  }

  const getTimeColor = () => {
    if (!timeRemaining) return 'text-gray-500'
    const minutes = Math.floor(timeRemaining / 60)
    if (minutes <= 2) return 'text-red-600'
    if (minutes <= 5) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getMessageIcon = (sender: string) => {
    switch (sender) {
      case 'USER': return <User className="h-3 w-3" />
      case 'EXPERT': return <Bot className="h-3 w-3" />
      case 'SYSTEM': return <MessageSquare className="h-3 w-3" />
      default: return null
    }
  }

  const getMessageSenderName = (sender: string, senderName?: string) => {
    if (senderName) return senderName
    
    switch (sender) {
      case 'USER': 
        // FIXED: Don't show "Admin (as User)" - it confuses alignment
        return 'You'
      case 'EXPERT': return expertName || 'Security Expert'
      case 'SYSTEM': return 'System'
      default: return sender
    }
  }

  // FIXED: Enhanced status message logic with proper admin extension handling
  const getStatusMessage = () => {
    // Check if session has active admin extension
    const hasActiveExtension = (adminExtendedUntil && new Date(adminExtendedUntil) > new Date()) ||
                              (effectiveExpirationTime && new Date(effectiveExpirationTime) > new Date())
    
    // If admin managed or has active extension, session is accessible
    const isSessionAccessible = isAdminManaged || hasActiveExtension || isAdmin
    
    console.log('📝 Status message check:', {
      sessionStatus,
      sessionExpired,
      isExpired,
      isSessionAccessible,
      hasActiveExtension,
      isAdminManaged
    })

    // Check if session is truly expired (not accessible)
    const isTrulyExpired = !isSessionAccessible && 
                          (sessionExpired || isExpired || sessionStatus === 'EXPIRED')
    
    if (isTrulyExpired) {
      return isAdmin 
        ? null // Admins can always chat
        : 'Your consultation session has expired. Thank you for using ThreatScope!'
    }

    switch (sessionStatus) {
      case 'PENDING':
        return 'Waiting for payment confirmation and expert assignment...'
      case 'ASSIGNED':
        return 'Session is ready to start. Click "Start Session" to begin your consultation.'
      case 'ACTIVE':
        return null // Show chat interface
      case 'COMPLETED':
        return isAdmin 
          ? null // Admins can still chat even after completion
          : (
            <div className="space-y-3">
              <p className="text-green-800 font-medium">🎉 Your consultation has been completed!</p>
              <div className="space-y-2 text-sm">
                <p className="text-green-700">✅ All questions have been addressed by your security expert</p>
                <p className="text-green-700">📋 Session summary and recommendations are available</p>
                <p className="text-green-700">💌 A follow-up email will be sent with consultation details</p>
              </div>
              <p className="text-green-600 text-sm mt-3">
                Thank you for choosing ThreatScope! We hope our expert guidance helps improve your security posture.
              </p>
            </div>
          )
      case 'CANCELLED':
        return 'This consultation has been cancelled.'
      case 'EXPIRED':
        // Only show expired if no admin extension
        return isSessionAccessible ? null : 'This consultation has expired.'
      default:
        return null
    }
  }

  // Check if user can currently send messages
  const canCurrentlySendMessages = () => {
    if (isAdmin) return true // Admins can always send
    
    // Users cannot send messages if session is completed, cancelled, or expired
    if (['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(sessionStatus)) {
      return false
    }
    
    const hasActiveExtension = (adminExtendedUntil && new Date(adminExtendedUntil) > new Date()) ||
                              (effectiveExpirationTime && new Date(effectiveExpirationTime) > new Date())
    
    return (isAdminManaged || hasActiveExtension) || (!sessionExpired && canSendMessages)
  }

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Chat</h3>
          </div>
          
          <div className="flex items-center space-x-3">
            
            {/* WebSocket Connection Status - ENHANCED */}
            {!isAdmin && (
              <div className="flex items-center space-x-1">
                {wsConnected ? (
                  <>
                    <Wifi className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">Offline</span>
                  </>
                )}
              </div>
            )}
            
            {/* Manual Refresh Button - ENHANCED */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('🔄 Manual refresh triggered')
                if (onTestConnection && wsConnected) {
                  onTestConnection() // Test WebSocket first
                  console.log('🧪 WebSocket connection test sent')
                }
                setTimeout(() => window.location.reload(), 500)
              }}
              className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700"
              title="Test connection and refresh to see latest updates"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              {sessionStatus === 'ACTIVE' ? 'Refresh Chat' : 'Check Status'}
            </Button>
            
            {/* Session Timer */}
            {sessionStatus === 'ACTIVE' && timeRemaining !== null && (
              <div className="flex items-center space-x-2">
                <Timer className={`h-4 w-4 ${getTimeColor()}`} />
                <span className={`text-sm font-medium ${getTimeColor()}`}>
                  {formatTimeRemaining(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Session Timer Progress Bar */}
        {sessionStatus === 'ACTIVE' && timeRemaining !== null && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Session Progress</span>
              <span>{sessionDurationMinutes} min consultation</span>
            </div>
            {sessionStartTime ? (
              <>
                <Progress value={getTimeProgress()} className="h-2" />
                {timeRemaining <= 300 && !isAdmin && ( // 5 minutes warning
                  <div className="flex items-center space-x-1 mt-2 text-xs text-yellow-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>Session ending soon</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-xs text-gray-500 mt-1">
                ⏳ Timer will start when expert responds
              </div>
            )}
          </div>
        )}
      </div>

      {/* ENHANCED: Admin Extension Notice for Users */}
      {!isAdmin && (adminExtendedUntil || isAdminManaged || extensionReason) && (
        <div className="p-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800 font-medium">
              {isAdminManaged ? 'Admin Managed Session' : 'Session Extended'}
            </span>
          </div>
          {adminExtendedUntil && (
            <p className="text-xs text-blue-700">
              Extended until: {format(new Date(adminExtendedUntil), 'MMM dd, yyyy - HH:mm')}
            </p>
          )}
          {extensionReason && (
            <p className="text-xs text-blue-700 mt-1">
              Reason: {extensionReason}
            </p>
          )}
          {isAdminManaged && !adminExtendedUntil && (
            <p className="text-xs text-blue-700">
              This session is under admin management and will not expire automatically.
            </p>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              console.log('🔍 Rendering message:', {
                index,
                id: message.id,
                sender: message.sender,
                content: message.content?.substring(0, 30),
                senderUserId: message.senderUserId,
                senderName: message.senderName,
                currentUserId: userId,
                isAdmin: isAdmin
              })
              
              // PROPER SOLUTION: Use actual sender user ID comparison
              const isSystemMessage = message.sender === 'SYSTEM' || message.isSystemMessage
              
              // FIXED: Compare sender user ID with current user ID (handle string/number conversion)
              const normalizeId = (id: any) => id ? String(id) : null
              const currentUserIdStr = normalizeId(userId)
              const senderUserIdStr = normalizeId(message.senderUserId)
              
              const isCurrentUserMessage = senderUserIdStr && currentUserIdStr && senderUserIdStr === currentUserIdStr
              
              // Fallback for old messages without senderUserId
              const isCurrentUserMessageFallback = !message.senderUserId && message.sender === 'USER' && !isSystemMessage
              
              const isSentByCurrentUser = isCurrentUserMessage || isCurrentUserMessageFallback
              
              console.log('🎨 ENHANCED Message alignment logic:', {
                messageId: message.id,
                rawSenderUserId: message.senderUserId,
                senderUserIdStr,
                rawCurrentUserId: userId,
                currentUserIdStr,
                isSystemMessage,
                isCurrentUserMessage,
                isCurrentUserMessageFallback,
                isSentByCurrentUser,
                willAlign: isSentByCurrentUser ? 'RIGHT (current user)' : 'LEFT (other user/system)',
                logic: message.senderUserId ? 'Using senderUserId comparison' : 'Using fallback logic',
                senderName: message.senderName,
                sender: message.sender
              })
              
              // Current user messages go right, everything else goes left
              const justifyClass = isSentByCurrentUser ? 'justify-end' : 'justify-start'
              
              // Determine message styling based on sender
              const getMessageStyle = () => {
                if (isSentByCurrentUser) {
                  return isAdmin 
                    ? 'bg-purple-600 text-white border-2 border-purple-300' // Admin messages
                    : 'bg-blue-600 text-white' // Regular user messages
                }
                
                if (isSystemMessage) {
                  return 'bg-yellow-50 text-yellow-800 border border-yellow-200' // System messages
                }
                
                if (message.sender === 'EXPERT') {
                  return 'bg-gray-100 text-gray-900 border border-gray-200' // Expert messages
                }
                
                return 'bg-gray-100 text-gray-900 border border-gray-200' // Default (other users)
              }
              
              // Determine sender display name
              const getSenderDisplayName = () => {
                // FOR CURRENT USER: Always show "You" regardless of the actual name
                if (isSentByCurrentUser) {
                  return 'You'
                }
                
                // FOR OTHER USERS: Show appropriate labels based on context
                if (isSystemMessage) return 'System'
                
                if (message.sender === 'EXPERT') {
                  return expertName || 'Security Expert'
                }
                
                // FOR OTHER USERS: Use their actual name or fallback
                if (message.senderName && message.senderName.trim()) {
                  return message.senderName
                }
                
                // Final fallback
                return 'User'
              }
              
              return (
                <div
                  key={message.id}
                  className={`flex ${justifyClass}`}
                >
                  <div className={`max-w-[70%] rounded-lg p-3 ${getMessageStyle()}`}>
                    <div className="flex items-center space-x-2 mb-1">
                      {isSystemMessage ? (
                        <MessageSquare className="h-3 w-3" />
                      ) : message.sender === 'EXPERT' ? (
                        <Bot className="h-3 w-3" />
                      ) : (
                        <User className="h-3 w-3" />
                      )}
                      <span className="text-xs font-medium">
                        {getSenderDisplayName()}
                      </span>
                      <span className="text-xs opacity-70">
                        {formatMessageTime(message.createdAt)}
                      </span>
                      {isAdmin && isSentByCurrentUser && (
                        <Badge className="bg-purple-200 text-purple-800 text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              )
            })}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input or Status */}
      <div className="p-4 border-t">
        {getStatusMessage() ? (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">{getStatusMessage()}</p>
            {!isAdmin && (
              <Button className="mt-3" onClick={() => window.location.href = '/consultation'}>
                Book Another Consultation
              </Button>
            )}
          </div>
        ) : canCurrentlySendMessages() ? (
          <div className="space-y-2">
            {/* Admin Extension Notice in Chat Input Area */}
            {isAdmin && (adminExtendedUntil || isAdminManaged || extensionReason) && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Timer className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-800 font-medium">
                    {isAdminManaged ? 'Admin Managed Session' : 'Session Extended'}
                  </span>
                </div>
                {adminExtendedUntil && (
                  <p className="text-xs text-purple-700">
                    Extended until: {format(new Date(adminExtendedUntil), 'MMM dd, yyyy - HH:mm')}
                  </p>
                )}
                {extensionReason && (
                  <p className="text-xs text-purple-700 mt-1">
                    Reason: {extensionReason}
                  </p>
                )}
                {isAdminManaged && !adminExtendedUntil && (
                  <p className="text-xs text-purple-700">
                    This session is under admin management and will not expire automatically.
                  </p>
                )}
              </div>
            )}
            
            {/* Admin Notice for Expired Sessions */}
            {isAdmin && (isExpired || sessionExpired || sessionStatus === 'EXPIRED') && 
             !isAdminManaged && !adminExtendedUntil && (
              <div className="p-2 bg-purple-50 border border-purple-200 rounded-lg mb-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-800 font-medium">Admin Mode: Expired Session</span>
                </div>
                <p className="text-xs text-purple-700 mt-1">
                  You are accessing an expired session with administrative privileges.
                </p>
              </div>
            )}
            
            {/* Message Input */}
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={handleInputChange}
                placeholder={isAdmin && (isExpired || sessionExpired) ? "Admin message (expired session)..." : "Type your message..."}
                onKeyPress={handleKeyPress}
                disabled={sending || loading}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending || loading}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              {sessionExpired 
                ? 'Session has expired. You cannot send messages.' 
                : 'You cannot send messages at this time.'
              }
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}