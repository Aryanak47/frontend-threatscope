import { create } from 'zustand'
import { ConsultationPlan, ConsultationSession, CreateConsultationRequest, SessionChat, SendMessageRequest, RateSessionRequest } from '@/types/consultation'
import { apiClient } from '@/lib/api'

interface AdminSessionParams {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
  status?: string
  paymentStatus?: string
  search?: string
}

interface AdminFilters {
  status?: string
  paymentStatus?: string
  search?: string
}

interface ConsultationStore {
  // State
  plans: ConsultationPlan[]
  sessions: ConsultationSession[]
  currentSession: ConsultationSession | null
  currentChat: SessionChat | null
  loading: boolean
  error: string | null
  
  // Pagination state
  pagination: {
    currentPage: number
    pageSize: number
    totalElements: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
    sortBy: string
    sortDir: string
  }
  
  // Admin pagination state
  adminPagination: {
    currentPage: number
    pageSize: number
    totalElements: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
    sortBy: string
    sortDir: string
    filters: {
      status?: string
      paymentStatus?: string
      search?: string
    }
  }
  
  // Cache
  plansCache: { data: ConsultationPlan[], timestamp: number } | null
  sessionsCache: { data: ConsultationSession[], timestamp: number } | null
  
  // Loading states for individual operations
  loadingStates: {
    fetchingSession: boolean
    fetchingChat: boolean
    sendingMessage: boolean
    processing: boolean
    loadingNextPage: boolean
    refreshing: boolean
  }
  
  // Actions
  fetchPlans: () => Promise<void>
  fetchSessions: (page?: number, size?: number, sortBy?: string, sortDir?: string) => Promise<void>
  fetchAdminSessions: (params?: AdminSessionParams) => Promise<void>
  fetchSession: (sessionId: string) => Promise<void>
  createSession: (request: CreateConsultationRequest) => Promise<ConsultationSession>
  startSession: (sessionId: string) => Promise<void>
  cancelSession: (sessionId: string) => Promise<void>
  rateSession: (sessionId: string, request: RateSessionRequest) => Promise<void>
  
  // Pagination actions
  loadNextPage: () => Promise<void>
  refreshSessions: () => Promise<void>
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setSorting: (sortBy: string, sortDir: string) => void
  setAdminFilters: (filters: AdminFilters) => void
  
  // Chat actions
  fetchChat: (sessionId: string) => Promise<void>
  sendMessage: (sessionId: string, request: SendMessageRequest) => Promise<void>
  markMessagesAsRead: (sessionId: string) => Promise<void>
  
  // Payment actions
  processPayment: (sessionId: string, paymentData: any) => Promise<void>
  
  // Admin actions
  assignExpert: (sessionId: string, expertId: string, notes?: string) => Promise<ConsultationSession>
  getAvailableExperts: (specialization?: string) => Promise<any[]>
  processPaymentApproval: (sessionId: string, notes?: string) => Promise<ConsultationSession>
  markSessionAsPaid: (sessionId: string, paymentIntentId?: string, notes?: string) => Promise<ConsultationSession>
  adminCompleteSession: (sessionId: string, expertSummary?: string, deliverables?: string) => Promise<ConsultationSession>
  adminExtendSession: (sessionId: string, additionalHours: number, reason?: string) => Promise<ConsultationSession>

  // UI actions
  clearError: () => void
  setCurrentSession: (session: ConsultationSession | null) => void
}

export const useConsultationStore = create<ConsultationStore>((set, get) => ({
  // Initial state
  plans: [],
  sessions: [],
  currentSession: null,
  currentChat: null,
  loading: false,
  error: null,
  
  pagination: {
    currentPage: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
    sortBy: 'priority',
    sortDir: 'desc'
  },
  
  adminPagination: {
    currentPage: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
    sortBy: 'createdAt',
    sortDir: 'desc',
    filters: {}
  },
  
  plansCache: null,
  sessionsCache: null,
  loadingStates: {
    fetchingSession: false,
    fetchingChat: false,
    sendingMessage: false,
    processing: false,
    loadingNextPage: false,
    refreshing: false
  },
  
  // Fetch consultation plans
  fetchPlans: async () => {
    const state = get()
    const now = Date.now()
    
    // Use cache if less than 10 minutes old
    if (state.plansCache && (now - state.plansCache.timestamp < 10 * 60 * 1000)) {
      set({ plans: state.plansCache.data })
      return
    }

    try {
      set({ loading: true, error: null })
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/v1/consultation/plans'
      })
      
      const plans = response || []
      set({ 
        plans,
        plansCache: { data: plans, timestamp: now },
        loading: false 
      })
    } catch (error: any) {
      console.error('Error fetching consultation plans:', error)
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to fetch consultation plans',
        loading: false 
      })
    }
  },
  
  // Fetch user's consultation sessions with pagination
  fetchSessions: async (page = 0, size = 10, sortBy = 'priority', sortDir = 'desc') => {
    const state = get()
    
    try {
      set(state => ({
        loading: page === 0,
        loadingStates: { ...state.loadingStates, loadingNextPage: page > 0 },
        error: null
      }))
      
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir
      })
      
      const response = await apiClient.request({
        method: 'GET',
        url: `/v1/consultation/sessions?${params}`
      })
      
      // Handle both paginated and non-paginated responses
      const isPagedResponse = response && typeof response === 'object' && 'content' in response
      
      if (isPagedResponse) {
        const sessions = response.content || []
        const pagination = {
          currentPage: response.number || 0,
          pageSize: response.size || size,
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0,
          hasNext: !response.last,
          hasPrevious: !response.first,
          sortBy,
          sortDir
        }
        
        set(state => ({
          sessions: page === 0 ? sessions : [...state.sessions, ...sessions],
          pagination,
          loading: false,
          loadingStates: { ...state.loadingStates, loadingNextPage: false }
        }))
      } else {
        const sessions = Array.isArray(response) ? response : []
        set(state => ({
          sessions,
          pagination: {
            ...state.pagination,
            totalElements: sessions.length,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          },
          loading: false,
          loadingStates: { ...state.loadingStates, loadingNextPage: false }
        }))
      }
      
    } catch (error: any) {
      console.error('Error fetching consultation sessions:', error)
      set(state => ({ 
        error: error.response?.data?.message || error.message || 'Failed to fetch consultation sessions',
        loading: false,
        loadingStates: { ...state.loadingStates, loadingNextPage: false }
      }))
    }
  },
  
  // Fetch specific session
  fetchSession: async (sessionId: string) => {
    const state = get()
    
    // Prevent multiple simultaneous calls
    if (state.loadingStates.fetchingSession) {
      console.log('⏳ fetchSession already in progress, skipping:', sessionId)
      return
    }
    
    console.log('🔍 fetchSession called for session:', sessionId)
    
    try {
      set(state => ({
        loadingStates: { ...state.loadingStates, fetchingSession: true },
        error: null
      }))
      
      // Check if accessing from admin dashboard
      const isAdmin = typeof window !== 'undefined' && window.location.pathname.includes('/admin')
      
      // For now, use the regular endpoint since admin endpoints don't exist yet
      const endpoint = `/v1/consultation/sessions/${sessionId}`
      
      console.log('🚀 Making API request to:', endpoint)
      
      const response = await apiClient.request({
        method: 'GET',
        url: endpoint
      })
      
      console.log('✅ fetchSession successful for session:', sessionId, 'response:', response)
      
      // Only update if we're still fetching (prevent race conditions)
      const currentState = get()
      if (currentState.loadingStates.fetchingSession) {
        set(state => ({
          currentSession: response,
          loadingStates: { ...state.loadingStates, fetchingSession: false }
        }))
      }
    } catch (error: any) {
      console.error('❌ fetchSession error for session:', sessionId, error)
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      
      // Only update if we're still fetching
      const currentState = get()
      if (!currentState.loadingStates.fetchingSession) return
      
      // If this is admin access and we get a 403, provide a helpful message
      const isAdmin = typeof window !== 'undefined' && window.location.pathname.includes('/admin')
      
      if (isAdmin && error.response?.status === 403) {
        set(state => ({ 
          error: 'Admin endpoints not yet implemented on backend. Using regular user endpoints for now.',
          loadingStates: { ...state.loadingStates, fetchingSession: false }
        }))
        
        // Throw error for admin case too
        throw new Error('Admin endpoints not yet implemented on backend')
      } else {
        // Handle different error types appropriately
        let errorMessage = error.response?.data?.message || error.message
        
        // Check for specific error types
        if (error.response?.status === 403) {
          errorMessage = 'You do not have access to this session'
        } else if (error.response?.status === 404) {
          errorMessage = 'Session not found'
        } else if (error.response?.status === 410) {
          errorMessage = 'This consultation session has expired'
        } else if (error.response?.status === 401) {
          console.log('🔐 Session expired while accessing consultation, redirecting to login...');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('threatscope_token');
            localStorage.removeItem('threatscope_user');
            localStorage.removeItem('threatscope_refresh_token');
            window.location.href = '/login';
            return;
          }
          errorMessage = 'Authentication required - please log in again'
        } else if (!errorMessage) {
          errorMessage = isAdmin 
            ? 'Admin access failed - session may not exist'
            : 'You do not have access to this session'
        }
        
        set(state => ({ 
          error: errorMessage,
          currentSession: null, // Explicitly set to null when error occurs
          loadingStates: { ...state.loadingStates, fetchingSession: false }
        }))
        
        // Throw the error so calling code can handle it
        throw new Error(errorMessage)
      }
    }
  },
  
  // Create new consultation session
  createSession: async (request: CreateConsultationRequest) => {
    try {
      set({ loading: true, error: null })
      
      // Convert frontend request to backend format
      const backendRequest = {
        alertId: request.alertId ? parseInt(request.alertId) : null,
        planId: parseInt(request.planId), // Convert string to number
        sessionNotes: request.sessionNotes,
        preferredTime: request.preferredTime,
        consultationType: request.consultationType || 'general',
        consultationCategory: request.consultationCategory || 'general-security'
      }
      
      console.log('🔄 Frontend request:', request)
      console.log('🔄 Backend request:', backendRequest)
      
      const newSession = await apiClient.request({
        method: 'POST',
        url: '/v1/consultation/sessions',
        data: backendRequest
      })
      
      set(state => ({ 
        sessions: [newSession, ...state.sessions],
        currentSession: newSession,
        loading: false 
      }))
      return newSession
    } catch (error: any) {
      console.error('Error creating consultation session:', error)
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to create consultation session',
        loading: false 
      })
      throw error
    }
  },
  
  // Start session
  startSession: async (sessionId: string) => {
    try {
      set({ loading: true, error: null })
      
      const updatedSession = await apiClient.request({
        method: 'POST',
        url: `/v1/consultation/sessions/${sessionId}/start`
      })
      
      set(state => ({
        currentSession: updatedSession,
        sessions: state.sessions.map(s => s.id === sessionId ? updatedSession : s),
        loading: false
      }))
    } catch (error: any) {
      console.error('Error starting session:', error)
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to start session',
        loading: false 
      })
    }
  },
  
  // Cancel session
  cancelSession: async (sessionId: string) => {
    try {
      set({ loading: true, error: null })
      
      const updatedSession = await apiClient.request({
        method: 'POST',
        url: `/v1/consultation/sessions/${sessionId}/cancel`
      })
      
      set(state => ({
        currentSession: updatedSession,
        sessions: state.sessions.map(s => s.id === sessionId ? updatedSession : s),
        loading: false
      }))
    } catch (error: any) {
      console.error('Error cancelling session:', error)
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to cancel session',
        loading: false 
      })
    }
  },
  
  // Rate session
  rateSession: async (sessionId: string, request: RateSessionRequest) => {
    try {
      set({ loading: true, error: null })
      
      const updatedSession = await apiClient.request({
        method: 'POST',
        url: `/v1/consultation/sessions/${sessionId}/rate`,
        data: request
      })
      
      set(state => ({
        currentSession: updatedSession,
        sessions: state.sessions.map(s => s.id === sessionId ? updatedSession : s),
        loading: false
      }))
    } catch (error: any) {
      console.error('Error rating session:', error)
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to rate session',
        loading: false 
      })
    }
  },
  
  // Fetch chat for session
  fetchChat: async (sessionId: string) => {
    const state = get()
    
    // Prevent multiple simultaneous calls
    if (state.loadingStates.fetchingChat) {
      console.log('⏳ fetchChat already in progress, skipping:', sessionId)
      return
    }
    
    console.log('📨 fetchChat called for session:', sessionId)
    
    try {
      set(state => ({
        loadingStates: { ...state.loadingStates, fetchingChat: true },
        error: null
      }))
      
      const endpoint = `/api/consultation/${sessionId}/chat`
      
      const chatData = await apiClient.request({
        method: 'GET',
        url: endpoint
      })
      
      console.log('✅ fetchChat successful for session:', sessionId)
      
      // Only update if we're still fetching (prevent race conditions)
      const currentState = get()
      if (currentState.loadingStates.fetchingChat) {
        set(state => ({
          currentChat: chatData,
          loadingStates: { ...state.loadingStates, fetchingChat: false }
        }))
      }
    } catch (error: any) {
      console.error('❌ fetchChat error for session:', sessionId, error)
      
      // Only update if we're still fetching
      const currentState = get()
      if (!currentState.loadingStates.fetchingChat) return
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load chat'
        
      set(state => ({ 
        error: errorMessage,
        loadingStates: { ...state.loadingStates, fetchingChat: false }
      }))
    }
  },
  
  // Send message
  sendMessage: async (sessionId: string, request: SendMessageRequest) => {
    try {
      const newMessage = await apiClient.request({
        method: 'POST',
        url: `/api/consultation/${sessionId}/messages`,
        data: request
      })
      
      // Add new message to current chat
      set(state => {
        if (state.currentChat) {
          return {
            currentChat: {
              ...state.currentChat,
              messages: [...state.currentChat.messages, newMessage]
            }
          }
        }
        return state
      })
    } catch (error: any) {
      console.error('Error sending message:', error)
      set({ error: error.response?.data?.message || error.message || 'Failed to send message' })
    }
  },
  
  // Mark messages as read
  markMessagesAsRead: async (sessionId: string) => {
    try {
      await apiClient.request({
        method: 'POST',
        url: `/api/consultation/${sessionId}/messages/read`
      })
      
      // Update unread count
      set(state => {
        if (state.currentChat) {
          return {
            currentChat: {
              ...state.currentChat,
              unreadCount: 0,
              messages: state.currentChat.messages.map(msg => ({ ...msg, isRead: true }))
            }
          }
        }
        return state
      })
    } catch (error: any) {
      console.error('Error marking messages as read:', error)
    }
  },
  
  // Process payment
  processPayment: async (sessionId: string, paymentData: any) => {
    try {
      set({ loading: true, error: null })
      
      const updatedSession = await apiClient.request({
        method: 'POST',
        url: `/v1/consultation/sessions/${sessionId}/payment`,
        data: paymentData
      })
      
      set(state => ({
        currentSession: updatedSession,
        sessions: state.sessions.map(s => s.id === sessionId ? updatedSession : s),
        loading: false
      }))
    } catch (error: any) {
      console.error('Error processing payment:', error)
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to process payment',
        loading: false 
      })
      throw error
    }
  },
  
  // Fetch admin sessions with enhanced filtering
  fetchAdminSessions: async (params: AdminSessionParams = {}) => {
    const state = get()
    const {
      page = state.adminPagination.currentPage,
      size = state.adminPagination.pageSize,
      sortBy = state.adminPagination.sortBy,
      sortDir = state.adminPagination.sortDir,
      status,
      paymentStatus,
      search
    } = params
    
    try {
      set(state => ({
        loading: page === 0,
        loadingStates: { ...state.loadingStates, loadingNextPage: page > 0 },
        error: null
      }))
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir
      })
      
      if (status) queryParams.append('status', status)
      if (paymentStatus) queryParams.append('paymentStatus', paymentStatus)
      if (search) queryParams.append('search', search)
      
      const response = await apiClient.request({
        method: 'GET',
        url: `/admin/consultation/sessions?${queryParams}`
      })
      
      const sessions = response?.content || []
      const adminPagination = {
        currentPage: response?.number || 0,
        pageSize: response?.size || size,
        totalElements: response?.totalElements || 0,
        totalPages: response?.totalPages || 0,
        hasNext: !response?.last,
        hasPrevious: !response?.first,
        sortBy,
        sortDir,
        filters: { status, paymentStatus, search }
      }
      
      set(state => ({
        sessions: page === 0 ? sessions : [...state.sessions, ...sessions],
        adminPagination,
        loading: false,
        loadingStates: { ...state.loadingStates, loadingNextPage: false }
      }))
      
    } catch (error: any) {
      console.error('Error fetching admin consultation sessions:', error)
      set(state => ({ 
        error: error.response?.data?.message || error.message || 'Failed to fetch admin sessions',
        loading: false,
        loadingStates: { ...state.loadingStates, loadingNextPage: false }
      }))
    }
  },
  
  // Load next page of sessions
  loadNextPage: async () => {
    const state = get()
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.includes('/admin')
    
    if (isAdmin) {
      const { currentPage, hasNext } = state.adminPagination
      if (hasNext && !state.loadingStates.loadingNextPage) {
        await get().fetchAdminSessions({ page: currentPage + 1 })
      }
    } else {
      const { currentPage, hasNext, pageSize, sortBy, sortDir } = state.pagination
      if (hasNext && !state.loadingStates.loadingNextPage) {
        await get().fetchSessions(currentPage + 1, pageSize, sortBy, sortDir)
      }
    }
  },
  
  // Refresh sessions (reload first page)
  refreshSessions: async () => {
    const state = get()
    
    try {
      set(state => ({
        loadingStates: { ...state.loadingStates, refreshing: true },
        error: null
      }))
      
      const isAdmin = typeof window !== 'undefined' && window.location.pathname.includes('/admin')
      
      if (isAdmin) {
        await get().fetchAdminSessions({ page: 0 })
      } else {
        const { pageSize, sortBy, sortDir } = state.pagination
        await get().fetchSessions(0, pageSize, sortBy, sortDir)
      }
      
    } finally {
      set(state => ({
        loadingStates: { ...state.loadingStates, refreshing: false }
      }))
    }
  },
  
  // Pagination controls
  setPage: (page: number) => {
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.includes('/admin')
    
    if (isAdmin) {
      get().fetchAdminSessions({ page })
    } else {
      const { pageSize, sortBy, sortDir } = get().pagination
      get().fetchSessions(page, pageSize, sortBy, sortDir)
    }
  },
  
  setPageSize: (size: number) => {
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.includes('/admin')
    
    if (isAdmin) {
      set(state => ({
        adminPagination: { ...state.adminPagination, pageSize: size, currentPage: 0 }
      }))
      get().fetchAdminSessions({ page: 0, size })
    } else {
      set(state => ({
        pagination: { ...state.pagination, pageSize: size, currentPage: 0 }
      }))
      const { sortBy, sortDir } = get().pagination
      get().fetchSessions(0, size, sortBy, sortDir)
    }
  },
  
  setSorting: (sortBy: string, sortDir: string) => {
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.includes('/admin')
    
    if (isAdmin) {
      set(state => ({
        adminPagination: { ...state.adminPagination, sortBy, sortDir, currentPage: 0 }
      }))
      get().fetchAdminSessions({ page: 0, sortBy, sortDir })
    } else {
      set(state => ({
        pagination: { ...state.pagination, sortBy, sortDir, currentPage: 0 }
      }))
      const { pageSize } = get().pagination
      get().fetchSessions(0, pageSize, sortBy, sortDir)
    }
  },
  
  setAdminFilters: (filters: AdminFilters) => {
    set(state => ({
      adminPagination: { 
        ...state.adminPagination, 
        filters: { ...state.adminPagination.filters, ...filters },
        currentPage: 0 
      }
    }))
    get().fetchAdminSessions({ page: 0, ...filters })
  },

  // Admin-specific methods
  assignExpert: async (sessionId: string, expertId: string, notes?: string) => {
    try {
      set({ loading: true, error: null })
      
      const updatedSession = await apiClient.assignExpertToSession(sessionId, expertId, notes)
      
      set(state => ({
        currentSession: updatedSession,
        sessions: state.sessions.map(s => s.id === sessionId ? updatedSession : s),
        loading: false
      }))
      
      return updatedSession
    } catch (error: any) {
      console.error('Error assigning expert:', error)
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to assign expert',
        loading: false 
      })
      throw error
    }
  },
  
  getAvailableExperts: async (specialization?: string) => {
    try {
      const experts = await apiClient.getAvailableExperts(specialization)
      return experts || []
    } catch (error: any) {
      console.error('Error fetching experts:', error)
      // No fallback - let the error bubble up to show proper error message
      throw error
    }
  },
  
  processPaymentApproval: async (sessionId: string, notes?: string) => {
    try {
      set({ loading: true, error: null })
      
      const updatedSession = await apiClient.processPaymentApproval(sessionId, notes)
      
      set(state => ({
        currentSession: updatedSession,
        sessions: state.sessions.map(s => s.id === sessionId ? updatedSession : s),
        loading: false
      }))
      
      return updatedSession
    } catch (error: any) {
      console.error('Error processing payment:', error)
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to process payment',
        loading: false 
      })
      throw error
    }
  },
  
  markSessionAsPaid: async (sessionId: string, paymentIntentId?: string, notes?: string) => {
    try {
      set({ loading: true, error: null })
      
      const updatedSession = await apiClient.markSessionAsPaid(sessionId, paymentIntentId, notes)
      
      set(state => ({
        currentSession: updatedSession,
        sessions: state.sessions.map(s => s.id === sessionId ? updatedSession : s),
        loading: false
      }))
      
      return updatedSession
    } catch (error: any) {
      console.error('Error marking session as paid:', error)
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to mark as paid',
        loading: false 
      })
      throw error
    }
  },
  
  adminCompleteSession: async (sessionId: string, expertSummary?: string, deliverables?: string) => {
    try {
      set({ loading: true, error: null })
      
      const updatedSession = await apiClient.completeSession(sessionId, expertSummary, deliverables)
      
      set(state => ({
        currentSession: updatedSession,
        sessions: state.sessions.map(s => s.id === sessionId ? updatedSession : s),
        loading: false
      }))
      
      return updatedSession
    } catch (error: any) {
      console.error('Error completing session:', error)
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to complete session',
        loading: false 
      })
      throw error
    }
  },
  
  adminExtendSession: async (sessionId: string, additionalHours: number, reason?: string) => {
    try {
      set({ loading: true, error: null })
      
      const updatedSession = await apiClient.extendSession(sessionId, additionalHours, reason)
      
      set(state => ({
        currentSession: updatedSession,
        sessions: state.sessions.map(s => s.id === sessionId ? updatedSession : s),
        loading: false
      }))
      
      return updatedSession
    } catch (error: any) {
      console.error('Error extending session:', error)
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to extend session',
        loading: false 
      })
      throw error
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
  
  // Set current session
  setCurrentSession: (session: ConsultationSession | null) => set({ currentSession: session }),
}))
