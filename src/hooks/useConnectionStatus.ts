'use client';

import { useEffect, useState } from 'react';

export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isBackendReachable, setIsBackendReachable] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);
  const [showConnectionIssues, setShowConnectionIssues] = useState(false);

  // Check browser online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check backend connectivity
  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Use health endpoint without /api prefix since it's not under /api
        const response = await fetch('http://localhost:8080/health', { 
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        })
        
        if (response.ok) {
          setIsBackendReachable(true)
          setLastError(null)
          setShowConnectionIssues(false) // Hide immediately when connection is restored
        } else {
          throw new Error(`Health check failed: ${response.status}`)
        }
      } catch (error) {
        setIsBackendReachable(false)
        setLastError(error instanceof Error ? error.message : 'Backend unreachable')
        
        // Only show connection issues after 10 seconds of problems
        setTimeout(() => {
          if (!isBackendReachable) {
            setShowConnectionIssues(true)
          }
        }, 10000)
        
        console.warn('Backend connectivity check failed:', error)
      }
    }

    // Check immediately
    if (isOnline) {
      checkBackend();
    }

    // Set up interval to check every 30 seconds
    const interval = setInterval(() => {
      if (isOnline) {
        checkBackend();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isOnline]);

  return {
    isOnline,
    isBackendReachable,
    lastError,
    isConnected: isOnline && isBackendReachable,
    showConnectionIssues: showConnectionIssues || !isOnline // Always show if offline
  };
}