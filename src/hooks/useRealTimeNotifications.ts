import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import webSocketService, { NotificationCallbacks, MonitoringUpdate, AlertNotification } from '@/lib/websocket';
import { useAuthStore } from '@/stores/auth';
import { useMonitoringStore } from '@/stores/monitoring';
import useAlertStore from '@/stores/alerts';
import { useNotificationStore } from '@/stores/notifications';

interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

interface RealTimeNotifications {
  connectionStatus: ConnectionStatus;
  latestMonitoringUpdate: MonitoringUpdate | null;
  latestAlert: AlertNotification | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  forceReconnect: () => void;
}

export function useRealTimeNotifications(): RealTimeNotifications {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { refreshAll: refreshMonitoring, items: monitoringItems } = useMonitoringStore();
  const { fetchUnreadCount, fetchAlerts } = useAlertStore();

  // Helper to get monitoring items with real-time frequency
  const getRealTimeMonitoringItems = () => {
    return monitoringItems.filter(item => item.isActive && item.frequency === 'REAL_TIME');
  };

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    connecting: false,
    error: null,
    reconnectAttempts: 0,
  });

  const [latestMonitoringUpdate, setLatestMonitoringUpdate] = useState<MonitoringUpdate | null>(null);
  const [latestAlert, setLatestAlert] = useState<AlertNotification | null>(null);

  // Setup WebSocket callbacks
  useEffect(() => {
    const callbacks: NotificationCallbacks = {
      onConnectionStatusChange: (connected: boolean) => {
        setConnectionStatus(prev => ({
          ...prev,
          connected,
          connecting: false,
          error: connected ? null : prev.error,
        }));
      },

      onMonitoringUpdate: (update: MonitoringUpdate) => {
        console.log('🔄 Received monitoring update:', update);
        setLatestMonitoringUpdate(update);
        
        // Update monitoring store
        const { items, fetchItems } = useMonitoringStore.getState();
        const updatedItems = items.map(item => 
          item.id === update.itemId 
            ? { ...item, lastChecked: update.lastChecked, status: update.status }
            : item
        );
        
        // If the item was updated, refresh items
        if (updatedItems.some(item => item.id === update.itemId)) {
          fetchItems(); // Refresh to get latest data
        }
      },

      onAlertNotification: (alert: AlertNotification) => {
        console.log('🚨 Received alert notification:', alert);
        setLatestAlert(alert);
        
        // Refresh alerts and unread count
        fetchAlerts();
        fetchUnreadCount();
        
        // Refresh monitoring dashboard to update counts
        refreshMonitoring();
      },

      onUnreadCountUpdate: (count: number) => {
        console.log('📊 Unread count updated:', count);
        
        // Update alerts store
        const alertStore = useAlertStore.getState();
        alertStore.unreadCount = count;
      },
    };

    webSocketService.setCallbacks(callbacks);

    return () => {
      webSocketService.setCallbacks({});
    };
  }, [refreshMonitoring, fetchUnreadCount, fetchAlerts]);

  // Connect when authenticated AND has monitoring items with real-time frequency
  useEffect(() => {
    console.log('🔍 Auth/Monitoring state changed:');
    console.log('  - isAuthenticated:', isAuthenticated);
    console.log('  - monitoringItems count:', monitoringItems.length);
    
    const realTimeItems = getRealTimeMonitoringItems();
    console.log('  - real-time monitoring items:', realTimeItems.length);
    
    if (isAuthenticated && realTimeItems.length > 0) {
      // Small delay to ensure token is set in localStorage
      const timer = setTimeout(() => {
        const token = localStorage.getItem('threatscope_token');
        console.log('🔐 Checking for token:', !!token);
        
        if (token) {
          console.log('🔗 User has real-time monitoring items, connecting to WebSocket...');
          console.log('📊 Real-time monitoring items:', realTimeItems.map(item => `${item.monitorType}: ${item.targetValue} (${item.frequency})`));
          connect();
        } else {
          console.log('🔌 User authenticated but no token found, disconnecting WebSocket...');
          disconnect();
        }
      }, 100); // Small delay to ensure localStorage is updated
      
      return () => clearTimeout(timer);
    } else {
      if (!isAuthenticated) {
        console.log('🔌 User not authenticated, disconnecting WebSocket...');
      } else if (realTimeItems.length === 0) {
        console.log('🔌 No real-time monitoring items, disconnecting WebSocket...');
      }
      disconnect();
    }
  }, [isAuthenticated, monitoringItems]);

  // Listen for localStorage changes (token updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'threatscope_token') {
        console.log('🔐 Token changed in localStorage, checking WebSocket connection...');
        
        const realTimeItems = getRealTimeMonitoringItems();
        
        if (e.newValue && isAuthenticated && realTimeItems.length > 0) {
          console.log('🔗 New token detected and has real-time monitoring, connecting WebSocket...');
          connect();
        } else if (!e.newValue) {
          console.log('🔌 Token removed, disconnecting WebSocket...');
          disconnect();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, monitoringItems]);

  // Monitor connection status
  useEffect(() => {
    const intervalId = setInterval(() => {
      const info = webSocketService.getConnectionInfo();
      setConnectionStatus(prev => ({
        ...prev,
        reconnectAttempts: info.reconnectAttempts,
      }));
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const connect = async (): Promise<void> => {
    if (!isAuthenticated) {
      console.warn('Cannot connect WebSocket: user not authenticated');
      return;
    }

    try {
      setConnectionStatus(prev => ({ ...prev, connecting: true, error: null }));
      
      await webSocketService.connect();
      
      console.log('✅ WebSocket connected successfully');
      setConnectionStatus(prev => ({ 
        ...prev, 
        connected: true, 
        connecting: false, 
        error: null 
      }));
      
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
    webSocketService.disconnect();
    setConnectionStatus(prev => ({ 
      ...prev, 
      connected: false, 
      connecting: false 
    }));
  };

  const forceReconnect = (): void => {
    setConnectionStatus(prev => ({ 
      ...prev, 
      connecting: true, 
      error: null, 
      reconnectAttempts: 0 
    }));
    webSocketService.forceReconnect();
  };

  return {
    connectionStatus,
    latestMonitoringUpdate,
    latestAlert,
    connect,
    disconnect,
    forceReconnect,
  };
}

// Hook for connection status indicator
export function useConnectionStatus() {
  const { isConnected } = useNotificationStore();
  return isConnected;
}

export default useRealTimeNotifications;
