import { create } from 'zustand'
import { apiClient } from '@/lib/api'
import { useAuthStore } from './auth'

export interface UsageStats {
  totalSearches: number
  totalExports: number
  totalApiCalls: number
  activeDays: number
}

export interface UsageQuota {
  remainingSearches: number
  remainingExports: number
  remainingApiCalls: number
  totalSearches: number
  totalExports: number
  totalApiCalls: number
}

export interface AnonymousUsage {
  searchesToday: number
  maxSearchesPerDay: number
  remainingSearches: number
  resetTime: string // ISO string for when quota resets
}

interface UsageState {
  // Current usage data
  todayUsage: UsageStats | null
  quota: UsageQuota | null
  usageStats: UsageStats | null
  anonymousUsage: AnonymousUsage | null
  
  // Loading states
  isLoadingQuota: boolean
  isLoadingStats: boolean
  isLoadingToday: boolean
  isLoadingAnonymous: boolean
  
  // Error states
  quotaError: string | null
  statsError: string | null
  todayError: string | null
  anonymousError: string | null
  
  // Actions
  fetchQuota: () => Promise<void>
  fetchTodayUsage: () => Promise<void>
  fetchUsageStats: (startDate?: string, endDate?: string) => Promise<void>
  fetchAnonymousUsage: () => Promise<void>
  refreshAllUsageData: () => Promise<void>
  clearErrors: () => void
  incrementAnonymousUsage: () => void
  
  // Utility functions
  canPerformSearch: () => boolean
  canPerformExport: () => boolean
  canPerformApiCall: () => boolean
  getSearchesRemaining: () => number
  getExportsRemaining: () => number
  getApiCallsRemaining: () => number
}

export const useUsageStore = create<UsageState>((set, get) => ({
  // Initial state
  todayUsage: null,
  quota: null,
  usageStats: null,
  anonymousUsage: null,
  isLoadingQuota: false,
  isLoadingStats: false,
  isLoadingToday: false,
  isLoadingAnonymous: false,
  quotaError: null,
  statsError: null,
  todayError: null,
  anonymousError: null,

  // Actions
  fetchQuota: async () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) return
    
    try {
      set({ isLoadingQuota: true, quotaError: null })
      const quota = await apiClient.getUserQuota()
      set({ quota, isLoadingQuota: false })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch quota'
      set({ 
        quotaError: errorMessage, 
        isLoadingQuota: false,
        quota: null
      })
    }
  },

  fetchTodayUsage: async () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) return
    
    try {
      set({ isLoadingToday: true, todayError: null })
      const todayUsage = await apiClient.getTodayUsage()
      set({ todayUsage, isLoadingToday: false })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch today\'s usage'
      set({ 
        todayError: errorMessage, 
        isLoadingToday: false,
        todayUsage: null
      })
    }
  },

  fetchUsageStats: async (startDate?: string, endDate?: string) => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) return
    
    try {
      set({ isLoadingStats: true, statsError: null })
      const usageStats = await apiClient.getUserUsageStats(startDate, endDate)
      set({ usageStats, isLoadingStats: false })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch usage statistics'
      set({ 
        statsError: errorMessage, 
        isLoadingStats: false,
        usageStats: null
      })
    }
  },

  fetchAnonymousUsage: async () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (isAuthenticated) return
    
    try {
      set({ isLoadingAnonymous: true, anonymousError: null })
      const anonymousUsage = await apiClient.getAnonymousUsage()
      set({ anonymousUsage, isLoadingAnonymous: false })
    } catch (error: any) {
      // If API call fails, use local storage fallback
      const localUsage = getLocalAnonymousUsage()
      set({ 
        anonymousUsage: localUsage,
        isLoadingAnonymous: false,
        anonymousError: 'Using offline mode'
      })
    }
  },

  refreshAllUsageData: async () => {
    const { isAuthenticated } = useAuthStore.getState()
    const { fetchQuota, fetchTodayUsage, fetchUsageStats, fetchAnonymousUsage } = get()
    
    if (isAuthenticated) {
      await Promise.allSettled([
        fetchQuota(),
        fetchTodayUsage(),
        fetchUsageStats()
      ])
    } else {
      await fetchAnonymousUsage()
    }
  },

  clearErrors: () => set({ 
    quotaError: null, 
    statsError: null, 
    todayError: null,
    anonymousError: null
  }),

  incrementAnonymousUsage: () => {
    const { anonymousUsage } = get()
    if (!anonymousUsage) return
    
    const updated = {
      ...anonymousUsage,
      searchesToday: anonymousUsage.searchesToday + 1,
      remainingSearches: Math.max(0, anonymousUsage.remainingSearches - 1)
    }
    
    set({ anonymousUsage: updated })
    
    // Update local storage
    saveLocalAnonymousUsage(updated)
  },

  // Utility functions
  canPerformSearch: () => {
    const { isAuthenticated } = useAuthStore.getState()
    const { quota, anonymousUsage } = get()
    
    if (isAuthenticated) {
      return quota ? quota.remainingSearches > 0 : false
    } else {
      return anonymousUsage ? anonymousUsage.remainingSearches > 0 : false
    }
  },

  canPerformExport: () => {
    const { isAuthenticated } = useAuthStore.getState()
    const { quota } = get()
    
    // Anonymous users cannot export
    if (!isAuthenticated) return false
    
    return quota ? quota.remainingExports > 0 : false
  },

  canPerformApiCall: () => {
    const { isAuthenticated } = useAuthStore.getState()
    const { quota } = get()
    
    // Anonymous users cannot use API
    if (!isAuthenticated) return false
    
    return quota ? quota.remainingApiCalls > 0 : false
  },

  getSearchesRemaining: () => {
    const { isAuthenticated } = useAuthStore.getState()
    const { quota, anonymousUsage } = get()
    
    if (isAuthenticated) {
      return quota ? quota.remainingSearches : 0
    } else {
      return anonymousUsage ? anonymousUsage.remainingSearches : 0
    }
  },

  getExportsRemaining: () => {
    const { isAuthenticated } = useAuthStore.getState()
    const { quota } = get()
    
    if (!isAuthenticated) return 0
    return quota ? quota.remainingExports : 0
  },

  getApiCallsRemaining: () => {
    const { isAuthenticated } = useAuthStore.getState()
    const { quota } = get()
    
    if (!isAuthenticated) return 0
    return quota ? quota.remainingApiCalls : 0
  }
}))

// Local storage helpers for anonymous usage
function getLocalAnonymousUsage(): AnonymousUsage {
  if (typeof window === 'undefined') {
    return createDefaultAnonymousUsage()
  }
  
  try {
    const stored = localStorage.getItem('threatscope_anonymous_usage')
    if (!stored) return createDefaultAnonymousUsage()
    
    const parsed = JSON.parse(stored)
    const today = new Date().toDateString()
    const storedDate = new Date(parsed.resetTime).toDateString()
    
    // Reset if it's a new day
    if (today !== storedDate) {
      return createDefaultAnonymousUsage()
    }
    
    return parsed
  } catch {
    return createDefaultAnonymousUsage()
  }
}

function saveLocalAnonymousUsage(usage: AnonymousUsage): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('threatscope_anonymous_usage', JSON.stringify(usage))
  } catch (error) {
    console.warn('Failed to save anonymous usage:', error)
  }
}

function createDefaultAnonymousUsage(): AnonymousUsage {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  
  return {
    searchesToday: 0,
    maxSearchesPerDay: 5,
    remainingSearches: 5,
    resetTime: tomorrow.toISOString()
  }
}

// Initialize anonymous usage on app start for non-authenticated users
if (typeof window !== 'undefined') {
  // Subscribe to auth changes
  useAuthStore.subscribe((state) => {
    const { refreshAllUsageData } = useUsageStore.getState()
    
    if (state.isAuthenticated && state.user) {
      // Clear anonymous usage and fetch user quota
      useUsageStore.setState({ anonymousUsage: null })
      refreshAllUsageData()
    } else {
      // Clear user usage and fetch/initialize anonymous usage
      useUsageStore.setState({
        todayUsage: null,
        quota: null,
        usageStats: null,
        quotaError: null,
        statsError: null,
        todayError: null
      })
      refreshAllUsageData()
    }
  })
  
  // Initialize on first load
  setTimeout(() => {
    const { isAuthenticated } = useAuthStore.getState()
    const { refreshAllUsageData } = useUsageStore.getState()
    refreshAllUsageData()
  }, 100)
}
