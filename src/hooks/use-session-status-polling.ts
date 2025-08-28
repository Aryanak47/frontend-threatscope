import { useEffect, useRef, useCallback } from 'react'
import { useConsultationStore } from '@/stores/consultation'
import { toast } from 'react-hot-toast'

interface SessionStatusPollingProps {
  sessionId: string
  isActive: boolean
  onStatusChange?: (oldStatus: string, newStatus: string) => void
  onTimerStart?: () => void
  onSessionComplete?: () => void
  onSessionExtended?: (extensionInfo: any) => void
}

/**
 * Lightweight polling hook for session status updates
 * Only polls when needed and shows important notifications
 */
export function useSessionStatusPolling({
  sessionId,
  isActive,
  onStatusChange,
  onTimerStart,
  onSessionComplete,
  onSessionExtended
}: SessionStatusPollingProps) {
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastStatusRef = useRef<string | null>(null)
  const lastExtendedUntilRef = useRef<string | null>(null)
  const hasNotifiedTimerStartRef = useRef<boolean>(false)
  const hasNotifiedCompleteRef = useRef<boolean>(false)
  
  const { currentSession, fetchSession } = useConsultationStore()
  
  const checkForUpdates = useCallback(async () => {
    if (!sessionId || !isActive) return
    
    try {
      console.log('🔄 Polling for session updates:', sessionId)
      
      // Fetch fresh session data
      await fetchSession(sessionId)
      const session = useConsultationStore.getState().currentSession
      
      if (!session) return
      
      const currentStatus = session.status
      const lastStatus = lastStatusRef.current
      
      // Check for status changes
      if (lastStatus && lastStatus !== currentStatus) {
        console.log('📊 Session status changed:', lastStatus, '->', currentStatus)
        onStatusChange?.(lastStatus, currentStatus)
        
        // Show appropriate notifications
        if (currentStatus === 'ACTIVE' && !hasNotifiedTimerStartRef.current) {
          toast.success('🚀 Your consultation session has started!')
          onTimerStart?.()
          hasNotifiedTimerStartRef.current = true
        }
        
        if (currentStatus === 'COMPLETED' && !hasNotifiedCompleteRef.current) {
          toast.success('✅ Your consultation session has been completed!')
          onSessionComplete?.()
          hasNotifiedCompleteRef.current = true
        }
      }
      
      // Check for session extensions
      const currentExtendedUntil = session.adminExtendedUntil
      const lastExtendedUntil = lastExtendedUntilRef.current
      
      if (currentExtendedUntil && currentExtendedUntil !== lastExtendedUntil) {
        console.log('⏰ Session extension detected:', currentExtendedUntil)
        toast.success('⏰ Your session has been extended by admin!')
        onSessionExtended?.(session)
        lastExtendedUntilRef.current = currentExtendedUntil
      }
      
      // Update refs
      lastStatusRef.current = currentStatus
      
    } catch (error) {
      console.error('❌ Failed to poll session status:', error)
    }
  }, [sessionId, isActive, fetchSession, onStatusChange, onTimerStart, onSessionComplete, onSessionExtended])
  
  // Set up polling interval
  useEffect(() => {
    if (!isActive || !sessionId) {
      // Clear interval if not active
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }
    
    // Initialize current status
    if (currentSession) {
      lastStatusRef.current = currentSession.status
      lastExtendedUntilRef.current = currentSession.adminExtendedUntil
    }
    
    // Start polling every 15 seconds (less frequent than chat updates)
    console.log('⏰ Starting session status polling for:', sessionId)
    intervalRef.current = setInterval(checkForUpdates, 15000)
    
    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, sessionId, checkForUpdates, currentSession])
  
  // Manual refresh function
  const refreshNow = useCallback(() => {
    console.log('🔄 Manual session status refresh')
    checkForUpdates()
  }, [checkForUpdates])
  
  return {
    refreshNow,
    isPolling: !!intervalRef.current
  }
}
