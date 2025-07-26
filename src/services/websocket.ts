// Real WebSocket service for notifications using SockJS + STOMP
import { Client, IFrame, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface WebSocketCallbacks {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (data: any) => void;
}

class WebSocketService {
  private client: Client | null = null;
  private callbacks: WebSocketCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnected = false;

  connect(callbacks: WebSocketCallbacks) {
    this.callbacks = callbacks;
    
    // Get auth data for connection
    const token = this.getAuthToken();
    const userId = this.getCurrentUserId();
    
    console.log('🚀 Attempting WebSocket connection...');
    console.log('  - Has Token:', !!token);
    console.log('  - User ID:', userId);
    
    // Create STOMP client with SockJS
    this.client = new Client({
      webSocketFactory: () => {
        // Build URL with token as query parameter for better compatibility
        let url = 'http://localhost:8080/api/ws/notifications';
        if (token) {
          url += `?access_token=${encodeURIComponent(token)}`;
        }
        console.log('🔗 Connecting to:', url.replace(token || '', 'TOKEN_HIDDEN'));
        return new SockJS(url);
      },
      connectHeaders: this.getAuthHeaders(),
      heartbeatIncoming: 20000,
      heartbeatOutgoing: 20000,
      reconnectDelay: this.reconnectDelay,
      
      onConnect: (frame: IFrame) => {
        console.log('🔗 WebSocket connected:', frame);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.callbacks.onOpen?.();
        
        // Subscribe to channels
        this.subscribeToChannels();
      },
      
      onStompError: (frame: IFrame) => {
        console.error('❌ STOMP error:', frame);
        this.isConnected = false;
        this.callbacks.onError?.(new Event('STOMP Error'));
        this.handleReconnection();
      },
      
      onWebSocketError: (error: Event) => {
        console.error('❌ WebSocket error:', error);
        this.isConnected = false;
        this.callbacks.onError?.(error);
        this.handleReconnection();
      },
      
      onDisconnect: () => {
        console.log('🔌 WebSocket disconnected');
        this.isConnected = false;
        this.callbacks.onClose?.();
        this.handleReconnection();
      }
    });

    // Start connection
    try {
      this.client.activate();
      console.log('🚀 Attempting WebSocket connection to backend...');
    } catch (error) {
      console.error('❌ Failed to start WebSocket connection:', error);
      this.callbacks.onError?.(new Event('Connection Failed'));
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    try {
      // Try to get auth token
      const token = this.getAuthToken();
      const userId = this.getCurrentUserId();
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      if (userId) {
        headers['X-User-ID'] = userId;
      }
      
      console.log('🔐 WebSocket auth headers prepared:', { hasToken: !!token, hasUserId: !!userId });
    } catch (error) {
      console.warn('⚠️ Could not prepare auth headers:', error);
    }
    
    return headers;
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      // Try direct token first (this is what the auth store uses)
      const directToken = localStorage.getItem('threatscope_token');
      if (directToken) {
        console.log('🔐 Found direct token in localStorage');
        return directToken;
      }
      
      // Try auth store as fallback
      const authStore = localStorage.getItem('threatscope-auth');
      if (authStore) {
        const parsed = JSON.parse(authStore);
        const token = parsed.state?.token || null;
        if (token) {
          console.log('🔐 Found token in auth store');
          return token;
        }
      }
      
      console.warn('⚠️ No authentication token found in localStorage');
      return null;
    } catch (error) {
      console.error('❌ Failed to get auth token:', error);
      return null;
    }
  }

  private getCurrentUserId(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      // Try direct user first (this is what the auth store uses)
      const directUser = localStorage.getItem('threatscope_user');
      if (directUser) {
        const user = JSON.parse(directUser);
        const userId = user?.id?.toString() || null;
        if (userId) {
          console.log('👤 Found user ID in localStorage:', userId);
          return userId;
        }
      }
      
      // Try auth store as fallback
      const authStore = localStorage.getItem('threatscope-auth');
      if (authStore) {
        const parsed = JSON.parse(authStore);
        const userId = parsed.state?.user?.id?.toString() || null;
        if (userId) {
          console.log('👤 Found user ID in auth store:', userId);
          return userId;
        }
      }
      
      console.warn('⚠️ No user ID found in localStorage');
      return null;
    } catch (error) {
      console.error('❌ Failed to get user ID:', error);
      return null;
    }
  }

  private subscribeToChannels() {
    if (!this.client) return;

    const userId = this.getCurrentUserId();
    
    try {
      // Subscribe to user-specific notifications
      if (userId) {
        this.client.subscribe(`/user/${userId}/queue/alerts`, (message: IMessage) => {
          this.handleMessage(message);
        });

        this.client.subscribe(`/user/${userId}/queue/monitoring`, (message: IMessage) => {
          this.handleMessage(message);
        });

        this.client.subscribe(`/user/${userId}/queue/system`, (message: IMessage) => {
          this.handleMessage(message);
        });

        console.log(`📡 Subscribed to user channels for user ${userId}`);
      }

      // Subscribe to broadcast channels
      this.client.subscribe('/topic/broadcasts', (message: IMessage) => {
        this.handleMessage(message);
      });

      console.log('📡 Subscribed to broadcast channels');
      
    } catch (error) {
      console.error('❌ Failed to subscribe to channels:', error);
    }
  }

  private handleMessage(message: IMessage) {
    try {
      const data = JSON.parse(message.body);
      console.log('📨 Received WebSocket message:', data);
      this.callbacks.onMessage?.(data);
    } catch (error) {
      console.error('❌ Failed to parse WebSocket message:', error);
    }
  }

  private handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.forceReconnect();
    }, delay);
  }

  private forceReconnect() {
    console.log('🔄 Force reconnecting WebSocket...');
    this.disconnect();
    this.reconnectAttempts = 0;
    
    setTimeout(() => {
      if (this.callbacks.onOpen) {
        this.connect(this.callbacks);
      }
    }, 1000);
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    this.isConnected = false;
    this.callbacks.onClose?.();
  }

  // Add missing method for backward compatibility
  isWebSocketConnected(): boolean {
    return this.isConnected();
  }

  isConnected(): boolean {
    return this.isConnected && this.client?.connected === true;
  }

  // Debug methods
  getConnectionStatus() {
    const token = this.getAuthToken();
    const userId = this.getCurrentUserId();
    
    return {
      isConnected: this.isConnected,
      clientConnected: this.client?.connected || false,
      hasToken: !!token,
      hasUserId: !!userId,
      token: token ? `${token.substring(0, 10)}...` : null,
      userId: userId,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  // Test authentication before connecting
  testAuthentication() {
    const token = this.getAuthToken();
    const userId = this.getCurrentUserId();
    
    console.log('📊 WebSocket Authentication Test:');
    console.log('  - Has Token:', !!token);
    console.log('  - Token Preview:', token ? `${token.substring(0, 20)}...` : 'None');
    console.log('  - Has User ID:', !!userId);
    console.log('  - User ID:', userId);
    console.log('  - Auth Store Keys:', Object.keys(localStorage).filter(k => k.includes('threatscope')));
    
    return {
      hasToken: !!token,
      hasUserId: !!userId,
      token: token,
      userId: userId
    };
  }

  // Send a test message to verify connection
  sendTestMessage() {
    if (this.client && this.isConnected) {
      try {
        this.client.publish({
          destination: '/app/test',
          body: JSON.stringify({ message: 'Test from frontend' })
        });
        console.log('📤 Test message sent');
      } catch (error) {
        console.error('❌ Failed to send test message:', error);
      }
    }
  }
}

export const webSocketService = new WebSocketService();
