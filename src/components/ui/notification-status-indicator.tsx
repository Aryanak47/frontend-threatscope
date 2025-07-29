'use client';

import { useEffect, useState } from 'react';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { useMonitoringStore } from '@/stores/monitoring';
import { useAuthStore } from '@/stores/auth';
import { Wifi, WifiOff } from 'lucide-react';

export function NotificationStatusIndicator() {
  const { isAuthenticated } = useAuthStore();
  const { items: monitoringItems } = useMonitoringStore();
  const { connectionStatus } = useRealTimeNotifications();
  const [showIndicator, setShowIndicator] = useState(false);

  // Only show indicator if user has real-time monitoring items
  useEffect(() => {
    const hasRealTimeMonitoring = isAuthenticated && 
      monitoringItems.some(item => item.isActive && item.frequency === 'REAL_TIME');
    
    setShowIndicator(hasRealTimeMonitoring);
  }, [isAuthenticated, monitoringItems]);

  // Don't show anything if user doesn't have real-time monitoring
  if (!showIndicator) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      {connectionStatus.connected ? (
        <>
          <Wifi className="h-3 w-3 text-green-500" />
          <span className="hidden sm:inline">Live</span>
        </>
      ) : connectionStatus.connecting ? (
        <>
          <div className="h-3 w-3 rounded-full border border-yellow-500 border-t-transparent animate-spin" />
          <span className="hidden sm:inline">Connecting...</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3 text-gray-400" />
          <span className="hidden sm:inline">Offline</span>
        </>
      )}
    </div>
  );
}