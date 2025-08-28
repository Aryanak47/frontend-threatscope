'use client'

import { useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/main-layout'
import AuthGuard from '@/components/auth-guard'
import { useSystemNotificationStore } from '@/stores/system-notifications'
import { 
  Bell,
  CheckCircle,
  DollarSign,
  UserCheck,
  Play,
  MessageSquare,
  RefreshCw,
  Check
} from 'lucide-react'
import { format } from 'date-fns'

function SystemNotificationsContent() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearError
  } = useSystemNotificationStore()

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (error) {
      clearError()
    }
  }, [error, clearError])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT_APPROVED': return <DollarSign className="h-5 w-5 text-green-600" />
      case 'EXPERT_ASSIGNED': return <UserCheck className="h-5 w-5 text-blue-600" />
      case 'SESSION_STARTED': return <Play className="h-5 w-5 text-purple-600" />
      case 'SESSION_COMPLETED': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'ADMIN_ACTION': return <MessageSquare className="h-5 w-5 text-orange-600" />
      default: return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'PAYMENT_APPROVED': return 'bg-green-100 text-green-800 border-green-200'
      case 'EXPERT_ASSIGNED': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'SESSION_STARTED': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'SESSION_COMPLETED': return 'bg-green-100 text-green-800 border-green-200'
      case 'ADMIN_ACTION': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy - HH:mm')
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Bell className="h-8 w-8 mr-3 text-blue-600" />
            System Notifications
          </h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
          <Button onClick={fetchNotifications} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
            <p className="text-gray-600">
              You will see system notifications here when admins take actions on your consultations or when important updates occur.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all hover:shadow-md ${
                !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          <Badge className={getNotificationColor(notification.type)}>
                            {notification.type.replace('_', ' ')}
                          </Badge>
                          {!notification.isRead && (
                            <Badge className="bg-blue-600 text-white">
                              New
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-700 mb-3">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{formatDateTime(notification.createdAt)}</span>
                          
                          {notification.relatedSessionId && (
                            <span className="text-blue-600">
                              Session #{notification.relatedSessionId}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 ml-4">
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SystemNotificationsPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <SystemNotificationsContent />
      </MainLayout>
    </AuthGuard>
  )
}