'use client';

import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { AlertTriangle, WifiOff } from 'lucide-react';

export function ConnectionStatus() {
  const { isOnline, showConnectionIssues } = useConnectionStatus();

  // Only show for serious connection issues that persist
  if (!showConnectionIssues) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right">
      <div className={`
        flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg text-xs font-medium
        ${!isOnline 
          ? 'bg-red-500 text-white' 
          : 'bg-yellow-500 text-white'
        }
      `}>
        {!isOnline ? (
          <>
            <WifiOff className="h-3 w-3" />
            <span>No Internet</span>
          </>
        ) : (
          <>
            <AlertTriangle className="h-3 w-3" />
            <span>Connection Issues</span>
          </>
        )}
      </div>
    </div>
  );
}