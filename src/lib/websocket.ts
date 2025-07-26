// Real WebSocket Service using STOMP.js + SockJS for ThreatScope backend
import { Client, IFrame, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import toast from 'react-hot-toast';

export interface MonitoringUpdate {
  itemId: string;
  targetValue: string;
  monitorType: string;
  lastChecked: string;
  status: 'CHECKED' | 'ERROR';
  error?: string;
  details?: Record<string, any>;
}

export interface AlertNotification {
  id: number;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  monitoringItemId?: string;
  targetValue?: string;
  createdAt: string;
  message: string;
  description?: string;
  breachSource?: string;
  breachDate?: string;
  requiresAction?: boolean;
  actions?: Array<{action: string; label: string}>;
}

export interface SystemNotification {
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
}

export interface DashboardUpdate {
  updateType: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface NotificationCallbacks {
  onMonitoringUpdate?: (update: MonitoringUpdate) => void;
  onAlertNotification?: (alert: AlertNotification) => void;
  onSystemNotification?: (notification: SystemNotification) => void;
  onDashboardUpdate?: (update: DashboardUpdate) => void;
  onBroadcastAlert?: (alert: AlertNotification) => void;
  onConnectionStatusChange?: (connected: boolean) => void;
  onUnreadCountUpdate?: (count: number) => void;
}

class RealWebSocketService {
  private client: Client | null = null;
  private callbacks: NotificationCallbacks = {};
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private connectionPromise: Promise<void> | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private currentUserId: string | null = null;

  constructor() {
    // WebSocket service initialized
  }

  private createClient(): Client {
    const sockJSUrl = 'http://localhost:8080/api/ws/notifications';
    console.log('🚀 Creating WebSocket client for URL:', sockJSUrl);
    
    const authHeaders = this.getAuthHeaders();
    console.log('🔐 Using auth headers:', Object.keys(authHeaders));
    
    const client = new Client({
      webSocketFactory: () => {
        console.log('🔗 Creating SockJS connection to:', sockJSUrl);
        return new SockJS(sockJSUrl);
      },
      connectHeaders: authHeaders,
      heartbeatIncoming: 20000,
      heartbeatOutgoing: 20000,
      reconnectDelay: this.reconnectDelay,
      
      onConnect: (frame: IFrame) => {
        console.log('✅ WebSocket STOMP connected successfully!');
        this.onConnected(frame);
      },
      onStompError: (frame: IFrame) => {
        console.error('❌ WebSocket STOMP error occurred');
        this.onError(frame);
      },
      onWebSocketError: (error: Event) => {
        console.error('❌ WebSocket connection error occurred');
        this.onWebSocketError(error);
      },
      onDisconnect: () => {
        console.log('🔌 WebSocket disconnected');
        this.onDisconnected();
      }
    });

    return client;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    const userId = this.getCurrentUserId();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (userId) {
      headers['X-User-ID'] = userId;
      this.currentUserId = userId;
    }
    
    return headers;
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const directToken = localStorage.getItem('threatscope_token');
      if (directToken) return directToken;
      
      const authStore = localStorage.getItem('threatscope-auth');
      if (authStore) {
        const parsed = JSON.parse(authStore);
        return parsed.state?.token || null;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
    
    return null;
  }

  private getCurrentUserId(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const directUser = localStorage.getItem('threatscope_user');
      if (directUser) {
        const user = JSON.parse(directUser);
        return user?.id?.toString() || null;
      }
      
      const authStore = localStorage.getItem('threatscope-auth');
      if (authStore) {
        const parsed = JSON.parse(authStore);
        return parsed.state?.user?.id?.toString() || null;
      }
    } catch (error) {
      console.warn('Failed to get user ID:', error);
    }
    
    return null;
  }

  private onConnected(frame: IFrame) {
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    
    this.callbacks.onConnectionStatusChange?.(true);
    
    toast.success('🔗 Real-time notifications connected', {
      duration: 3000,
      position: 'bottom-right'
    });

    this.subscribeToChannels();
  }

  private subscribeToChannels() {
    if (!this.client || !this.currentUserId) return;

    const userId = this.currentUserId;

    try {
      // Subscribe to all user channels
      this.client.subscribe(`/user/${userId}/queue/alerts`, (message: IMessage) => {
        this.handleAlertMessage(message);
      });

      this.client.subscribe(`/user/${userId}/queue/monitoring`, (message: IMessage) => {
        this.handleMonitoringMessage(message);
      });

      this.client.subscribe(`/user/${userId}/queue/system`, (message: IMessage) => {
        this.handleSystemMessage(message);
      });

      this.client.subscribe(`/user/${userId}/queue/dashboard`, (message: IMessage) => {
        this.handleDashboardMessage(message);
      });

      this.client.subscribe('/topic/broadcasts', (message: IMessage) => {
        this.handleBroadcastMessage(message);
      });

      this.client.subscribe(`/topic/alerts/${userId}`, (message: IMessage) => {
        this.handleAlertMessage(message);
      });

    } catch (error) {
      console.error('Failed to subscribe to channels:', error);
    }
  }

  private handleAlertMessage(message: IMessage) {
    try {
      const alert = JSON.parse(message.body) as AlertNotification;
      this.callbacks.onAlertNotification?.(alert);
      
      if (alert.severity === 'CRITICAL') {
        toast.error(`🚨 ${alert.title}`, {
          duration: 8000,
          position: 'top-right'
        });
      }
    } catch (error) {
      console.error('Failed to parse alert message:', error);
    }
  }

  private handleMonitoringMessage(message: IMessage) {
    try {
      const update = JSON.parse(message.body);
      
      const monitoringUpdate: MonitoringUpdate = {
        itemId: update.itemId,
        targetValue: update.targetValue,
        monitorType: update.monitorType,
        lastChecked: update.lastChecked || update.timestamp,
        status: update.status === 'ERROR' ? 'ERROR' : 'CHECKED',
        error: update.details?.error,
        details: update.details
      };
      
      this.callbacks.onMonitoringUpdate?.(monitoringUpdate);
    } catch (error) {
      console.error('Failed to parse monitoring message:', error);
    }
  }

  private handleSystemMessage(message: IMessage) {
    try {
      const notification = JSON.parse(message.body) as SystemNotification;
      this.callbacks.onSystemNotification?.(notification);
      
      toast.info(notification.title, {
        duration: 5000,
        position: 'bottom-right'
      });
    } catch (error) {
      console.error('Failed to parse system message:', error);
    }
  }

  private handleDashboardMessage(message: IMessage) {
    try {
      const update = JSON.parse(message.body) as DashboardUpdate;
      this.callbacks.onDashboardUpdate?.(update);
    } catch (error) {
      console.error('Failed to parse dashboard message:', error);
    }
  }

  private handleBroadcastMessage(message: IMessage) {
    try {
      const broadcast = JSON.parse(message.body) as AlertNotification;
      this.callbacks.onBroadcastAlert?.(broadcast);
      
      toast(broadcast.title, {
        duration: 6000,
        position: 'top-center',
        icon: '📢'
      });
    } catch (error) {
      console.error('Failed to parse broadcast message:', error);
    }
  }

  private onError(frame: IFrame) {
    console.error('❌ WebSocket STOMP error frame:', frame);
    console.error('❌ Error details:', {
      command: frame.command,
      headers: frame.headers,
      body: frame.body
    });
    
    this.isConnected = false;
    this.callbacks.onConnectionStatusChange?.(false);
    
    toast.error('WebSocket connection error', {
      duration: 5000,
      position: 'bottom-right'
    });

    this.handleReconnection();
  }

  private onWebSocketError(error: Event) {
    console.error('❌ WebSocket connection error:', error);
    console.error('❌ WebSocket error details:', {
      type: error.type,
      target: error.target,
      timeStamp: error.timeStamp
    });
    
    this.isConnected = false;
    this.callbacks.onConnectionStatusChange?.(false);
    this.handleReconnection();
  }

  private onDisconnected() {
    this.isConnected = false;
    this.callbacks.onConnectionStatusChange?.(false);
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.handleReconnection();
    } else {
      toast.error('WebSocket disconnected - manual reconnection required', {
        duration: 10000,
        position: 'bottom-right'
      });
    }
  }

  private handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.forceReconnect();
    }, delay);
  }

  // Public API methods
  connect(): Promise<void> {
    console.log('🚀 WebSocket connect() called');
    
    if (this.connectionPromise) {
      console.log('🔄 Connection already in progress, returning existing promise');
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        console.log('🚀 Creating new WebSocket client...');
        this.client = this.createClient();
        
        const timeout = setTimeout(() => {
          console.error('⏰ WebSocket connection timeout after 30 seconds');
          reject(new Error('Connection timeout'));
        }, 30000);

        const originalOnConnect = this.client.onConnect;
        this.client.onConnect = (frame: IFrame) => {
          console.log('✅ WebSocket connection established, clearing timeout');
          clearTimeout(timeout);
          if (originalOnConnect) {
            originalOnConnect.call(this.client, frame);
          }
          resolve();
        };

        const originalOnError = this.client.onStompError;
        this.client.onStompError = (frame: IFrame) => {
          console.error('❌ WebSocket STOMP error, clearing timeout');
          clearTimeout(timeout);
          if (originalOnError) {
            originalOnError.call(this.client, frame);
          }
          reject(new Error(`Connection failed: ${frame.headers['message'] || 'Unknown error'}`));
        };

        console.log('🚀 Activating WebSocket client...');
        this.client.activate();
        console.log('✅ WebSocket client activation initiated');
        
      } catch (error) {
        console.error('❌ Error in WebSocket connect():', error);
        reject(error);
      }
    });

    this.connectionPromise.finally(() => {
      console.log('🔌 WebSocket connection promise completed');
      this.connectionPromise = null;
    });

    return this.connectionPromise;
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
    this.callbacks.onConnectionStatusChange?.(false);
  }

  setCallbacks(callbacks: NotificationCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  isWebSocketConnected(): boolean {
    return this.isConnected && this.client?.connected === true;
  }

  getConnectionInfo() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      url: 'http://localhost:8080/api/ws/notifications (SockJS)',
      userId: this.getCurrentUserId(),
      hasToken: !!this.getAuthToken()
    };
  }

  forceReconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Force reconnect failed:', error);
      });
    }, 1000);
  }
}

// Singleton instance
export const webSocketService = new RealWebSocketService();

export default webSocketService;
