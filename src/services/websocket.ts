// 🚀 Enhanced WebSocket Service with Real-time Chat Support
import { Client, IFrame, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAuthToken } from '@/lib/auth-utils';

export interface ChatMessage {
  id: string;
  sessionId: string;
  content: string;
  sender: 'USER' | 'EXPERT' | 'SYSTEM';
  messageType: string;
  isSystemMessage: boolean;
  createdAt: string;
  senderName: string;
}

export interface NotificationMessage {
  type: string;
  title: string;
  message: string;
  data?: any;
  timestamp: string;
}

export interface SessionStatusUpdate {
  type: 'SESSION_STATUS_UPDATE';
  sessionId: string;
  oldStatus: string;
  newStatus: string;
  session: any;
  timestamp: number;
}

class EnhancedWebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private callbacks: {
    onNotification?: (notification: NotificationMessage) => void;
    onConnectionChange?: (connected: boolean) => void;
    onConnectionStatusChange?: (connected: boolean) => void; // Alias for compatibility
    onChatMessage?: (message: ChatMessage) => void;
    onSessionStatusUpdate?: (update: SessionStatusUpdate) => void;
    onTypingIndicator?: (data: any) => void;
    onAlertNotification?: (alert: any) => void;
    onSystemNotification?: (notification: any) => void;
    onBroadcastAlert?: (alert: any) => void;
  } = {};

  /**
   * Connect to WebSocket with enhanced chat support
   */
  async connect(userId: string): Promise<boolean> {
    console.log('🔗 Connecting to enhanced WebSocket service...', userId);
    
    const token = getAuthToken();
    if (!token) {
      console.error('❌ No auth token');
      return false;
    }

    return new Promise((resolve) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/api/ws/notifications'),
        
        connectHeaders: {
          'Authorization': `Bearer ${token}`,
          'X-User-ID': userId
        },
        
        onConnect: (frame: IFrame) => {
          console.log('✅ Enhanced WebSocket connected!');
          this.isConnected = true;
          this.callbacks.onConnectionChange?.(true);
          this.callbacks.onConnectionStatusChange?.(true); // Compatibility alias
          this.subscribeToChannels(userId);
          resolve(true);
        },
        
        onStompError: (frame: IFrame) => {
          console.error('❌ WebSocket error:', frame);
          this.isConnected = false;
          this.callbacks.onConnectionChange?.(false);
          this.callbacks.onConnectionStatusChange?.(false); // Compatibility alias
          resolve(false);
        },
        
        onDisconnect: () => {
          console.log('🔌 WebSocket disconnected');
          this.isConnected = false;
          this.callbacks.onConnectionChange?.(false);
          this.callbacks.onConnectionStatusChange?.(false); // Compatibility alias
        }
      });

      this.client.activate();
    });
  }

  /**
   * Subscribe to all real-time channels
   */
  private subscribeToChannels(userId: string) {
    if (!this.client) return;

    console.log('📡 Subscribing to enhanced channels...');

    // 1. User notifications (alerts, system messages)
    this.client.subscribe(`/user/${userId}/queue/notifications`, (message: IMessage) => {
      this.handleNotificationMessage(message);
    });

    // 2. Chat messages
    this.client.subscribe(`/user/${userId}/queue/chat`, (message: IMessage) => {
      this.handleChatMessage(message);
    });

    // 3. Session status updates
    this.client.subscribe(`/user/${userId}/queue/session-updates`, (message: IMessage) => {
      this.handleSessionStatusUpdate(message);
    });

    // 4. Connection tests
    this.client.subscribe(`/user/${userId}/queue/test`, (message: IMessage) => {
      this.handleConnectionTest(message);
    });

    // 5. Global broadcasts
    this.client.subscribe('/topic/broadcasts', (message: IMessage) => {
      this.handleBroadcastMessage(message);
    });

    console.log('✅ Subscribed to enhanced channels');
  }

  /**
   * Subscribe to session-specific channels
   */
  subscribeToSession(sessionId: string) {
    if (!this.client || !this.isConnected) {
      console.warn('❌ Cannot subscribe to session - not connected');
      return;
    }

    console.log('📡 Subscribing to session channels:', sessionId);

    // Session chat messages
    this.client.subscribe(`/topic/session/${sessionId}/chat`, (message: IMessage) => {
      this.handleChatMessage(message);
    });

    // Session updates  
    this.client.subscribe(`/topic/session/${sessionId}/updates`, (message: IMessage) => {
      this.handleSessionStatusUpdate(message);
    });

    // Typing indicators
    this.client.subscribe(`/topic/session/${sessionId}/typing`, (message: IMessage) => {
      this.handleTypingIndicator(message);
    });
  }

  /**
   * Send chat message
   */
  sendChatMessage(sessionId: string, content: string) {
    if (!this.client || !this.isConnected) {
      console.warn('❌ Cannot send message - not connected');
      return false;
    }

    this.client.publish({
      destination: '/app/chat/send',
      body: JSON.stringify({
        sessionId,
        content,
        type: 'TEXT'
      })
    });

    return true;
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(sessionId: string, isTyping: boolean) {
    if (!this.client || !this.isConnected) return;

    this.client.publish({
      destination: '/app/chat/typing',
      body: JSON.stringify({
        sessionId,
        isTyping
      })
    });
  }

  /**
   * Handle different message types
   */
  private handleNotificationMessage(message: IMessage) {
    try {
      const notification = JSON.parse(message.body) as NotificationMessage;
      console.log('📨 Notification received:', notification);
      
      // Route to general notification handler
      this.callbacks.onNotification?.(notification);
      
      // Also route to specific handlers based on type for compatibility
      if (notification.type?.includes('ALERT') || notification.type?.includes('BREACH')) {
        this.callbacks.onAlertNotification?.(notification);
      } else if (notification.type?.includes('SYSTEM') || 
                 notification.type?.includes('EXTENSION') ||
                 notification.type?.includes('TIMER') ||
                 notification.type?.includes('COMPLETION')) {
        this.callbacks.onSystemNotification?.(notification);
      } else if (notification.type?.includes('BROADCAST')) {
        this.callbacks.onBroadcastAlert?.(notification);
      }
    } catch (error) {
      console.error('❌ Failed to parse notification:', error);
    }
  }

  private handleChatMessage(message: IMessage) {
    try {
      const data = JSON.parse(message.body);
      if (data.type === 'CHAT_MESSAGE' && data.message) {
        console.log('💬 Chat message received:', data);
        this.callbacks.onChatMessage?.(data.message);
      }
    } catch (error) {
      console.error('❌ Failed to parse chat message:', error);
    }
  }

  private handleSessionStatusUpdate(message: IMessage) {
    try {
      const update = JSON.parse(message.body) as SessionStatusUpdate;
      console.log('🔄 Session status update:', update);
      this.callbacks.onSessionStatusUpdate?.(update);
    } catch (error) {
      console.error('❌ Failed to parse session update:', error);
    }
  }

  private handleTypingIndicator(message: IMessage) {
    try {
      const data = JSON.parse(message.body);
      console.log('⌨️ Typing indicator:', data);
      this.callbacks.onTypingIndicator?.(data);
    } catch (error) {
      console.error('❌ Failed to parse typing indicator:', error);
    }
  }

  private handleConnectionTest(message: IMessage) {
    try {
      const data = JSON.parse(message.body);
      console.log('🧪 Connection test received:', data);
    } catch (error) {
      console.error('❌ Failed to parse connection test:', error);
    }
  }

  private handleBroadcastMessage(message: IMessage) {
    try {
      const notification = JSON.parse(message.body) as NotificationMessage;
      console.log('📢 Broadcast received:', notification);
      this.callbacks.onNotification?.(notification);
    } catch (error) {
      console.error('❌ Failed to parse broadcast:', error);
    }
  }

  /**
   * Disconnect
   */
  disconnect() {
    console.log('🔌 Disconnecting enhanced WebSocket service...');
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.isConnected = false;
    this.callbacks.onConnectionChange?.(false);
    this.callbacks.onConnectionStatusChange?.(false);
  }


  /**
   * Connection info
   */
  getConnectionInfo() {
    return {
      connected: this.isConnected,
      endpoint: 'http://localhost:8080/api/ws/notifications',
      hasToken: !!getAuthToken()
    };
  }

  /**
   * Set callbacks for different message types
   */
  setCallbacks(callbacks: typeof this.callbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Connection status
   */
  isConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Test authentication
   */
  testAuthentication() {
    return { 
      hasToken: !!getAuthToken(), 
      hasUserId: true 
    };
  }
}

export const webSocketService = new EnhancedWebSocketService();
