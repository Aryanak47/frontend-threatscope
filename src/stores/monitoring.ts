import { create } from 'zustand'
import { apiClient } from '@/lib/api'
import { DuplicateError, CreateMonitoringItemRequest, UpdateMonitoringItemRequest, MonitoringItemResponse } from '@/types'

export interface MonitoringItem {
  id: string
  monitorType: 'EMAIL' | 'DOMAIN' | 'USERNAME' | 'IP_ADDRESS' | 'KEYWORD'
  targetValue: string
  monitorName: string
  description?: string
  frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'REAL_TIME'
  isActive: boolean
  emailAlerts: boolean
  inAppAlerts: boolean
  webhookAlerts: boolean
  lastChecked?: string
  lastAlertSent?: string
  alertCount: number
  createdAt: string
  updatedAt: string
  status: string
  monitorTypeDisplayName: string
  frequencyDisplayName: string
  monitorTypeDescription: string
}

export interface MonitoringDashboard {
  totalItems: number
  activeItems: number
  totalAlerts: number
  unreadAlerts: number
  recentAlerts: any[]
  statistics: {
    alertsByType: { [key: string]: number }
    alertsBySeverity: { [key: string]: number }
    topTargets: { target: string; alertCount: number }[]
  }
}

interface MonitoringState {
  // Data
  items: MonitoringItem[]
  dashboard: MonitoringDashboard | null
  statistics: any | null
  
  // Loading states
  isLoadingItems: boolean
  isLoadingDashboard: boolean
  isLoadingStatistics: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  
  // Error states
  itemsError: string | null
  dashboardError: string | null
  statisticsError: string | null
  createError: string | null
  updateError: string | null
  deleteError: string | null
  duplicateError: DuplicateError | null
  
  // Pagination
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  
  // Actions
  fetchItems: (page?: number, size?: number) => Promise<void>
  fetchDashboard: () => Promise<void>
  fetchStatistics: () => Promise<void>
  createItem: (item: CreateMonitoringItemRequest) => Promise<MonitoringItemResponse | null>
  updateItem: (itemId: string, item: UpdateMonitoringItemRequest) => Promise<MonitoringItemResponse | null>
  deleteItem: (itemId: string) => Promise<boolean>
  searchItems: (query: string, page?: number, size?: number) => Promise<void>
  refreshAll: () => Promise<void>
  clearErrors: () => void
  clearDuplicateError: () => void
  handleDuplicateConflict: (existingItemId: string) => void
}

export const useMonitoringStore = create<MonitoringState>((set, get) => ({
  // Initial state
  items: [],
  dashboard: null,
  statistics: null,
  isLoadingItems: false,
  isLoadingDashboard: false,
  isLoadingStatistics: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  itemsError: null,
  dashboardError: null,
  statisticsError: null,
  createError: null,
  updateError: null,
  deleteError: null,
  duplicateError: null,
  currentPage: 0,
  totalPages: 0,
  pageSize: 10,
  totalItems: 0,

  // Actions
  fetchItems: async (page = 0, size = 10) => {
    try {
      set({ isLoadingItems: true, itemsError: null })
      const response = await apiClient.getMonitoringItems(page, size)
      
      set({
        items: response.content || [],
        currentPage: response.number || 0,
        totalPages: response.totalPages || 0,
        pageSize: response.size || 10,
        totalItems: response.totalElements || 0,
        isLoadingItems: false
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch monitoring items'
      set({
        itemsError: errorMessage,
        isLoadingItems: false,
        items: []
      })
    }
  },

  fetchDashboard: async () => {
    try {
      set({ isLoadingDashboard: true, dashboardError: null })
      const dashboard = await apiClient.getMonitoringDashboard()
      set({ dashboard, isLoadingDashboard: false })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch monitoring dashboard'
      set({
        dashboardError: errorMessage,
        isLoadingDashboard: false,
        dashboard: null
      })
    }
  },

  fetchStatistics: async () => {
    try {
      set({ isLoadingStatistics: true, statisticsError: null })
      const statistics = await apiClient.getMonitoringStatistics()
      set({ statistics, isLoadingStatistics: false })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch monitoring statistics'
      set({
        statisticsError: errorMessage,
        isLoadingStatistics: false,
        statistics: null
      })
    }
  },

  createItem: async (item: CreateMonitoringItemRequest) => {
    try {
      set({ isCreating: true, createError: null, duplicateError: null })
      const newItem = await apiClient.createMonitoringItem(item)
      
      // Add to current items
      const { items } = get()
      set({
        items: [newItem, ...items],
        isCreating: false
      })
      
      // Refresh dashboard
      get().fetchDashboard()
      
      return newItem
    } catch (error: any) {
      // Check if it's a duplicate monitoring error (409 status)
      if (error.response?.status === 409 && error.response?.data?.data) {
        const duplicateData = error.response.data.data
        const duplicateError = new DuplicateError(duplicateData)
        set({
          duplicateError,
          isCreating: false,
          createError: null
        })
        throw duplicateError
      }
      
      // Handle other errors
      const errorMessage = error.response?.data?.message || 'Failed to create monitoring item'
      set({
        createError: errorMessage,
        isCreating: false,
        duplicateError: null
      })
      throw error
    }
  },

  updateItem: async (itemId: string, item: UpdateMonitoringItemRequest) => {
    try {
      set({ isUpdating: true, updateError: null })
      const updatedItem = await apiClient.updateMonitoringItem(itemId, item)
      
      // Update in current items
      const { items } = get()
      const updatedItems = items.map(i => i.id === itemId ? updatedItem : i)
      set({
        items: updatedItems,
        isUpdating: false
      })
      
      return updatedItem
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update monitoring item'
      set({
        updateError: errorMessage,
        isUpdating: false
      })
      return null
    }
  },

  deleteItem: async (itemId: string) => {
    try {
      set({ isDeleting: true, deleteError: null })
      await apiClient.deleteMonitoringItem(itemId)
      
      // Remove from current items
      const { items } = get()
      const filteredItems = items.filter(i => i.id !== itemId)
      set({
        items: filteredItems,
        isDeleting: false
      })
      
      // Refresh dashboard
      get().fetchDashboard()
      
      return true
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete monitoring item'
      set({
        deleteError: errorMessage,
        isDeleting: false
      })
      return false
    }
  },

  searchItems: async (query: string, page = 0, size = 10) => {
    try {
      set({ isLoadingItems: true, itemsError: null })
      const response = await apiClient.searchMonitoringItems(query, page, size)
      
      set({
        items: response.content || [],
        currentPage: response.number || 0,
        totalPages: response.totalPages || 0,
        pageSize: response.size || 10,
        totalItems: response.totalElements || 0,
        isLoadingItems: false
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to search monitoring items'
      set({
        itemsError: errorMessage,
        isLoadingItems: false,
        items: []
      })
    }
  },

  refreshAll: async () => {
    const { fetchItems, fetchDashboard, fetchStatistics } = get()
    await Promise.allSettled([
      fetchItems(),
      fetchDashboard(),
      fetchStatistics()
    ])
  },

  clearErrors: () => set({
    itemsError: null,
    dashboardError: null,
    statisticsError: null,
    createError: null,
    updateError: null,
    deleteError: null,
    duplicateError: null
  }),

  clearDuplicateError: () => set({ duplicateError: null }),

  handleDuplicateConflict: (existingItemId: string) => {
    // This method can be used to navigate to the existing item
    // The actual navigation logic will be implemented in components
    console.log('Handling duplicate conflict for item:', existingItemId)
  }
}))
