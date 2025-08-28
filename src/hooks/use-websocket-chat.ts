// 🚀 Enhanced WebSocket Chat Hook with Real-time Support
import { useEffect, useState, useCallback } from 'react';
import { webSocketService, ChatMessage, SessionStatusUpdate } from '@/services/websocket';
import { toast } from 'react-hot-toast';
import { getUserId } from '@/lib/auth-utils';

interface UseWebSocketChatProps {
  sessionId?: string;
  userId?: string;
  onChatMessage?: (message: ChatMessage) => void;
  onSessionStatusUpdate?: (update: SessionStatusUpdate) => void;
  onTypingIndicator?: (data: any) => void;
  autoConnect?: boolean;
}

export function useWebSocketChat({
  sessionId,
  userId,
  onChatMessage,
  onSessionStatusUpdate,
  onTypingIndicator,
  autoConnect = true
}: UseWebSocketChatProps = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  // Get user ID from localStorage if not provided
  const getCurrentUserId = useCallback(() => {
    return userId || getUserId();
  }, [userId]);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      setLastError('No user ID available');
      return false;
    }

    try {
      setConnectionAttempts(prev => prev + 1);
      setLastError(null);

      console.log('🔗 Connecting WebSocket chat...', { userId: currentUserId, sessionId });
      
      const success = await webSocketService.connect(currentUserId);
      
      if (success) {
        setIsConnected(true);
        setLastError(null);
        
        // Subscribe to session-specific channels if sessionId is provided
        if (sessionId) {
          webSocketService.subscribeToSession(sessionId);
        }
        
        toast.success('Connected to real-time chat');
        console.log('✅ WebSocket chat connected successfully');
        return true;
      } else {
        setLastError('Failed to connect to WebSocket');
        toast.error('Failed to connect to real-time chat');
        return false;
      }
    } catch (error: any) {
      console.error('❌ WebSocket chat connection failed:', error);
      setLastError(error.message);
      toast.error('Chat connection failed');
      return false;
    }
  }, [getCurrentUserId, sessionId]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket chat...');
    webSocketService.disconnect();
    setIsConnected(false);
  }, []);

  // Force reconnect
  const forceReconnect = useCallback(async () => {
    console.log('🔄 Force reconnecting WebSocket chat...');
    disconnect();
    setTimeout(() => {
      connect();
    }, 1000);
  }, [connect, disconnect]);

  // Send chat message
  const sendChatMessage = useCallback((content: string) => {
    if (!sessionId) {
      console.warn('❌ Cannot send message - no session ID');
      return false;
    }
    
    if (!isConnected) {
      console.warn('❌ Cannot send message - not connected');
      toast.error('Not connected to chat');
      return false;
    }

    return webSocketService.sendChatMessage(sessionId, content);
  }, [sessionId, isConnected]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!sessionId || !isConnected) return;
    
    webSocketService.sendTypingIndicator(sessionId, isTyping);
  }, [sessionId, isConnected]);

  // Join session (subscribe to session channels)
  const joinSession = useCallback((newSessionId: string) => {
    if (!isConnected) {
      console.warn('❌ Cannot join session - not connected');
      return;
    }
    
    console.log('📡 Joining session:', newSessionId);
    webSocketService.subscribeToSession(newSessionId);
  }, [isConnected]);

  // Leave session (no explicit unsubscribe needed with current STOMP setup)
  const leaveSession = useCallback(() => {
    console.log('👋 Leaving session');
    // No explicit action needed with current setup
  }, []);

  // Connection test
  const sendConnectionTest = useCallback(() => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId || !isConnected) return;
    
    console.log('🧪 Sending connection test...');
    // Backend will send a test message back to verify connection
  }, [getCurrentUserId, isConnected]);

  // Set up WebSocket callbacks and auto-connect
  useEffect(() => {
    webSocketService.setCallbacks({
      onConnectionChange: (connected) => {
        console.log('🔌 Chat connection changed:', connected);
        setIsConnected(connected);
        if (!connected) {
          setLastError('Connection lost');
        }
      },
      onChatMessage: (message) => {
        console.log('💬 Chat message received:', message);
        onChatMessage?.(message);
      },
      onSessionStatusUpdate: (update) => {
        console.log('🔄 Session status update received:', update);
        onSessionStatusUpdate?.(update);
      },
      onTypingIndicator: (data) => {
        console.log('⌨️ Typing indicator received:', data);
        onTypingIndicator?.(data);
      }
    });

    // Auto-connect if enabled
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (autoConnect) {
        disconnect();
      }
    };
  }, [connect, disconnect, autoConnect, onChatMessage, onSessionStatusUpdate, onTypingIndicator]);

  return {
    isConnected,
    connectionAttempts,
    lastError,
    sendChatMessage,
    sendTypingIndicator,
    sendConnectionTest,
    joinSession,
    leaveSession,
    disconnect,
    forceReconnect,
    connect
  };
}

// Expert WebSocket hook (simplified for now)
export function useExpertWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [expertStatus, setExpertStatus] = useState<'ONLINE' | 'OFFLINE' | 'BUSY'>('OFFLINE');
  const [consultationRequests, setConsultationRequests] = useState<any[]>([]);

  const updateExpertStatus = useCallback((status: typeof expertStatus) => {
    setExpertStatus(status);
    // TODO: Implement expert status updates via WebSocket
  }, []);

  const disconnect = useCallback(() => {
    webSocketService.disconnect();
    setIsConnected(false);
    setExpertStatus('OFFLINE');
  }, []);

  const forceReconnect = useCallback(() => {
    // TODO: Implement expert reconnection logic
  }, []);

  return {
    isConnected,
    consultationRequests,
    expertStatus,
    updateExpertStatus,
    disconnect,
    forceReconnect
  };
}

// Admin WebSocket hook (simplified for now)
export function useAdminWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState(null);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);

  const sendBroadcast = useCallback((message: string) => {
    // TODO: Implement admin broadcast functionality
  }, []);

  const getConnectionStats = useCallback(() => {
    // TODO: Implement connection stats retrieval
    return stats;
  }, [stats]);

  return {
    isConnected,
    stats,
    broadcasts,
    sendBroadcast,
    getConnectionStats
  };
}