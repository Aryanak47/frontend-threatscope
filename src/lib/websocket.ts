// 🚀 WebSocket Service - Forwarding to Enhanced Service
// This file maintains backward compatibility while using the enhanced service

import { webSocketService as enhancedWebSocketService } from '@/services/websocket';
export type { NotificationMessage, ChatMessage, SessionStatusUpdate } from '@/services/websocket';

// Legacy interface for backward compatibility
export interface NotificationMessage {
  type: string;
  title: string;
  message: string;
  data?: any;
  timestamp: string;
}

// Forward all calls to the enhanced service
export const webSocketService = {
  connect: (userId: string) => enhancedWebSocketService.connect(userId),
  disconnect: () => enhancedWebSocketService.disconnect(),
  setCallbacks: (callbacks: any) => {
    console.log('🔄 Forwarding callbacks to enhanced WebSocket service:', Object.keys(callbacks));
    return enhancedWebSocketService.setCallbacks(callbacks);
  },
  isWebSocketConnected: () => enhancedWebSocketService.isConnected(),
  isConnected: () => enhancedWebSocketService.isConnected(),
  getConnectionInfo: () => enhancedWebSocketService.getConnectionInfo(),
  
  // Additional enhanced methods
  subscribeToSession: (sessionId: string) => enhancedWebSocketService.subscribeToSession(sessionId),
  sendChatMessage: (sessionId: string, content: string) => enhancedWebSocketService.sendChatMessage(sessionId, content),
  sendTypingIndicator: (sessionId: string, isTyping: boolean) => enhancedWebSocketService.sendTypingIndicator(sessionId, isTyping)
};

export default webSocketService;
