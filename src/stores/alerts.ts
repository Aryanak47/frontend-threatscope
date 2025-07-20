import { create } from 'zustand'
import { apiClient } from '@/lib/api'

export interface Alert {
  id: string
  title: string
  description: string
  status: 'UNREAD' | 'READ' | 'ARCHIVED' | 'DISMISSED'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  breachSource: string
  breachDate?: string
  breachData?: string
  affectedEmail?: string
  affectedDomain?: string
  affectedUsername?: string
  dataTypes?: string
  recordCount?: number
  isVerified: boolean
  isFalsePositive: boolean
  isRemediated: boolean
  isAcknowledged: boolean
  isEscalated: boolean
  escalationNotes?: string
  remediationNotes?: string
  acknowledgmentNotes?: string
  riskScore?: number
  confidenceLevel?: number
  createdAt: string
  updatedAt: string
  viewedAt?: string
  acknowledgedAt?: string
  resolvedAt?: string
  dismissedAt?: string
  escalatedAt?: string
  notificationSent: boolean
  notificationSentAt?: string
  emailNotificationSent: boolean
  webhookNotificationSent: boolean
  monitoringItemId?: string
  monitoringItemName?: string
  monitorType?: string
  statusDisplayName: string
  severityDisplayName: string
  monitorTypeDisplayName?: string
  ageInHours: number
  ageInDays: number
  priorityLevel: string
  isRecent: boolean
  isHighPriority: boolean
  isStale: boolean
  lastActionTime?: string
}

export interface AlertStatistics {
  total: number
  unread: number
  critical: number
  high: number
  medium: number
  low: number
  recent: number
  stale: number
  byType: { [key: string]: number }
  bySeverity: { [key: string]: number }
  byStatus: { [key: string]: number }
}

interface AlertState {
  // Data
  alerts: Alert[]
  recentAlerts: Alert[]
  highPriorityAlerts: Alert[]
  statistics: AlertStatistics | null
  unreadCount: number
  
  // Loading states
  isLoadingAlerts: boolean
  isLoadingRecent: boolean
  isLoadingHighPriority: boolean
  isLoadingStatistics: boolean
  isLoadingUnreadCount: boolean
  isUpdating: boolean
  
  // Error states
  alertsError: string | null
  recentError: string | null
  highPriorityError: string | null
  statisticsError: string | null
  unreadCountError: string | null
  updateError: string | null
  
  // Pagination and filters
  currentPage: number
  totalPages: number
  pageSize: number
  totalAlerts: number
  statusFilter?: string
  severityFilter?: string
  
  // Actions
  fetchAlerts: (page?: number, size?: number, status?: string, severity?: string) => Promise<void>
  fetchRecentAlerts: (days?: number) => Promise<void>
  fetchHighPriorityAlerts: () => Promise<void>
  fetchStatistics: () => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAsRead: (alertId: string) => Promise<boolean>
  markAsArchived: (alertId: string) => Promise<boolean>
  markAsFalsePositive: (alertId: string) => Promise<boolean>
  markAsRemediated: (alertId: string, notes?: string) => Promise<boolean>
  escalateAlert: (alertId: string, notes: string) => Promise<boolean>
  bulkMarkAsRead: (alertIds: string[]) => Promise<boolean>
  markAllAsRead: () => Promise<boolean>
  searchAlerts: (query: string, page?: number, size?: number) => Promise<void>
  refreshAll: () => Promise<void>
  clearErrors: () => void
  setFilters: (status?: string, severity?: string) => void
}

export const useAlertStore = create<AlertState>((set, get) => ({
  // Initial state
  alerts: [],
  recentAlerts: [],
  highPriorityAlerts: [],
  statistics: null,
  unreadCount: 0,
  isLoadingAlerts: false,
  isLoadingRecent: false,
  isLoadingHighPriority: false,
  isLoadingStatistics: false,
  isLoadingUnreadCount: false,
  isUpdating: false,
  alertsError: null,
  recentError: null,
  highPriorityError: null,
  statisticsError: null,
  unreadCountError: null,
  updateError: null,
  currentPage: 0,
  totalPages: 0,
  pageSize: 10,
  totalAlerts: 0,
  statusFilter: undefined,
  severityFilter: undefined,

  // Actions
  fetchAlerts: async (page = 0, size = 10, status?: string, severity?: string) => {
    try {
      set({ isLoadingAlerts: true, alertsError: null })
      const response = await apiClient.getAlerts(page, size, 'createdAt', 'desc', status, severity)
      
      set({
        alerts: response.content || [],
        currentPage: response.number || 0,
        totalPages: response.totalPages || 0,
        pageSize: response.size || 10,
        totalAlerts: response.totalElements || 0,
        statusFilter: status,
        severityFilter: severity,
        isLoadingAlerts: false
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch alerts'
      set({
        alertsError: errorMessage,
        isLoadingAlerts: false,
        alerts: []
      })
    }
  },

  fetchRecentAlerts: async (days = 7) => {
    try {
      set({ isLoadingRecent: true, recentError: null })
      const recentAlerts = await apiClient.getRecentAlerts(days)
      set({ recentAlerts, isLoadingRecent: false })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch recent alerts'
      set({
        recentError: errorMessage,
        isLoadingRecent: false,
        recentAlerts: []
      })
    }
  },

  fetchHighPriorityAlerts: async () => {
    try {
      set({ isLoadingHighPriority: true, highPriorityError: null })
      const highPriorityAlerts = await apiClient.getHighPriorityAlerts()
      set({ highPriorityAlerts, isLoadingHighPriority: false })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch high priority alerts'
      set({
        highPriorityError: errorMessage,
        isLoadingHighPriority: false,
        highPriorityAlerts: []
      })
    }
  },

  fetchStatistics: async () => {
    try {
      set({ isLoadingStatistics: true, statisticsError: null })
      const statistics = await apiClient.getAlertStatistics()
      set({ statistics, isLoadingStatistics: false })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch alert statistics'
      set({
        statisticsError: errorMessage,
        isLoadingStatistics: false,
        statistics: null
      })
    }
  },

  fetchUnreadCount: async () => {
    try {
      set({ isLoadingUnreadCount: true, unreadCountError: null })
      const unreadCount = await apiClient.getUnreadAlertCount()
      set({ unreadCount, isLoadingUnreadCount: false })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch unread count'
      set({
        unreadCountError: errorMessage,
        isLoadingUnreadCount: false,
        unreadCount: 0
      })
    }
  },

  markAsRead: async (alertId: string) => {
    try {
      set({ isUpdating: true, updateError: null })
      const updatedAlert = await apiClient.markAlertAsRead(alertId)
      
      // Update in current alerts
      const { alerts } = get()
      const updatedAlerts = alerts.map(alert => 
        alert.id === alertId ? { ...alert, ...updatedAlert, status: 'READ' as const } : alert
      )
      set({ alerts: updatedAlerts, isUpdating: false })
      
      // Refresh unread count
      get().fetchUnreadCount()
      
      return true
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to mark alert as read'
      set({ updateError: errorMessage, isUpdating: false })
      return false
    }
  },

  markAsArchived: async (alertId: string) => {
    try {
      set({ isUpdating: true, updateError: null })
      const updatedAlert = await apiClient.markAlertAsArchived(alertId)
      
      // Update in current alerts
      const { alerts } = get()
      const updatedAlerts = alerts.map(alert => 
        alert.id === alertId ? { ...alert, ...updatedAlert, status: 'ARCHIVED' as const } : alert
      )
      set({ alerts: updatedAlerts, isUpdating: false })
      
      return true
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to archive alert'
      set({ updateError: errorMessage, isUpdating: false })
      return false
    }
  },

  markAsFalsePositive: async (alertId: string) => {
    try {
      set({ isUpdating: true, updateError: null })
      const updatedAlert = await apiClient.markAlertAsFalsePositive(alertId)
      
      // Update in current alerts
      const { alerts } = get()
      const updatedAlerts = alerts.map(alert => 
        alert.id === alertId ? { ...alert, ...updatedAlert, isFalsePositive: true } : alert
      )
      set({ alerts: updatedAlerts, isUpdating: false })
      
      return true
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to mark alert as false positive'
      set({ updateError: errorMessage, isUpdating: false })
      return false
    }
  },

  markAsRemediated: async (alertId: string, notes?: string) => {
    try {
      set({ isUpdating: true, updateError: null })
      const updatedAlert = await apiClient.markAlertAsRemediated(alertId, notes)
      
      // Update in current alerts
      const { alerts } = get()
      const updatedAlerts = alerts.map(alert => 
        alert.id === alertId ? { ...alert, ...updatedAlert, isRemediated: true } : alert
      )
      set({ alerts: updatedAlerts, isUpdating: false })
      
      return true
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to mark alert as remediated'
      set({ updateError: errorMessage, isUpdating: false })
      return false
    }
  },

  escalateAlert: async (alertId: string, notes: string) => {
    try {
      set({ isUpdating: true, updateError: null })
      const updatedAlert = await apiClient.escalateAlert(alertId, notes)
      
      // Update in current alerts
      const { alerts } = get()
      const updatedAlerts = alerts.map(alert => 
        alert.id === alertId ? { ...alert, ...updatedAlert, isEscalated: true } : alert
      )
      set({ alerts: updatedAlerts, isUpdating: false })
      
      return true
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to escalate alert'
      set({ updateError: errorMessage, isUpdating: false })
      return false
    }
  },

  bulkMarkAsRead: async (alertIds: string[]) => {
    try {
      set({ isUpdating: true, updateError: null })
      await apiClient.bulkMarkAlertsAsRead(alertIds)
      
      // Update alerts in state
      const { alerts } = get()
      const updatedAlerts = alerts.map(alert => 
        alertIds.includes(alert.id) ? { ...alert, status: 'read' as const } : alert
      )
      set({ alerts: updatedAlerts, isUpdating: false })
      
      // Refresh unread count
      get().fetchUnreadCount()
      
      return true
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to bulk mark alerts as read'
      set({ updateError: errorMessage, isUpdating: false })
      return false
    }
  },

  markAllAsRead: async () => {
    try {
      set({ isUpdating: true, updateError: null })
      await apiClient.markAllAlertsAsRead()
      
      // Update all alerts to read status
      const { alerts } = get()
      const updatedAlerts = alerts.map(alert => ({ ...alert, status: 'READ' as const }))
      set({ alerts: updatedAlerts, unreadCount: 0, isUpdating: false })
      
      return true
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to mark all alerts as read'
      set({ updateError: errorMessage, isUpdating: false })
      return false
    }
  },

  searchAlerts: async (query: string, page = 0, size = 10) => {
    try {
      set({ isLoadingAlerts: true, alertsError: null })
      const response = await apiClient.searchAlerts(query, page, size)
      
      set({
        alerts: response.content || [],
        currentPage: response.number || 0,
        totalPages: response.totalPages || 0,
        pageSize: response.size || 10,
        totalAlerts: response.totalElements || 0,
        isLoadingAlerts: false
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to search alerts'
      set({
        alertsError: errorMessage,
        isLoadingAlerts: false,
        alerts: []
      })
    }
  },

  refreshAll: async () => {
    const { fetchAlerts, fetchRecentAlerts, fetchHighPriorityAlerts, fetchStatistics, fetchUnreadCount } = get()
    await Promise.allSettled([
      fetchAlerts(),
      fetchRecentAlerts(),
      fetchHighPriorityAlerts(),
      fetchStatistics(),
      fetchUnreadCount()
    ])
  },

  clearErrors: () => set({
    alertsError: null,
    recentError: null,
    highPriorityError: null,
    statisticsError: null,
    unreadCountError: null,
    updateError: null
  }),

  setFilters: (status?: string, severity?: string) => {
    set({ statusFilter: status, severityFilter: severity })
    get().fetchAlerts(0, get().pageSize, status, severity)
  }
}))
