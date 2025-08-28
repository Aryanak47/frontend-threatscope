import { create } from 'zustand'
import { apiClient } from '@/lib/api'

interface SystemNotification {
  id: string
  type: 'PAYMENT_APPROVED' | 'PAYMENT_FAILED' | 'EXPERT_ASSIGNED' | 'SESSION_COMPLETED' | 'SESSION_CANCELLED' | 'SECURITY_BREACH' | 'SUBSCRIPTION_EXPIRING'
  title: string
  message: string
  isRead: boolean
  userId: string
  relatedSessionId?: string
  relatedAlertId?: string
  metadata?: Record<string, any>
  createdAt: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

interface SystemNotificationState {
  notifications: SystemNotification[]
  unreadCount: number
  loading: boolean
  error: string | null
  
  // Actions
  fetchNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  createNotification: (notification: Omit<SystemNotification, 'id' | 'createdAt' | 'isRead'>) => void
  clearError: () => void
}

export const useSystemNotificationStore = create<SystemNotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  
  fetchNotifications: async () => {
    set({ loading: true, error: null })
    
    try {
      // ONLY critical notifications - no spam!
      const mockNotifications: SystemNotification[] = [
        {
          id: '1',
          type: 'PAYMENT_APPROVED',
          title: '💳 Payment Approved',
          message: 'Admin has approved your consultation payment. You can now proceed with your session.',
          isRead: false,
          userId: 'current-user',
          relatedSessionId: '3',
          priority: 'HIGH',
          createdAt: new Date().toISOString()
        }
      ]
      
      const unreadCount = mockNotifications.filter(n => !n.isRead).length
      
      set({ 
        notifications: mockNotifications,
        unreadCount,
        loading: false 
      })
    } catch (error: any) {
      console.error('Error fetching system notifications:', error)
      set({ 
        error: error.message || 'Failed to fetch notifications',
        loading: false 
      })
    }
  },
  
  markAsRead: async (notificationId: string) => {
    try {
      // Update local state immediately
      const { notifications } = get()
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
      const unreadCount = updatedNotifications.filter(n => !n.isRead).length
      
      set({ notifications: updatedNotifications, unreadCount })
      
      // In real implementation, would call API to mark as read
      // await apiClient.markSystemNotificationAsRead(notificationId)
    } catch (error: any) {
      console.error('Error marking notification as read:', error)
    }
  },
  
  markAllAsRead: async () => {
    try {
      const { notifications } = get()
      const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }))
      
      set({ notifications: updatedNotifications, unreadCount: 0 })
      
      // In real implementation, would call API
      // await apiClient.markAllSystemNotificationsAsRead()
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error)
    }
  },
  
  createNotification: (notification) => {
    const newNotification: SystemNotification = {
      ...notification,
      id: Date.now().toString(),
      isRead: false,
      priority: notification.priority || 'MEDIUM',
      createdAt: new Date().toISOString()
    }
    
    const { notifications, unreadCount } = get()
    set({ 
      notifications: [newNotification, ...notifications],
      unreadCount: unreadCount + 1
    })
  },
  
  clearError: () => set({ error: null })
}))

// Helper function to create ONLY critical notifications
export const createCriticalNotification = (
  type: SystemNotification['type'],
  sessionId: string,
  customMessage?: string
) => {
  const { createNotification } = useSystemNotificationStore.getState()
  
  // ONLY CRITICAL notifications that require user action
  const criticalNotifications = {
    'PAYMENT_APPROVED': {
      title: '💳 Payment Approved',
      message: customMessage || `Your consultation payment has been approved. Session #${sessionId} is ready to begin.`,
      priority: 'HIGH' as const
    },
    'PAYMENT_FAILED': {
      title: '❌ Payment Failed',
      message: customMessage || `Payment for session #${sessionId} failed. Please update your payment method.`,
      priority: 'HIGH' as const
    },
    'EXPERT_ASSIGNED': {
      title: '👨‍💼 Expert Assigned',
      message: customMessage || `An expert has been assigned to your consultation session #${sessionId}.`,
      priority: 'HIGH' as const
    },
    'SESSION_COMPLETED': {
      title: '✅ Session Completed',
      message: customMessage || `Your consultation session #${sessionId} has been completed. Please rate your experience.`,
      priority: 'MEDIUM' as const
    },
    'SESSION_CANCELLED': {
      title: '⚠️ Session Cancelled',
      message: customMessage || `Your consultation session #${sessionId} has been cancelled.`,
      priority: 'HIGH' as const
    },
    'SECURITY_BREACH': {
      title: '🔴 Security Alert',
      message: customMessage || 'A security breach has been detected. Please review your account immediately.',
      priority: 'HIGH' as const
    },
    'SUBSCRIPTION_EXPIRING': {
      title: '⏰ Subscription Expiring',
      message: customMessage || 'Your subscription expires soon. Renew now to continue accessing premium features.',
      priority: 'MEDIUM' as const
    }
  }
  
  const notificationData = criticalNotifications[type]
  
  if (notificationData) {
    createNotification({
      type,
      ...notificationData,
      userId: 'current-user', // In real app, this would be the actual user ID
      relatedSessionId: sessionId,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'system'
      }
    })
  } else {
    console.warn(`Attempted to create non-critical notification: ${type}. Skipping.`)
  }
}
