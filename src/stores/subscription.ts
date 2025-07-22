import { create } from 'zustand'
import { apiClient } from '@/lib/api'

export interface SubscriptionDetails {
  subscription: {
    id: string
    planName: string
    displayName: string
    planType: string
    status: string
    billingCycle?: string
    amount?: number
    currency?: string
    currentPeriodStart?: string
    currentPeriodEnd?: string
    trialEndDate?: string
    isActive: boolean
    isTrial: boolean
  }
  planLimits: {
    dailySearches: number
    monthlySearches: number
    maxMonitoringItems: number
    maxAlertsPerDay: number
    dailyExports: number
    monthlyExports: number
    hasApiAccess: boolean
    hasRealTimeMonitoring: boolean
    hasEmailAlerts: boolean
    hasInAppAlerts: boolean
    hasWebhookAlerts: boolean
    hasPrioritySupport: boolean
    hasCustomIntegrations: boolean
    hasAdvancedAnalytics: boolean
    allowedFrequencies: string[]
  }
  permissions: {
    canCreateMonitoringItem: boolean
    canPerformSearch: boolean
    hasApiAccess: boolean
    hasRealTimeMonitoring: boolean
    hasPrioritySupport: boolean
    hasAdvancedAnalytics: boolean
  }
  currentUsage: {
    monitoringItems: number
    todaySearches: number
  }
}

interface SubscriptionState {
  // Data
  details: SubscriptionDetails | null
  
  // Loading states
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchDetails: (currentMonitoringItems?: number, todaySearches?: number) => Promise<void>
  clearError: () => void
  
  // Helper methods
  canCreateMonitor: () => boolean
  canPerformSearch: () => boolean
  getRemainingMonitors: () => number
  getPlanDisplayName: () => string
  isFreePlan: () => boolean
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  // Initial state
  details: null,
  isLoading: false,
  error: null,

  // Actions
  fetchDetails: async (currentMonitoringItems = 0, todaySearches = 0) => {
    try {
      set({ isLoading: true, error: null })
      
      console.log('🔄 [Subscription Store] Fetching subscription details...', {
        currentMonitoringItems,
        todaySearches,
        apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
      })
      
      const details = await apiClient.getSubscriptionDetails(currentMonitoringItems, todaySearches)
      
      console.log('✅ [Subscription Store] Subscription details fetched successfully:', details)
      
      set({
        details,
        isLoading: false,
        error: null
      })
    } catch (error: any) {
      console.error('❌ [Subscription Store] Failed to fetch subscription details:', {
        error,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullUrl: `${error.config?.baseURL}${error.config?.url}`,
        data: error.response?.data
      })
      
      let errorMessage = 'Failed to fetch subscription details'
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to backend. Please ensure the backend is running on http://localhost:8080'
      } else if (error.response?.status === 404) {
        errorMessage = 'Subscription endpoint not found. Check if backend is running with correct API path.'
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      set({
        error: errorMessage,
        isLoading: false,
        details: null
      })
    }
  },

  clearError: () => set({ error: null }),

  // Helper methods
  canCreateMonitor: () => {
    const { details } = get()
    return details?.permissions?.canCreateMonitoringItem ?? false
  },

  canPerformSearch: () => {
    const { details } = get()
    return details?.permissions?.canPerformSearch ?? false
  },

  getRemainingMonitors: () => {
    const { details } = get()
    if (!details) return 0
    
    const max = details.planLimits.maxMonitoringItems
    const current = details.currentUsage.monitoringItems
    
    return Math.max(0, max - current)
  },

  getPlanDisplayName: () => {
    const { details } = get()
    return details?.subscription?.displayName || 'Free Plan'
  },

  isFreePlan: () => {
    const { details } = get()
    return details?.subscription?.planType === 'FREE'
  }
}))