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
  canSearch: boolean
  remaining: number
  dailyLimit: number
  todayUsage: number
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
  forceRefreshUsageData: () => Promise<void>
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
      console.log('🔄 [Usage Store] Starting today usage fetch...')
      set({ isLoadingToday: true, todayError: null })
      
      const todayUsage = await apiClient.getTodayUsage()
      console.log('✅ [Usage Store] Today usage fetched successfully:', todayUsage)
      
      set({ todayUsage, isLoadingToday: false })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch today\'s usage'
      console.error('❌ [Usage Store] Today usage fetch failed:', errorMessage, error)
      
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

  forceRefreshUsageData: async () => {
    console.log('🔄 [Usage Store] FORCE REFRESH: Starting comprehensive usage refresh...')
    const { isAuthenticated } = useAuthStore.getState()
    const { fetchQuota, fetchTodayUsage, fetchUsageStats, fetchAnonymousUsage } = get()
    
    if (isAuthenticated) {
      console.log('🔄 [Usage Store] FORCE REFRESH: User is authenticated, clearing data first...')
      
      // Clear current data first to ensure fresh fetch
      set({ 
        quota: null, 
        todayUsage: null, 
        usageStats: null,
        quotaError: null,
        todayError: null,
        statsError: null
      })
      
      console.log('🔄 [Usage Store] FORCE REFRESH: Data cleared, fetching fresh data...')
      
      // Fetch fresh data with forced refresh
      const results = await Promise.allSettled([
        fetchQuota(),
        fetchTodayUsage(),
        fetchUsageStats()
      ])
      
      console.log('✅ [Usage Store] FORCE REFRESH: Completed with results:', {
        quota: results[0].status === 'fulfilled' ? 'SUCCESS' : `FAILED: ${results[0].reason}`,
        todayUsage: results[1].status === 'fulfilled' ? 'SUCCESS' : `FAILED: ${results[1].reason}`,
        usageStats: results[2].status === 'fulfilled' ? 'SUCCESS' : `FAILED: ${results[2].reason}`
      })
      
      // Log final state
      const finalState = get()
      console.log('📊 [Usage Store] FORCE REFRESH: Final state after refresh:', {
        hasQuota: !!finalState.quota,
        quotaSearches: finalState.quota?.remainingSearches,
        todaySearches: finalState.todayUsage?.totalSearches,
        isLoading: finalState.isLoadingQuota || finalState.isLoadingToday || finalState.isLoadingStats
      })
    } else {
      console.log('🔄 [Usage Store] FORCE REFRESH: User is anonymous, fetching anonymous usage...')
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
      todayUsage: anonymousUsage.todayUsage + 1,
      remaining: Math.max(0, anonymousUsage.remaining - 1),
      canSearch: anonymousUsage.remaining > 1 // Will be false after this increment
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
      return anonymousUsage ? anonymousUsage.canSearch && anonymousUsage.remaining > 0 : false
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
      return anonymousUsage ? anonymousUsage.remaining : 0
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
    const storedDate = new Date(parsed.date || Date.now()).toDateString()
    
    // Reset if it's a new day
    if (today !== storedDate) {
      return createDefaultAnonymousUsage()
    }
    
    return {
      canSearch: parsed.remaining > 0,
      remaining: parsed.remaining || 0,
      dailyLimit: parsed.dailyLimit || 5,
      todayUsage: parsed.todayUsage || 0
    }
  } catch {
    return createDefaultAnonymousUsage()
  }
}

function saveLocalAnonymousUsage(usage: AnonymousUsage): void {
  if (typeof window === 'undefined') return
  
  try {
    const toSave = {
      ...usage,
      date: new Date().toISOString()
    }
    localStorage.setItem('threatscope_anonymous_usage', JSON.stringify(toSave))
  } catch (error) {
    console.warn('Failed to save anonymous usage:', error)
  }
}

function createDefaultAnonymousUsage(): AnonymousUsage {
  return {
    canSearch: true,
    remaining: 5,
    dailyLimit: 5,
    todayUsage: 0
  }
}

// CRITICAL FIX: Initialize usage data only when components request it
// No more global subscriptions that cause infinite loops
export const initializeUsageData = () => {
  const { refreshAllUsageData } = useUsageStore.getState()
  refreshAllUsageData()
}
