// 🚀 Simple Real-Time Notifications Hook (Fixed)
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useMonitoringStore } from '@/stores/monitoring';
import useAlertStore from '@/stores/alerts';
import webSocketService, { NotificationMessage } from '@/lib/websocket';

interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

export function useRealTimeNotifications() {
  const { isAuthenticated } = useAuthStore();
  const { refreshAll: refreshMonitoring, items: monitoringItems } = useMonitoringStore();
  const { fetchUnreadCount, fetchAlerts } = useAlertStore();

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    connecting: false,
    error: null,
    reconnectAttempts: 0,
  });

  const [latestAlert, setLatestAlert] = useState<NotificationMessage | null>(null);

  // Get user ID
  const getUserId = () => {
    try {
      const directUser = localStorage.getItem('threatscope_user');
      if (directUser) {
        return JSON.parse(directUser)?.id?.toString();
      }
      
      const authStore = localStorage.getItem('threatscope-auth');
      if (authStore) {
        return JSON.parse(authStore).state?.user?.id?.toString();
      }
    } catch (error) {
      console.error('Failed to get user ID:', error);
    }
    return null;
  };

  // Check if user has real-time monitoring items
  const hasRealTimeMonitoring = () => {
    return monitoringItems.some(item => 
      item.isActive && item.frequency === 'REAL_TIME'
    );
  };

  const connect = async (): Promise<void> => {
    const userId = getUserId();
    
    if (!isAuthenticated || !userId) {
      console.warn('Cannot connect: user not authenticated or no user ID');
      return;
    }

    if (!hasRealTimeMonitoring()) {
      console.log('No real-time monitoring items, skipping WebSocket connection');
      return;
    }

    try {
      console.log('🔗 Connecting WebSocket for real-time notifications...');
      setConnectionStatus(prev => ({ ...prev, connecting: true, error: null }));
      
      const success = await webSocketService.connect(userId);
      
      if (success) {
        console.log('✅ WebSocket connected for notifications');
        setConnectionStatus(prev => ({ 
          ...prev, 
          connected: true, 
          connecting: false, 
          error: null 
        }));
      } else {
        throw new Error('Connection failed');
      }
      
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      setConnectionStatus(prev => ({ 
        ...prev, 
        connected: false, 
        connecting: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      }));
    }
  };

  const disconnect = (): void => {
    console.log('🔌 Disconnecting WebSocket for notifications...');
    webSocketService.disconnect();
    setConnectionStatus(prev => ({ 
      ...prev, 
      connected: false, 
      connecting: false 
    }));
  };

  // Setup WebSocket callbacks
  useEffect(() => {
    webSocketService.setCallbacks({
      onConnectionChange: (connected: boolean) => {
        console.log('🔌 WebSocket connection status:', connected);
        setConnectionStatus(prev => ({
          ...prev,
          connected,
          connecting: false,
          error: connected ? null : prev.error,
        }));
      },

      onNotification: (notification: NotificationMessage) => {
        console.log('📨 Received notification:', notification);
        setLatestAlert(notification);
        
        // Refresh alerts and monitoring data
        if (notification.type === 'alert' || notification.type === 'ALERT') {
          fetchAlerts();
          fetchUnreadCount();
        }
        
        if (notification.type === 'monitoring_update' || notification.type === 'MONITORING_UPDATE') {
          refreshMonitoring();
        }
      }
    });

    return () => {
      webSocketService.setCallbacks({});
    };
  }, [fetchAlerts, fetchUnreadCount, refreshMonitoring]);

  // Auto-connect when conditions are met
  useEffect(() => {
    if (isAuthenticated && hasRealTimeMonitoring()) {
      console.log('🚀 User authenticated with real-time monitoring, connecting...');
      const timer = setTimeout(() => connect(), 100);
      return () => clearTimeout(timer);
    } else {
      console.log('🔌 Conditions not met for WebSocket, disconnecting...');
      disconnect();
    }
  }, [isAuthenticated, monitoringItems.length]);

  return {
    connectionStatus,
    latestAlert,
    connect,
    disconnect,
    forceReconnect: connect // Use connect as reconnect for simplicity
  };
}

// Simple connection status hook
export function useConnectionStatus() {
  const { connectionStatus } = useRealTimeNotifications();
  return connectionStatus.connected;
}

export default useRealTimeNotifications;
