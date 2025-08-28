import { create } from 'zustand';
import { webSocketService } from '@/lib/websocket';
import { apiClient } from '@/lib/api';
import '@/lib/backend-test'; // Test backend connectivity

export interface Notification {
  id: string;
  type: 'alert' | 'breach' | 'monitoring' | 'system' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data?: any; // Additional data for the notification
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  clearConnectionNotifications: () => void;
  
  // Backend sync
  fetchNotifications: () => Promise<void>;
  syncNotification: (id: string, action: 'read' | 'delete') => Promise<void>;
  syncMarkAllAsRead: () => Promise<void>;
  syncClearAll: () => Promise<void>;
  
  // WebSocket
  connect: () => void;
  disconnect: () => void;
  setConnectionStatus: (connected: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  isLoading: false,

  addNotification: (notificationData) => {
    // FILTER: Skip connection/system notifications that users don't care about
    const skipNotificationTypes = [
      'Connection Error',
      'Real-time Updates Connected', 
      'Failed to connect to real-time updates',
      'WebSocket connection',
      'Connection established',
      'Connection lost'
    ];
    
    if (skipNotificationTypes.some(skipType => 
      notificationData.title.includes(skipType) || 
      notificationData.message.includes(skipType)
    )) {
      console.log('🙅 Skipping connection notification:', notificationData.title);
      return; // Don't add this notification
    }
    
    const notification: Notification = {
      ...notificationData,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      isRead: false,
    };

    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));

    // Show browser notification for high priority alerts
    if (notification.priority === 'critical' || notification.priority === 'high') {
      showBrowserNotification(notification);
    }
  },

  markAsRead: (id) => {
    const { syncNotification } = get();
    
    set((state) => {
      const updatedNotifications = state.notifications.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification
      );
      
      const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
      
      return {
        notifications: updatedNotifications,
        unreadCount,
      };
    });

    // Sync with backend
    syncNotification(id, 'read');
  },

  markAllAsRead: () => {
    const { syncMarkAllAsRead } = get();
    
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));

    // Sync with backend
    syncMarkAllAsRead();
  },

  removeNotification: (id) => {
    const { syncNotification } = get();
    
    set((state) => {
      const notification = state.notifications.find(n => n.id === id);
      const updatedNotifications = state.notifications.filter(n => n.id !== id);
      const unreadCount = notification && !notification.isRead 
        ? state.unreadCount - 1 
        : state.unreadCount;
      
      return {
        notifications: updatedNotifications,
        unreadCount: Math.max(0, unreadCount),
      };
    });

    // Sync with backend
    syncNotification(id, 'delete');
  },

  clearAllNotifications: () => {
    const { syncClearAll } = get();
    
    set({ notifications: [], unreadCount: 0 });

    // Sync with backend
    syncClearAll();
  },
  
  // Clear connection-related notifications specifically
  clearConnectionNotifications: () => {
    set((state) => {
      const connectionKeywords = ['Connection', 'real-time', 'WebSocket', 'Offline', 'Connected'];
      const filteredNotifications = state.notifications.filter(notification => 
        !connectionKeywords.some(keyword => 
          notification.title.toLowerCase().includes(keyword.toLowerCase()) ||
          notification.message.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      
      const removedCount = state.notifications.length - filteredNotifications.length;
      console.log(`🧼 Cleared ${removedCount} connection notifications`);
      
      return {
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.isRead).length,
      };
    });
  },

  // Backend sync methods
  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const backendNotifications = await apiClient.getNotifications();
      const notifications = backendNotifications.map(notification => ({
        id: notification.id || crypto.randomUUID(),
        type: notification.type || 'system',
        title: notification.title || 'Notification',
        message: notification.message || '',
        timestamp: new Date(notification.timestamp || notification.createdAt || Date.now()),
        isRead: notification.isRead || false,
        priority: notification.priority || 'medium',
        data: notification.data
      }));
      
      const unreadCount = notifications.filter(n => !n.isRead).length;
      
      set({ 
        notifications, 
        unreadCount,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ isLoading: false });
    }
  },

  syncNotification: async (id: string, action: 'read' | 'delete') => {
    try {
      if (action === 'read') {
        await apiClient.markNotificationAsRead(id);
      } else if (action === 'delete') {
        await apiClient.deleteNotification(id);
      }
    } catch (error) {
      console.error(`Failed to sync notification ${action}:`, error);
    }
  },

  syncMarkAllAsRead: async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
    } catch (error) {
      console.error('Failed to sync mark all as read:', error);
    }
  },

  syncClearAll: async () => {
    try {
      await apiClient.clearAllNotifications();
    } catch (error) {
      console.error('Failed to sync clear all:', error);
    }
  },

  connect: () => {
    console.log('🚀 Notification store: Starting WebSocket connection...');
    const { addNotification, setConnectionStatus, clearConnectionNotifications } = get();
    
    // Clear any existing connection notifications first
    clearConnectionNotifications();
    
    // Set up callbacks for the comprehensive WebSocket service
    webSocketService.setCallbacks({
      onConnectionStatusChange: (connected) => {
        console.log('🔗 Notification store: Connection status changed to:', connected);
        setConnectionStatus(connected);
        // REMOVED: No more connection status notifications to avoid spam
        // Users don't need to know about WebSocket connection details
      },
      
      // FIXED: Handle general notifications (includes admin extensions)
      onNotification: (notification) => {
        console.log('📨 Notification store: Received general notification:', notification);
        
        // Check if it's an admin extension notification
        const isAdminExtension = notification.type?.includes('EXTENSION') || 
                                notification.title?.toLowerCase().includes('extended') ||
                                notification.message?.toLowerCase().includes('extended');
        
        const isTimerNotification = notification.type?.includes('TIMER') ||
                                   notification.title?.toLowerCase().includes('timer');
        
        const isCompletionNotification = notification.type?.includes('COMPLETION') ||
                                        notification.title?.toLowerCase().includes('completed');
        
        // Always show consultation-related notifications
        if (isAdminExtension || isTimerNotification || isCompletionNotification) {
          addNotification({
            type: 'system',
            title: notification.title,
            message: notification.message,
            priority: 'high',
            data: notification.data
          });
        }
        // Also show high/critical priority notifications
        else if (notification.priority === 'high' || notification.priority === 'critical') {
          addNotification({
            type: notification.type || 'system',
            title: notification.title,
            message: notification.message,
            priority: notification.priority,
            data: notification.data
          });
        } else {
          console.log('📋 Skipping low-priority general notification:', notification.title);
        }
      },
      
      onAlertNotification: (alert) => {
        console.log('🚨 Notification store: Received alert:', alert);
        addNotification({
          type: 'alert',
          title: alert.title,
          message: alert.message,
          priority: alert.severity?.toLowerCase() as 'low' | 'medium' | 'high' | 'critical' || 'medium',
          data: alert
        });
      },
      
      onSystemNotification: (notification) => {
        console.log('💻 Notification store: Received system notification:', notification);
        
        // Check if it's consultation-related
        const isConsultationRelated = notification.title?.toLowerCase().includes('consultation') ||
                                     notification.title?.toLowerCase().includes('session') ||
                                     notification.title?.toLowerCase().includes('extended') ||
                                     notification.title?.toLowerCase().includes('timer') ||
                                     notification.title?.toLowerCase().includes('completed');
        
        // Show consultation-related notifications or critical ones
        if (isConsultationRelated || notification.data?.critical === true || notification.priority === 'critical') {
          addNotification({
            type: 'system',
            title: notification.title,
            message: notification.message,
            priority: 'high',
            data: notification.data
          });
        } else {
          console.log('📋 Skipping non-critical system notification:', notification.title);
        }
      },
      
      onBroadcastAlert: (alert) => {
        console.log('📢 Notification store: Received broadcast alert:', alert);
        addNotification({
          type: 'breach',
          title: alert.title,
          message: alert.message,
          priority: 'critical',
          data: alert
        });
      }
    });
    
    console.log('🚀 Notification store: Attempting WebSocket connection...');
    // Connect using the lib WebSocket service
    webSocketService.connect().then(() => {
      console.log('✅ Notification store: WebSocket connection successful');
      // REMOVED: No connection success notification - users don't need to see this
    }).catch(error => {
      console.error('❌ Notification store: WebSocket connection failed:', error);
      setConnectionStatus(false);
      // REMOVED: No connection error notifications - these are just noise for users
      // Only log to console for debugging
    });
  },

  disconnect: () => {
    webSocketService.disconnect();
    set({ isConnected: false });
  },

  setConnectionStatus: (connected) => {
    set({ isConnected: connected });
  },
}));

// Show browser notifications for important alerts
function showBrowserNotification(notification: Notification) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
  }
}

// Request notification permission
export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}
