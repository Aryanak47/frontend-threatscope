// 🪝 Simple WebSocket Hook for Consultations
import { useEffect, useState } from 'react';
import { webSocketService, NotificationMessage } from '@/lib/websocket';

interface UseWebSocketProps {
  userId: string;
  sessionId?: string;
  onNotification?: (notification: NotificationMessage) => void;
}

export function useConsultationWebSocket({ userId, sessionId, onNotification }: UseWebSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    try {
      console.log('🚀 Connecting WebSocket...');
      const success = await webSocketService.connect(userId);
      if (!success) {
        setError('Failed to connect to WebSocket');
      }
    } catch (err: any) {
      setError(err.message);
      console.error('❌ WebSocket connection failed:', err);
    }
  };

  const disconnect = () => {
    console.log('🔌 Disconnecting WebSocket...');
    webSocketService.disconnect();
  };

  const testConnection = () => {
    console.log('🧪 Testing WebSocket connection...');
    if (webSocketService.isWebSocketConnected()) {
      console.log('✅ WebSocket is connected');
    } else {
      console.log('❌ WebSocket is not connected');
      connect();
    }
  };

  useEffect(() => {
    // Set up callbacks
    webSocketService.setCallbacks({
      onConnectionChange: (connected) => {
        console.log('🔌 Connection changed:', connected);
        setIsConnected(connected);
      },
      onNotification: (notification) => {
        console.log('📨 Received notification:', notification);
        // Filter notifications for this session if sessionId is provided
        if (!sessionId || notification.data?.sessionId === sessionId) {
          onNotification?.(notification);
        }
      }
    });

    // Auto-connect
    if (userId) {
      connect();
    }

    // Cleanup
    return () => {
      disconnect();
    };
  }, [userId, sessionId]);

  return {
    isConnected,
    error,
    connect,
    disconnect,
    testConnection
  };
}
