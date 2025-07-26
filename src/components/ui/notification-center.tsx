'use client';

import { useEffect, useState } from 'react';
import { Bell, X, Check, AlertTriangle, Shield, Info, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotificationStore, type Notification } from '@/stores/notifications';
import { formatDistanceToNow } from 'date-fns';

const notificationIcons = {
  alert: AlertTriangle,
  breach: Shield,
  monitoring: Info,
  system: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const priorityColors = {
  low: 'text-gray-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  critical: 'text-red-500',
};

const typeColors = {
  alert: 'border-l-orange-500 bg-orange-50',
  breach: 'border-l-red-500 bg-red-50',
  monitoring: 'border-l-blue-500 bg-blue-50',
  system: 'border-l-gray-500 bg-gray-50',
  success: 'border-l-green-500 bg-green-50',
  warning: 'border-l-yellow-500 bg-yellow-50',
  error: 'border-l-red-500 bg-red-50',
};

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    connect,
    disconnect,
  } = useNotificationStore();

  useEffect(() => {
    console.log('🔔 NotificationCenter: Component mounted, calling connect()');
    console.log('🔔 NotificationCenter: connect function:', typeof connect);
    console.log('🔔 NotificationCenter: isConnected:', isConnected);
    
    // Connect to WebSocket when component mounts
    try {
      connect();
      console.log('🔔 NotificationCenter: connect() called successfully');
    } catch (error) {
      console.error('🔔 NotificationCenter: Error calling connect():', error);
    }
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    return () => {
      console.log('🔔 NotificationCenter: Component unmounting, calling disconnect()');
      try {
        disconnect();
      } catch (error) {
        console.error('🔔 NotificationCenter: Error calling disconnect():', error);
      }
    };
  }, []); // Remove dependencies to ensure it only runs once

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type: string) => {
    const IconComponent = notificationIcons[type as keyof typeof notificationIcons] || Info;
    return IconComponent;
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative h-9 w-9 rounded-full"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs font-medium"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-96 p-0" align="end">
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Notifications</h3>
                <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-7 px-2 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllNotifications}
                    className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>
            
            {!isConnected && (
              <p className="text-xs text-red-600 mt-1">
                Disconnected - Real-time updates unavailable
              </p>
            )}
          </div>

          <ScrollArea className="h-96">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs text-gray-400">
                  You'll see alerts and updates here
                </p>
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onRemove={() => removeNotification(notification.id)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onRemove: () => void;
}

function NotificationItem({ notification, onClick, onRemove }: NotificationItemProps) {
  const IconComponent = getNotificationIcon(notification.type);
  const priorityColor = priorityColors[notification.priority];
  const typeColor = typeColors[notification.type];

  return (
    <div
      className={`border-l-4 rounded-lg p-3 mb-2 cursor-pointer transition-all hover:shadow-sm ${typeColor} ${
        !notification.isRead ? 'bg-opacity-100' : 'bg-opacity-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <IconComponent className={`h-4 w-4 mt-0.5 ${priorityColor}`} />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                {notification.title}
              </h4>
              
              {notification.priority === 'critical' && (
                <Badge variant="destructive" className="text-xs">
                  Critical
                </Badge>
              )}
              
              {notification.priority === 'high' && (
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                  High
                </Badge>
              )}
              
              {!notification.isRead && (
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
              )}
            </div>
            
            <p className={`text-xs ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
              {notification.message}
            </p>
            
            <p className="text-xs text-gray-400 mt-1">
              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function getNotificationIcon(type: string) {
  return notificationIcons[type as keyof typeof notificationIcons] || Info;
}
