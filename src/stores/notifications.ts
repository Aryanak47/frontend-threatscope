import { create } from 'zustand';
import { webSocketService } from '@/lib/websocket';
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
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // WebSocket
  connect: () => void;
  disconnect: () => void;
  setConnectionStatus: (connected: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isConnected: false,

  addNotification: (notificationData) => {
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
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  removeNotification: (id) => {
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
  },

  clearAllNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  connect: () => {
    console.log('🚀 Notification store: Starting WebSocket connection...');
    const { addNotification, setConnectionStatus } = get();
    
    // Set up callbacks for the comprehensive WebSocket service
    webSocketService.setCallbacks({
      onConnectionStatusChange: (connected) => {
        console.log('🔗 Notification store: Connection status changed to:', connected);
        setConnectionStatus(connected);
        if (connected) {
          addNotification({
            type: 'system',
            title: 'Real-time Updates Connected',
            message: 'You will now receive live notifications',
            priority: 'low'
          });
        }
      },
      
      onAlertNotification: (alert) => {
        console.log('🚨 Notification store: Received alert:', alert);
        addNotification({
          type: 'alert',
          title: alert.title,
          message: alert.message,
          priority: alert.severity.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
          data: alert
        });
      },
      
      onSystemNotification: (notification) => {
        console.log('💻 Notification store: Received system notification:', notification);
        addNotification({
          type: 'system',
          title: notification.title,
          message: notification.message,
          priority: 'low',
          data: notification.data
        });
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
    }).catch(error => {
      console.error('❌ Notification store: WebSocket connection failed:', error);
      setConnectionStatus(false);
      addNotification({
        type: 'error',
        title: 'Connection Error',
        message: 'Failed to connect to real-time updates',
        priority: 'medium'
      });
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
