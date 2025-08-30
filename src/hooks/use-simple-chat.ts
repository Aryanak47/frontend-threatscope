// 🚀 Simple Chat Hook - Minimal Implementation
import { useEffect, useState, useCallback } from 'react';
import { simpleWebSocketService } from '../services/simple-websocket';
import toastUtils from '@/lib/toast/index';
import { getUserId } from '@/lib/auth-utils';

interface SimpleChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
}

interface UseSimpleChatProps {
  sessionId: string;
  onChatMessage?: (message: SimpleChatMessage) => void;
  onConsultationNotification?: (notification: any) => void;
  onTypingIndicator?: (data: any) => void;
}

export function useSimpleChat({ sessionId, onChatMessage, onConsultationNotification, onTypingIndicator }: UseSimpleChatProps) {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<SimpleChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get user ID
  const getCurrentUserId = useCallback(() => {
    return getUserId();
  }, []);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      setError('No user ID found');
      return false;
    }

    try {
      const success = await simpleWebSocketService.connect(userId);
      if (success) {
        simpleWebSocketService.subscribeToSession(sessionId);
        setError(null);
        return true;
      } else {
        setError('Failed to connect');
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [getCurrentUserId, sessionId]);

  // Send message
  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return false;
    
    if (!connected) {
      toast.error('Not connected to chat');
      return false;
    }

    const success = simpleWebSocketService.sendMessage(sessionId, content);
    if (!success) {
      toast.error('Failed to send message');
    }
    return success;
  }, [connected, sessionId]);

  // Set up WebSocket handlers
  useEffect(() => {
    let connectionTimeout: NodeJS.Timeout;
    let isFirstConnection = true;
    
    simpleWebSocketService.setConnectionHandler((isConnected) => {
      setConnected(isConnected);
      
      // Clear any existing timeout
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      
      if (isConnected) {
        // Only show success toast after initial connection or after being disconnected for a while
        if (isFirstConnection) {
          toast.success('Connected to chat', { duration: 2000 });
          isFirstConnection = false;
        }
      } else {
        // Delay showing disconnection message to avoid spam during rapid reconnects
        connectionTimeout = setTimeout(() => {
          toast.error('Chat disconnected - trying to reconnect...', { duration: 3000 });
        }, 2000);
      }
    });

    simpleWebSocketService.setMessageHandler((message) => {
      console.log('📨 Simple message received:', message);
      
      if (message.type === 'CHAT_MESSAGE') {
        const chatMessage: SimpleChatMessage = {
          id: message.data.messageId || Date.now().toString(),
          content: message.data.content || '',
          sender: message.data.senderName || message.data.sender || 'Unknown',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, chatMessage]);
        onChatMessage?.(chatMessage);
        console.log('✅ Added real-time chat message:', chatMessage);
      }
      
      if (message.type === 'CONSULTATION_NOTIFICATION') {
        console.log('📢 Consultation notification:', message.data);
        
        // Handle specific notification types with toasts (deduplicated)
        const notificationType = message.data.type;
        const title = message.data.title || 'Session Update';
        const content = message.data.message || '';
        const toastId = `${notificationType}-${sessionId}-${Date.now()}`;
        
        if (notificationType === 'SESSION_EXTENDED') {
          const additionalHours = message.data.additionalHours || 'some';
          toast.success(`⏰ Session Extended by ${additionalHours} hours!`, { 
            id: `session-extended-${sessionId}`,
            duration: 5000 
          });
        } else if (notificationType === 'TIMER_STARTED') {
          toastUtils.success({
            title: 'Consultation Started!',
            message: 'Your session timer has begun and you can now chat with your expert.',
            tip: 'Make the most of your consultation time by asking specific security questions.'
          });
        } else if (notificationType === 'SESSION_COMPLETED') {
          toastUtils.success({
            title: 'Session Complete!',
            message: 'Your consultation has been completed successfully.',
            tip: 'You can view the session summary and any recommendations provided by your expert.'
          });
        } else if (notificationType === 'EXPERT_ASSIGNED') {
          toastUtils.success({
            title: 'Expert Assigned!',
            message: 'A security expert has been assigned to your consultation.',
            tip: 'Your expert will start the session shortly. They will review your case and provide guidance.'
          });
        } else {
          // Generic notification
          toast.success(`📢 ${title}: ${content}`, { 
            id: toastId,
            duration: 4000 
          });
        }
        
        // Call callback if provided
        onConsultationNotification?.(message.data);
      }
      
      if (message.type === 'TYPING_INDICATOR') {
        console.log('⌨️ Typing indicator:', message.data);
        // Call typing indicator callback if provided
        onTypingIndicator?.(message.data);
      }
    });

    // Auto-connect only once
    let hasConnected = false;
    if (!hasConnected) {
      hasConnected = true;
      connect();
    }

    // Cleanup
    return () => {
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      // Don't disconnect on component unmount - let it persist
    };
  }, [connect, onChatMessage]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!connected) {
      return false;
    }

    const success = simpleWebSocketService.sendTypingIndicator(sessionId, isTyping);
    if (!success) {
      console.warn('Failed to send typing indicator');
    }
    return success;
  }, [connected, sessionId]);

  return {
    connected,
    messages,
    error,
    sendMessage,
    sendTypingIndicator,
    reconnect: connect
  };
}