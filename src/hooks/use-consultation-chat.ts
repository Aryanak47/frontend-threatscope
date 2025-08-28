// 🚀 Simple Consultation Chat Hook
import { useEffect, useState } from 'react';
import { useSimpleChat } from './use-simple-chat';
import { toast } from 'react-hot-toast';

interface NotificationMessage {
  type: string;
  title: string;
  message: string;
  data?: any;
  timestamp: string;
}

interface UseConsultationUpdatesProps {
  sessionId: string;
  userName?: string;
  onMessage?: (message: NotificationMessage) => void;
  onChatMessage?: (message: any) => void;
  onStatusUpdate?: (update: any) => void;
  onConnectionChange?: (connected: boolean) => void;
  onTypingIndicator?: (data: any) => void;
}

export function useConsultationUpdates({
  sessionId,
  userName,
  onMessage,
  onChatMessage,
  onStatusUpdate,
  onConnectionChange,
  onTypingIndicator
}: UseConsultationUpdatesProps) {
  
  const [messages, setMessages] = useState<NotificationMessage[]>([]);
  
  // Use simple chat hook
  const { 
    connected, 
    messages: chatMessages, 
    error, 
    sendMessage,
    sendTypingIndicator,
    reconnect
  } = useSimpleChat({
    sessionId,
    onChatMessage: (message) => {
      console.log('💬 Simple chat message received:', message);
      onChatMessage?.(message);
    },
    onConsultationNotification: (notification) => {
      console.log('🔔 User received consultation notification:', notification);
      // Convert to expected format
      const notificationMessage: NotificationMessage = {
        type: notification.type || 'NOTIFICATION',
        title: notification.title || 'Session Update',
        message: notification.message || '',
        data: notification,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, notificationMessage]);
      onMessage?.(notificationMessage);
      
      // Handle status updates specifically
      if (notification.type === 'SESSION_STATUS_UPDATE') {
        onStatusUpdate?.(notification);
      }
    },
    onTypingIndicator: (data) => {
      console.log('⌨️ User received typing indicator:', data);
      onTypingIndicator?.(data);
    }
  });

  // Simple chat message sending
  const sendChatMessage = (content: string) => {
    if (!content.trim()) {
      console.warn('❌ Cannot send empty message');
      return false;
    }

    console.log('💬 Sending simple chat message:', content);
    return sendMessage(content);
  };

  // Send typing indicator
  const handleTyping = (isTyping: boolean) => {
    console.log('⌨️ Typing:', isTyping);
    if (sendTypingIndicator) {
      return sendTypingIndicator(isTyping);
    }
    return false;
  };

  useEffect(() => {
    onConnectionChange?.(connected);
  }, [connected, onConnectionChange]);

  return {
    isConnected: connected,
    messages,
    chatMessages,
    error,
    connectionAttempts: 0,
    sendChatMessage,
    sendTypingIndicator: handleTyping,
    handleTyping,
    testConnection: reconnect,
    connectionMethod: connected ? 'Simple WebSocket' : 'Disconnected',
    fallbackPolling: false
  };
}

export default useConsultationUpdates;
