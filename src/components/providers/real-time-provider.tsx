"use client";

import React, { useEffect } from 'react';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { useAuthStore } from '@/stores/auth';

interface RealTimeProviderProps {
  children: React.ReactNode;
}

export function RealTimeProvider({ children }: RealTimeProviderProps) {
  const { isAuthenticated } = useAuthStore();
  const { 
    connectionStatus, 
    latestMonitoringUpdate, 
    latestAlert, 
    connect 
  } = useRealTimeNotifications();

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !connectionStatus.connected && !connectionStatus.connecting) {
      console.log('🔗 User authenticated, auto-connecting to real-time notifications...');
      connect().catch(error => {
        console.error('❌ Auto-connect failed:', error);
      });
    }
  }, [isAuthenticated, connectionStatus.connected, connectionStatus.connecting, connect]);

  // Log real-time updates for debugging
  useEffect(() => {
    if (latestMonitoringUpdate) {
      console.log('📊 Real-time monitoring update:', latestMonitoringUpdate);
    }
  }, [latestMonitoringUpdate]);

  useEffect(() => {
    if (latestAlert) {
      console.log('🚨 Real-time alert received:', latestAlert);
    }
  }, [latestAlert]);

  // Log connection status changes
  useEffect(() => {
    if (connectionStatus.connected) {
      console.log('✅ Real-time notifications: CONNECTED');
    } else if (connectionStatus.connecting) {
      console.log('🔄 Real-time notifications: CONNECTING...');
    } else {
      console.log('🔌 Real-time notifications: DISCONNECTED');
    }
  }, [connectionStatus]);

  return (
    <>
      {children}
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white p-2 rounded text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus.connected ? 'bg-green-500' : 
              connectionStatus.connecting ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span>
              WS: {connectionStatus.connected ? 'ON' : connectionStatus.connecting ? 'CONNECTING' : 'OFF'}
            </span>
            {connectionStatus.reconnectAttempts > 0 && (
              <span className="text-yellow-400">
                (Retry: {connectionStatus.reconnectAttempts})
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default RealTimeProvider;
