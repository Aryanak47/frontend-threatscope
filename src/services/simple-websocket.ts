// 🚀 Simple WebSocket Service - Minimal Implementation
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { getAuthToken, getUserId, getUserName } from '@/lib/auth-utils';

interface SimpleMessage {
  type: string;
  data: any;
  timestamp: number;
}

class SimpleWebSocketService {
  private client: Client | null = null;
  private connected = false;
  private onMessage?: (message: SimpleMessage) => void;
  private onConnect?: (connected: boolean) => void;

  connect(userId: string): Promise<boolean> {
    console.log('🔗 Simple WebSocket connecting...', userId);
    
    // Don't connect if already connected
    if (this.connected && this.client) {
      console.log('⚠️ Already connected, skipping connection attempt');
      return Promise.resolve(true);
    }
    
    return new Promise((resolve) => {
      try {
        const token = this.getToken();
        if (!token) {
          console.error('❌ No token found');
          resolve(false);
          return;
        }

        this.client = new Client({
          webSocketFactory: () => new SockJS('http://localhost:8080/api/ws/notifications'),
          connectHeaders: {
            'Authorization': `Bearer ${token}`,
            'X-User-ID': userId
          },
          // Add heartbeat and reconnect settings
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          reconnectDelay: 5000,
          
          onConnect: () => {
            console.log('✅ Simple WebSocket connected');
            this.connected = true;
            this.onConnect?.(true);
            this.subscribe(userId);
            resolve(true);
          },
          onStompError: (error) => {
            console.error('❌ WebSocket error:', error);
            this.connected = false;
            this.onConnect?.(false);
            resolve(false);
          },
          onDisconnect: () => {
            console.log('🔌 WebSocket disconnected');
            this.connected = false;
            this.onConnect?.(false);
          }
        });

        this.client.activate();
      } catch (error) {
        console.error('❌ WebSocket connection failed:', error);
        resolve(false);
      }
    });
  }

  private subscribe(userId: string) {
    if (!this.client) return;

    // Subscribe to user notifications
    this.client.subscribe(`/user/${userId}/queue/notifications`, (msg) => {
      try {
        const data = JSON.parse(msg.body);
        this.onMessage?.({
          type: 'NOTIFICATION',
          data: data,
          timestamp: Date.now()
        });
      } catch (e) {
        console.error('Failed to parse notification:', e);
      }
    });

    // Subscribe to user chat messages
    this.client.subscribe(`/user/${userId}/queue/chat`, (msg) => {
      try {
        const data = JSON.parse(msg.body);
        this.onMessage?.({
          type: 'CHAT_MESSAGE',
          data: data,
          timestamp: Date.now()
        });
      } catch (e) {
        console.error('Failed to parse chat message:', e);
      }
    });

    console.log('✅ Subscribed to simple channels');
  }

  private subscribedSessions = new Set<string>();

  subscribeToSession(sessionId: string) {
    if (!this.client || !this.connected) return;
    
    // Prevent duplicate subscriptions
    if (this.subscribedSessions.has(sessionId)) {
      console.log('⚠️ Already subscribed to session:', sessionId);
      return;
    }

    // Subscribe to consultation chat (matches backend controller)
    this.client.subscribe(`/topic/consultation/${sessionId}/chat`, (msg) => {
      try {
        const data = JSON.parse(msg.body);
        console.log('📨 Real-time chat message received:', data);
        this.onMessage?.({
          type: 'CHAT_MESSAGE',
          data: data,
          timestamp: Date.now()
        });
      } catch (e) {
        console.error('Failed to parse consultation chat:', e);
      }
    });

    // Subscribe to session status updates
    this.client.subscribe(`/topic/consultation/${sessionId}`, (msg) => {
      try {
        const data = JSON.parse(msg.body);
        console.log('📨 Consultation notification received:', data);
        this.onMessage?.({
          type: 'CONSULTATION_NOTIFICATION',
          data: data,
          timestamp: Date.now()
        });
      } catch (e) {
        console.error('Failed to parse consultation notification:', e);
      }
    });

    // Subscribe to typing indicators
    this.client.subscribe(`/topic/consultation/${sessionId}/typing`, (msg) => {
      try {
        const data = JSON.parse(msg.body);
        console.log('⌨️ Typing indicator received:', data);
        this.onMessage?.({
          type: 'TYPING_INDICATOR',
          data: data,
          timestamp: Date.now()
        });
      } catch (e) {
        console.error('Failed to parse typing indicator:', e);
      }
    });

    this.subscribedSessions.add(sessionId);
    console.log('✅ Subscribed to consultation channels for session:', sessionId);
  }

  sendMessage(sessionId: string, content: string): boolean {
    if (!this.client || !this.connected) {
      console.warn('❌ Cannot send message - not connected');
      return false;
    }

    try {
      // Get user info for sender details
      const userId = this.getUserId();
      const senderName = this.getUserName();
      
      // Detect if this is an admin user (check current path or user role)
      const isAdmin = typeof window !== 'undefined' && window.location.pathname.includes('/admin');

      const messageData = {
        sessionId: sessionId,
        content: content,
        sender: isAdmin ? 'ADMIN' : 'USER',
        senderName: senderName || (isAdmin ? 'Admin' : 'User'),
        userId: userId,
        type: 'TEXT',
        timestamp: Date.now()
      };

      console.log('📤 Sending real-time message:', messageData);

      // Send to backend WebSocket controller (matches backend @MessageMapping)
      this.client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(messageData)
      });
      return true;
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      return false;
    }
  }

  sendTypingIndicator(sessionId: string, isTyping: boolean): boolean {
    if (!this.client || !this.connected) {
      console.warn('❌ Cannot send typing indicator - not connected');
      return false;
    }

    try {
      const userId = this.getUserId();
      const senderName = this.getUserName();
      const isAdmin = typeof window !== 'undefined' && window.location.pathname.includes('/admin');

      const typingData = {
        sessionId: sessionId,
        sender: isAdmin ? 'ADMIN' : 'USER',
        senderName: senderName || (isAdmin ? 'Admin' : 'User'),
        userId: userId,
        isTyping: isTyping,
        timestamp: Date.now()
      };

      console.log('⌨️ Sending typing indicator:', typingData);

      // Send to backend WebSocket controller
      this.client.publish({
        destination: '/app/typing.indicator',
        body: JSON.stringify(typingData)
      });
      return true;
    } catch (error) {
      console.error('❌ Failed to send typing indicator:', error);
      return false;
    }
  }

  private getUserId(): string | null {
    return getUserId();
  }

  private getUserName(): string | null {
    return getUserName();
  }

  disconnect() {
    console.log('🔌 Disconnecting simple WebSocket...');
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.connected = false;
    this.subscribedSessions.clear();
    this.onConnect?.(false);
  }

  isConnected(): boolean {
    return this.connected;
  }

  setMessageHandler(handler: (message: SimpleMessage) => void) {
    this.onMessage = handler;
  }

  setConnectionHandler(handler: (connected: boolean) => void) {
    this.onConnect = handler;
  }

  private getToken(): string | null {
    return getAuthToken();
  }
}

export const simpleWebSocketService = new SimpleWebSocketService();
export default simpleWebSocketService;