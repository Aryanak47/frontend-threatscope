import React, { useState, useEffect } from 'react';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { useMonitoringStore } from '@/stores/monitoring';
import { useAuthStore } from '@/stores/auth';
import { Wifi, WifiOff, Loader2, Monitor, MonitorX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  showText?: boolean;
  className?: string;
}

export function ConnectionStatus({ showText = false, className }: ConnectionStatusProps) {
  const { isAuthenticated } = useAuthStore();
  const { items: monitoringItems } = useMonitoringStore();
  const { connectionStatus } = useRealTimeNotifications();
  const [isInitializing, setIsInitializing] = useState(true);

  const activeItems = monitoringItems.filter(item => item.isActive);
  const realTimeItems = monitoringItems.filter(item => item.isActive && item.frequency === 'REAL_TIME');
  const hasRealTimeMonitoring = realTimeItems.length > 0;
  const isConnected = connectionStatus.connected;

  useEffect(() => {
    // Show initializing state for first 2 seconds
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Don't show connection status if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // If no real-time monitoring items, show appropriate state
  if (!hasRealTimeMonitoring) {
    const hasActiveItems = activeItems.length > 0;
    
    return (
      <div className={cn(
        "flex items-center gap-2 text-sm text-gray-500",
        className
      )}>
        <MonitorX className="h-4 w-4" />
        {showText && (
          <span className="hidden sm:inline" title={hasActiveItems ? `${activeItems.length} items active but no real-time monitoring` : 'No monitoring items'}>
            {hasActiveItems ? 'No real-time' : 'No monitoring'}
          </span>
        )}
        <div className="h-2 w-2 rounded-full bg-gray-400" />
      </div>
    );
  }

  // If connecting, show connecting state
  if (connectionStatus.connecting) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-sm text-blue-600",
        className
      )}>
        <Loader2 className="h-4 w-4 animate-spin" />
        {showText && (
          <span className="hidden sm:inline">
            Connecting...
          </span>
        )}
        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
      </div>
    );
  }

  // Show connection status for real-time monitoring
  return (
    <div className={cn(
      "flex items-center gap-2 text-sm",
      isConnected ? "text-green-600" : "text-red-500",
      className
    )}>
      {isConnected ? (
        <Monitor className="h-4 w-4" />
      ) : (
        <MonitorX className="h-4 w-4" />
      )}
      
      {showText && (
        <span className="hidden sm:inline" title={`Real-time monitoring ${realTimeItems.length} item${realTimeItems.length !== 1 ? 's' : ''}`}>
          {isConnected ? `Live (${realTimeItems.length})` : `Offline (${realTimeItems.length})`}
        </span>
      )}
      
      {/* Status indicator dot */}
      <div className={cn(
        "h-2 w-2 rounded-full",
        isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
      )} />
    </div>
  );
}

export default ConnectionStatus;
