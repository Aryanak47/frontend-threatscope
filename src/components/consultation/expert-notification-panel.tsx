'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Bell, 
  Clock, 
  User,
  Eye,
  AlertCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ActiveSession {
  id: string
  user: {
    name: string
    email: string
  }
  unreadMessages: number
  lastUserMessage: string
  lastMessageTime: string
  waitingTime: number // minutes
  sessionDuration: number
  timeRemaining?: number
}

interface ExpertNotificationPanelProps {
  onJoinChat: (sessionId: string) => void
}

export function ExpertNotificationPanel({ onJoinChat }: ExpertNotificationPanelProps) {
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [notifications, setNotifications] = useState<string[]>([])

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockSessions: ActiveSession[] = [
      {
        id: '3',
        user: {
          name: 'Miguel Caravaca',
          email: 'miguel_caravaca5497@hotmail.com'
        },
        unreadMessages: 2,
        lastUserMessage: 'I need help with the security alert about a new breach detected on www.xtralife.es',
        lastMessageTime: '2 minutes ago',
        waitingTime: 2,
        sessionDuration: 30,
        timeRemaining: null // Timer hasn't started yet
      }
    ]
    
    setActiveSessions(mockSessions)
    
    // Simulate new message notifications
    const interval = setInterval(() => {
      if (mockSessions.length > 0 && Math.random() > 0.7) {
        const session = mockSessions[0]
        toast(`New message from ${session.user.name}`, {
          icon: '💬',
          duration: 4000,
        })
        setNotifications(prev => [...prev, `${session.user.name} sent a message`])
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const getTotalUnreadMessages = () => {
    return activeSessions.reduce((total, session) => total + session.unreadMessages, 0)
  }

  const getWaitingTimeColor = (minutes: number) => {
    if (minutes <= 1) return 'text-green-600'
    if (minutes <= 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatTimeRemaining = (timeRemaining: number | null) => {
    if (!timeRemaining) return 'Timer not started'
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Expert Dashboard</h3>
              <p className="text-sm text-blue-700">
                {activeSessions.length} active session{activeSessions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          {getTotalUnreadMessages() > 0 && (
            <Badge className="bg-red-500 text-white">
              {getTotalUnreadMessages()} unread
            </Badge>
          )}
        </div>
      </Card>

      {/* Active Sessions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Active Consultations
          </h3>
          <Badge variant="outline">
            {activeSessions.length} session{activeSessions.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {activeSessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active consultation sessions</p>
            <p className="text-sm">Users who start sessions will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 border rounded-lg ${
                  session.unreadMessages > 0 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{session.user.name}</h4>
                      <p className="text-sm text-gray-600">{session.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {session.unreadMessages > 0 && (
                      <Badge className="bg-red-500 text-white">
                        {session.unreadMessages} new
                      </Badge>
                    )}
                    
                    <div className={`flex items-center space-x-1 text-xs ${getWaitingTimeColor(session.waitingTime)}`}>
                      <Clock className="h-3 w-3" />
                      <span>Waiting {session.waitingTime}m</span>
                    </div>
                  </div>
                </div>

                {/* Last Message */}
                <div className="mb-3">
                  <p className="text-sm text-gray-700 bg-white p-2 rounded border-l-4 border-blue-500">
                    "{session.lastUserMessage}"
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {session.lastMessageTime}
                  </p>
                </div>

                {/* Session Info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    <span>Duration: {session.sessionDuration} min</span>
                    <span>
                      Timer: {formatTimeRemaining(session.timeRemaining)}
                    </span>
                  </div>
                  
                  {session.waitingTime > 5 && (
                    <div className="flex items-center space-x-1 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>User waiting too long!</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => onJoinChat(session.id)}
                    className="flex-1"
                    variant={session.unreadMessages > 0 ? "default" : "outline"}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {session.unreadMessages > 0 ? 'Respond Now' : 'Join Chat'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // TODO: View session details
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-4">
        <h3 className="font-medium mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            Set Away Status
          </Button>
        </div>
      </Card>
    </div>
  )
}
