import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { 
  ApiResponse, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  SearchRequest,
  AdvancedSearchRequest,
  BulkSearchRequest,
  SearchResponse,
  User,
  SystemHealthResponse,
  SearchStatistics,
  SearchSuggestions,
  DashboardData
} from '@/types'
import { UsageStats, UsageQuota, AnonymousUsage } from '@/stores/usage'

// Safe logging utility that handles object serialization
const log = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      try {
        const logger = (globalThis as any).console
        if (logger && logger.log) {
          if (data) {
            logger.log(message, JSON.stringify(data, null, 2))
          } else {
            logger.log(message)
          }
        }
      } catch (error) {
        // Fallback if JSON.stringify fails
        const logger = (globalThis as any).console
        if (logger && logger.log) {
          logger.log(message, '[Object cannot be serialized]')
        }
      }
    }
  },
  error: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      try {
        const logger = (globalThis as any).console
        if (logger && logger.error) {
          if (data) {
            logger.error(message, JSON.stringify(data, null, 2))
          } else {
            logger.error(message)
          }
        }
      } catch (error) {
        // Fallback if JSON.stringify fails
        const logger = (globalThis as any).console
        if (logger && logger.error) {
          logger.error(message, '[Object cannot be serialized]')
        }
      }
    }
  },
  warn: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      try {
        const logger = (globalThis as any).console
        if (logger && logger.warn) {
          if (data) {
            logger.warn(message, JSON.stringify(data, null, 2))
          } else {
            logger.warn(message)
          }
        }
      } catch (error) {
        // Fallback if JSON.stringify fails
        const logger = (globalThis as any).console
        if (logger && logger.warn) {
          logger.warn(message, '[Object cannot be serialized]')
        }
      }
    }
  }
}

interface ApiConfig {
  baseURL: string
  timeout: number
}

class ApiClient {
  private client: AxiosInstance

  constructor(config: ApiConfig) {
    this.client = axios.create(config)
    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        
        // Add debugging in development only
        if (process.env.NODE_ENV === 'development') {
          log.info('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url
          })
        }
        
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        if (process.env.NODE_ENV === 'development') {
          log.info('✅ API Response:', {
            status: response.status,
            url: response.config.url
          })
        }
        return response
      },
      (error: any) => {
        log.error('❌ API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          data: error.response?.data,
          message: error.message
        })
        
        if (error.response?.status === 401) {
          this.removeToken()
          // For development/demo, don't redirect to login automatically
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/demo')) {
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('threatscope_token')
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('threatscope_token', token)
    }
  }

  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('threatscope_token')
      localStorage.removeItem('threatscope_user')
    }
  }

  // Check if backend is available
  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health', { timeout: 3000 })
      return response.status === 200
    } catch (error: any) {
      log.warn('Backend health check failed:', error)
      return false
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Check if backend is available
      const isBackendAvailable = await this.checkBackendHealth()
      if (!isBackendAvailable) {
        throw new Error('Backend service is currently unavailable. Please try again later.')
      }

      const response = await this.client.post<ApiResponse<any>>('/v1/auth/login', credentials)
      const backendAuthData = response.data.data!
      
      console.log('🔍 Backend auth response:', backendAuthData)
      
      // Transform backend response to frontend expected format
      const authData: AuthResponse = {
        user: {
          id: backendAuthData.id?.toString() || '',
          email: backendAuthData.email || '',
          firstName: backendAuthData.name?.split(' ')[0] || '',
          lastName: backendAuthData.name?.split(' ').slice(1).join(' ') || '',
          role: backendAuthData.roles?.[0] || 'ROLE_USER',
          isEmailVerified: backendAuthData.isEmailVerified || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        accessToken: backendAuthData.accessToken,
        refreshToken: backendAuthData.refreshToken,
        expiresIn: 3600 // 1 hour default
      }
      
      console.log('🔍 Transformed auth data:', authData)
      
      this.setToken(authData.accessToken)
      return authData
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Handle specific error cases
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        throw new Error('Cannot connect to server. Please check if the backend is running.')
      }
      
      throw error
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      log.info('🔄 Starting registration with data:', userData)
      
      // Check if backend is available first
      const isBackendAvailable = await this.checkBackendHealth()
      if (!isBackendAvailable) {
        log.error('❌ Backend not available')
        throw new Error('Backend service is currently unavailable. Please try again later.')
      }

      log.info('✅ Backend is available, proceeding with registration')
      
      // ✅ Send all fields including company and jobTitle (now supported by backend)
      const response = await this.client.post<ApiResponse<any>>('/v1/auth/register', userData)
      const backendAuthData = response.data.data!
      
      log.info('📝 Registration response received:', backendAuthData)
      
      // Transform backend response to frontend expected format
      const authData: AuthResponse = {
        user: {
          id: backendAuthData.id?.toString() || '',
          email: backendAuthData.email || '',
          firstName: backendAuthData.name?.split(' ')[0] || '',
          lastName: backendAuthData.name?.split(' ').slice(1).join(' ') || '',
          role: backendAuthData.roles?.[0] || 'ROLE_USER',
          isEmailVerified: backendAuthData.isEmailVerified || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        accessToken: backendAuthData.accessToken,
        refreshToken: backendAuthData.refreshToken,
        expiresIn: 3600 // 1 hour default
      }
      
      log.info('🔍 Transformed registration auth data:', authData)
      this.setToken(authData.accessToken)
      
      log.info('🎉 Registration successful, token set')
      
      return authData
    } catch (error: any) {
      log.error('💥 Registration error:', error)
      
      // DETAILED DEBUGGING
      console.log('🔍 Full error object:', error)
      console.log('🔍 error.response:', error.response)
      console.log('🔍 error.response?.data:', error.response?.data)
      console.log('🔍 error.response?.data?.message:', error.response?.data?.message)
      console.log('🔍 error.response?.status:', error.response?.status)
      
      // Handle specific error cases with user-friendly messages
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        throw new Error('Cannot connect to server. Please check if the backend is running on http://localhost:8080')
      }
      
      if (error.response?.status === 400) {
        // Don't create a new Error - just throw the original error
        // The message will be extracted properly in the auth store
        throw error
      }
      
      if (error.response?.status === 409) {
        throw new Error('An account with this email already exists')
      }
      
      if (error.response?.status === 500) {
        throw new Error('Server error occurred. Please try again later.')
      }
      
      // For other errors, throw the original error to preserve response data
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout')
    } catch (error) {
      // Continue with logout even if API call fails
      log.warn('Logout API call failed:', error)
    } finally {
      this.removeToken()
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/refresh')
    const authData = response.data.data!
    this.setToken(authData.accessToken)
    return authData
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.client.get<ApiResponse<any>>('/v1/auth/me')
      
      console.log('🔍 Full /auth/me response:', response)
      console.log('🔍 Response.data:', response.data)
      console.log('🔍 Response.data.data:', response.data?.data)
      
      // Check if response structure is valid
      if (!response.data) {
        throw new Error('No data in response')
      }
      
      const backendUser = response.data.data
      
      console.log('🔍 Backend user response:', backendUser)
      console.log('🔍 Backend user type:', typeof backendUser)
      
      // Validate that we have user data
      if (!backendUser) {
        console.error('❌ backendUser is null/undefined')
        throw new Error('No user data returned from backend')
      }
      
      // Transform backend subscription data if present
      let subscription = undefined
      if (backendUser.subscription) {
        const backendSub = backendUser.subscription
        subscription = {
          id: backendSub.id?.toString() || '',
          planType: backendSub.planType || 'FREE',
          status: backendSub.status || 'ACTIVE',
          billingCycle: backendSub.billingCycle || 'MONTHLY',
          currentPeriodStart: backendSub.currentPeriodStart || new Date().toISOString(),
          currentPeriodEnd: backendSub.currentPeriodEnd || new Date().toISOString(),
          features: [], // Will be populated by subscription details endpoint
          usage: { searches: 0, monitors: 0 } // Will be populated by subscription details endpoint
        }
      }
      
      // Transform backend User entity to frontend User interface
      const user: User = {
        id: (backendUser.id?.toString() || backendUser.id || '').toString(),
        email: backendUser.email || '',
        firstName: backendUser.firstName || '',
        lastName: backendUser.lastName || '',
        role: 'ROLE_USER', // Default role
        isEmailVerified: backendUser.emailVerified || backendUser.isEmailVerified || false,
        createdAt: backendUser.createdAt || new Date().toISOString(),
        updatedAt: backendUser.updatedAt || new Date().toISOString(),
        subscription: subscription
      }
      
      console.log('🔍 Transformed user data:', user)
      
      // Validate transformed user
      if (!user.id || !user.email) {
        console.error('❌ Invalid transformed user:', user)
        throw new Error('Invalid user data after transformation')
      }
      
      return user
    } catch (error: any) {
      console.error('❌ getCurrentUser error:', error)
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      throw error
    }
  }

  // Search methods with fallback
  async search(searchRequest: SearchRequest): Promise<SearchResponse> {
    try {
      const response = await this.client.post('/v1/search', {
        query: searchRequest.query,
        searchType: searchRequest.type.toUpperCase(),
        searchMode: searchRequest.mode?.toUpperCase() || 'EXACT',
        page: searchRequest.page || 0,
        size: searchRequest.limit || 20,
        sortBy: 'timestamp',
        sortDirection: 'desc',
        filters: searchRequest.filters,
        includeMetadata: true,
        highlightResults: false
      })
      
      // Backend returns SearchResponse directly, not wrapped in ApiResponse
      const data = response.data
      
      // Ensure results array exists and transform if needed
      if (!data.results) {
        data.results = []
      }
      
      // Transform and ensure dataQuality field exists on each result
      const transformedResults = data.results.map(result => ({
        ...result,
        // Ensure dataQuality exists (fallback to 0 if missing)
        dataQuality: result.dataQuality ?? 0,
        // Map email field for compatibility
        email: result.email || result.login,
        // Ensure other expected fields exist
        verified: result.isVerified || false,
        breachDate: result.dateCompromised || result.timestamp
      }))
      
      // Transform backend response to frontend format
      return {
        results: transformedResults,
        metadata: {
          query: data.query || searchRequest.query,
          totalResults: data.totalResults || 0,
          totalSources: 1,
          searchTime: data.executionTimeMs || 0,
          page: data.currentPage || 0,
          limit: data.pageSize || 20,
          hasMore: data.currentPage < data.totalPages - 1
        },
        statistics: {
          totalQueries: 1,
          topSearchTypes: [],
          recentSearches: [],
          breachDistribution: []
        },
        // Backend fields for compatibility
        totalResults: data.totalResults || 0,
        currentPage: data.currentPage || 0,
        totalPages: data.totalPages || 1,
        pageSize: data.pageSize || 20,
        executionTimeMs: data.executionTimeMs || 0,
        query: data.query || searchRequest.query,
        searchType: searchRequest.type,
        aggregations: data.aggregations || {}
      }
    } catch (error: any) {
      log.error('Search API Error:', error)
      
      // If backend is down, throw a user-friendly error
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        throw new Error('Search service is currently unavailable. Please try the demo instead.')
      }
      
      throw error
    }
  }

  // Get detailed metrics for a specific source (lazy loaded)
  async getSourceMetrics(source: string): Promise<any> {
    try {
      const response = await this.client.get(`/v1/search/metrics/${encodeURIComponent(source)}`)
      return response.data
    } catch (error: any) {
      log.error('Metrics API Error:', error)
      throw error
    }
  }

  async advancedSearch(searchRequest: AdvancedSearchRequest): Promise<SearchResponse> {
    const response = await this.client.post<ApiResponse<SearchResponse>>('/v1/search/advanced', searchRequest)
    return response.data.data!
  }

  async bulkSearch(searchRequest: BulkSearchRequest): Promise<SearchResponse> {
    const response = await this.client.post<ApiResponse<SearchResponse>>('/v1/search/bulk', searchRequest)
    return response.data.data!
  }

  async getSearchHistory(page = 1, limit = 20): Promise<any> {
    const response = await this.client.get(`/search/history?page=${page}&limit=${limit}`)
    return response.data.data
  }

  async getSearchSuggestions(query: string): Promise<SearchSuggestions> {
    const response = await this.client.get<ApiResponse<SearchSuggestions>>(`/search/suggestions?q=${encodeURIComponent(query)}`)
    return response.data.data!
  }

  async getSearchStatistics(): Promise<SearchStatistics> {
    const response = await this.client.get<ApiResponse<SearchStatistics>>('/search/statistics')
    return response.data.data!
  }

  // Dashboard methods
  async getDashboardData(): Promise<DashboardData> {
    const response = await this.client.get<ApiResponse<DashboardData>>('/dashboard')
    return response.data.data!
  }

  // Health check
  async getSystemHealth(): Promise<SystemHealthResponse> {
    const response = await this.client.get<ApiResponse<SystemHealthResponse>>('/health')
    return response.data.data!
  }

  // User management
  async updateUser(userData: Partial<User>): Promise<User> {
    const response = await this.client.put<ApiResponse<User>>('/user/profile', userData)
    return response.data.data!
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.client.post('/user/change-password', {
      currentPassword,
      newPassword
    })
  }

  async deleteAccount(): Promise<void> {
    await this.client.delete('/user/account')
    this.removeToken()
  }

  // Monitoring and Alerts
  async getMonitoringItems(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc'): Promise<any> {
    const response = await this.client.get(`/monitoring/items?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`)
    return response.data.data
  }

  async createMonitoringItem(item: any): Promise<any> {
    try {
      const response = await this.client.post('/monitoring/items', item)
      return response.data.data
    } catch (error: any) {
      // Handle duplicate monitoring error (409 status)
      if (error.response?.status === 409 && error.response?.data?.data) {
        const duplicateData = error.response.data.data
        const { DuplicateError } = await import('@/types')
        throw new DuplicateError(duplicateData)
      }
      throw error
    }
  }

  async getMonitoringItem(itemId: string): Promise<any> {
    const response = await this.client.get(`/monitoring/items/${itemId}`)
    return response.data.data
  }

  async updateMonitoringItem(itemId: string, item: any): Promise<any> {
    const response = await this.client.put(`/monitoring/items/${itemId}`, item)
    return response.data.data
  }

  async deleteMonitoringItem(itemId: string): Promise<void> {
    await this.client.delete(`/monitoring/items/${itemId}`)
  }

  async searchMonitoringItems(query: string, page = 0, size = 10): Promise<any> {
    const response = await this.client.get(`/monitoring/items/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`)
    return response.data.data
  }

  async getMonitoringDashboard(): Promise<any> {
    const response = await this.client.get('/monitoring/dashboard')
    return response.data.data
  }

  async getMonitoringStatistics(): Promise<any> {
    const response = await this.client.get('/monitoring/statistics')
    return response.data.data
  }

  // Alert methods
  async getAlerts(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc', status?: string, severity?: string): Promise<any> {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('size', size.toString())
    params.append('sortBy', sortBy)
    params.append('sortDir', sortDir)
    if (status) params.append('status', status)
    if (severity) params.append('severity', severity)
    
    const response = await this.client.get(`/alerts?${params.toString()}`)
    return response.data.data
  }

  async getAlert(alertId: string): Promise<any> {
    const response = await this.client.get(`/alerts/${alertId}`)
    return response.data.data
  }

  async markAlertAsRead(alertId: string): Promise<any> {
    const response = await this.client.put(`/alerts/${alertId}/read`)
    return response.data.data
  }

  async markAlertAsArchived(alertId: string): Promise<any> {
    const response = await this.client.put(`/alerts/${alertId}/archive`)
    return response.data.data
  }

  async markAlertAsFalsePositive(alertId: string): Promise<any> {
    const response = await this.client.put(`/alerts/${alertId}/false-positive`)
    return response.data.data
  }

  async markAlertAsRemediated(alertId: string, notes?: string): Promise<any> {
    const params = notes ? `?notes=${encodeURIComponent(notes)}` : ''
    const response = await this.client.put(`/alerts/${alertId}/remediate${params}`)
    return response.data.data
  }

  async escalateAlert(alertId: string, notes: string): Promise<any> {
    const response = await this.client.put(`/alerts/${alertId}/escalate?notes=${encodeURIComponent(notes)}`)
    return response.data.data
  }

  async bulkMarkAlertsAsRead(alertIds: string[]): Promise<number> {
    const response = await this.client.put('/alerts/bulk/read', alertIds)
    return response.data.data
  }

  async markAllAlertsAsRead(): Promise<number> {
    const response = await this.client.put('/alerts/read-all')
    return response.data.data
  }

  async getUnreadAlertCount(): Promise<number> {
    const response = await this.client.get('/alerts/unread/count')
    return response.data.data
  }

  async getRecentAlerts(days = 7): Promise<any[]> {
    const response = await this.client.get(`/alerts/recent?days=${days}`)
    return response.data.data
  }

  async getHighPriorityAlerts(): Promise<any[]> {
    const response = await this.client.get('/alerts/high-priority')
    return response.data.data
  }

  async searchAlerts(query: string, page = 0, size = 10): Promise<any> {
    const response = await this.client.get(`/alerts/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`)
    return response.data.data
  }

  async getAlertStatistics(): Promise<any> {
    const response = await this.client.get('/alerts/statistics')
    return response.data.data
  }

  // Export functionality
  async exportSearchResults(searchId: string, format: 'csv' | 'excel' | 'pdf' | 'json'): Promise<Blob> {
    const response = await this.client.post(`/export/${searchId}`, 
      { format },
      { responseType: 'blob' }
    )
    return response.data
  }

  // Subscription management
  async getSubscriptionDetails(currentMonitoringItems = 0, todaySearches = 0): Promise<any> {
    const response = await this.client.get(`/subscription/details?currentMonitoringItems=${currentMonitoringItems}&todaySearches=${todaySearches}`)
    return response.data.data
  }

  async getSubscription(): Promise<any> {
    const response = await this.client.get('/subscription')
    return response.data.data
  }

  async updateSubscription(planType: string): Promise<any> {
    const response = await this.client.post('/subscription/update', { planType })
    return response.data.data
  }

  async cancelSubscription(): Promise<void> {
    await this.client.post('/subscription/cancel')
  }

  // External integrations
  async getExternalBreachData(query: string): Promise<any> {
    const response = await this.client.get(`/external/breach-data?q=${encodeURIComponent(query)}`)
    return response.data.data
  }

  // Admin methods (if user has admin role)
  async getSystemStats(): Promise<any> {
    const response = await this.client.get('/admin/stats')
    return response.data.data
  }

  async getUsers(page = 1, limit = 20): Promise<any> {
    const response = await this.client.get(`/admin/users?page=${page}&limit=${limit}`)
    return response.data.data
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    await this.client.patch(`/admin/users/${userId}/role`, { role })
  }

  async suspendUser(userId: string): Promise<void> {
    await this.client.patch(`/admin/users/${userId}/suspend`)
  }

  async getAuditLogs(page = 1, limit = 20): Promise<any> {
    const response = await this.client.get(`/admin/audit-logs?page=${page}&limit=${limit}`)
    return response.data.data
  }

  // Usage tracking methods (authenticated users)
  async getUserQuota(): Promise<UsageQuota> {
    console.log('📊 [API Client] Fetching user quota...')
    const response = await this.client.get<ApiResponse<UsageQuota>>('/user/usage/quota')
    console.log('✅ [API Client] User quota response:', response.data)
    return response.data.data!
  }

  async getTodayUsage(): Promise<UsageStats> {
    console.log('📊 [API Client] Fetching today\'s usage...')
    const response = await this.client.get<ApiResponse<UsageStats>>('/user/usage/today')
    console.log('✅ [API Client] Today usage response:', response.data)
    return response.data.data!
  }

  async getUserUsageStats(startDate?: string, endDate?: string): Promise<UsageStats> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const response = await this.client.get<ApiResponse<UsageStats>>(`/user/usage/stats?${params.toString()}`)
    return response.data.data!
  }

  // Anonymous usage tracking methods
  async getAnonymousUsage(): Promise<AnonymousUsage> {
    const response = await this.client.get<ApiResponse<AnonymousUsage>>('/anonymous/usage')
    return response.data.data!
  }

  async incrementAnonymousUsage(): Promise<AnonymousUsage> {
    const response = await this.client.post<ApiResponse<AnonymousUsage>>('/anonymous/usage/increment')
    return response.data.data!
  }

  async checkAnonymousLimit(): Promise<{ canSearch: boolean; remaining: number }> {
    const response = await this.client.get<ApiResponse<{ canSearch: boolean; remaining: number }>>('/anonymous/usage/check')
    return response.data.data!
  }

  // Add API methods for plans
  async getPlans(): Promise<any[]> {
    const response = await this.client.get<ApiResponse<any[]>>('/plans')
    return response.data.data!
  }

  async getPlanComparison(): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>('/plans/comparison')
    return response.data.data!
  }

  // Mock Payment methods
  async processMockPayment(paymentData: any): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>('/mock-payment/process', paymentData)
    return response.data.data!
  }

  async getTestPaymentMethods(): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>('/mock-payment/test-methods')
    return response.data.data!
  }

  async cancelMockSubscription(): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>('/mock-payment/cancel')
    return response.data.data!
  }

  // Admin Consultation Methods
  async getAdminSessions(params: {
    page?: number
    size?: number
    sortBy?: string
    sortDir?: string
    status?: string
    paymentStatus?: string
    search?: string
  } = {}): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.page !== undefined) queryParams.append('page', params.page.toString())
    if (params.size !== undefined) queryParams.append('size', params.size.toString())
    if (params.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params.sortDir) queryParams.append('sortDir', params.sortDir)
    if (params.status) queryParams.append('status', params.status)
    if (params.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus)
    if (params.search) queryParams.append('search', params.search)
    
    const response = await this.client.get<ApiResponse<any>>(`/admin/consultation/sessions?${queryParams}`)
    return response.data.data!
  }

  async getAdminSession(sessionId: string): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>(`/admin/consultation/sessions/${sessionId}`)
    return response.data.data!
  }

  async getAvailableExperts(specialization?: string): Promise<any[]> {
    const params = specialization ? `?specialization=${encodeURIComponent(specialization)}` : ''
    const response = await this.client.get<ApiResponse<any[]>>(`/admin/consultation/experts/available${params}`)
    return response.data.data!
  }

  async assignExpertToSession(sessionId: string, expertId: string, notes?: string): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>(`/admin/consultation/sessions/${sessionId}/assign-expert`, {
      expertId: parseInt(expertId), // Backend expects Long, not string
      notes: notes || 'Expert assigned by admin'
    })
    return response.data.data!
  }

  async processPaymentApproval(sessionId: string, notes?: string): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>(`/admin/consultation/sessions/${sessionId}/process-payment`, {
      notes: notes || 'Payment approved by admin'
    })
    return response.data.data!
  }

  async markSessionAsPaid(sessionId: string, paymentIntentId?: string, notes?: string): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>(`/admin/consultation/sessions/${sessionId}/mark-paid`, {
      paymentIntentId: paymentIntentId || `admin_manual_${sessionId}`,
      notes: notes || 'Payment marked as completed by admin'
    })
    return response.data.data!
  }

  async cancelSession(sessionId: string, reason?: string, refund?: boolean): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>(`/admin/consultation/sessions/${sessionId}/cancel`, {
      reason: reason || 'Cancelled by admin',
      refund: refund ? 'true' : 'false'
    })
    return response.data.data!
  }

  async completeSession(sessionId: string, expertSummary?: string, deliverables?: string): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>(`/admin/consultation/sessions/${sessionId}/complete`, {
      expertSummary: expertSummary || 'Session completed by admin',
      deliverables: deliverables || 'Session deliverables provided'
    })
    return response.data.data!
  }

  async extendSession(sessionId: string, additionalHours: number, reason?: string): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>(`/admin/consultation/sessions/${sessionId}/extend`, {
      additionalHours,
      reason: reason || 'Session extended by admin'
    })
    return response.data.data!
  }

  async setSessionManaged(sessionId: string, managed: boolean, reason?: string): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>(`/admin/consultation/sessions/${sessionId}/manage`, {
      managed,
      reason: reason || `Session ${managed ? 'placed under' : 'removed from'} admin management`
    })
    return response.data.data!
  }

  async reactivateExpiredSession(sessionId: string, reason?: string): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>(`/admin/consultation/sessions/${sessionId}/reactivate`, {
      reason: reason || 'Session reactivated by admin'
    })
    return response.data.data!
  }

  async getConsultationAdminDashboard(): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>('/admin/consultation/dashboard')
    return response.data.data!
  }

  async getPendingConsultationSessions(): Promise<any[]> {
    const response = await this.client.get<ApiResponse<any[]>>('/admin/consultation/sessions/pending')
    return response.data.data!
  }

  async getRecentConsultationSessions(minutesBack: number = 60): Promise<any[]> {
    const response = await this.client.get<ApiResponse<any[]>>(`/admin/consultation/sessions/recent?minutesBack=${minutesBack}`)
    return response.data.data!
  }

  async getSessionsNeedingAttention(): Promise<any[]> {
    const response = await this.client.get<ApiResponse<any[]>>('/admin/consultation/sessions/attention')
    return response.data.data!
  }

  async bulkProcessPayments(sessionIds: string[], notes?: string): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>('/admin/consultation/sessions/bulk/process-payments', {
      sessionIds: sessionIds.map(id => parseInt(id)), // Backend expects Long[]
      notes: notes || 'Bulk payment processing by admin'
    })
    return response.data.data!
  }

  async bulkExtendSessions(sessionIds: string[], additionalHours: number, reason?: string): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>('/admin/consultation/sessions/bulk/extend', {
      sessionIds: sessionIds.map(id => parseInt(id)), // Backend expects Long[]
      additionalHours,
      reason: reason || 'Bulk session extension by admin'
    })
    return response.data.data!
  }

  // Notification endpoints
  async getNotifications(): Promise<any[]> {
    const response = await this.client.get<ApiResponse<any[]>>('/notifications')
    return response.data.data!
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.client.post(`/notifications/${notificationId}/read`)
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.client.delete(`/notifications/${notificationId}`)
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.client.post('/notifications/mark-all-read')
  }

  async clearAllNotifications(): Promise<void> {
    await this.client.delete('/notifications/all')
  }

  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<ApiResponse<T>>(config)
    return response.data.data!
  }
}

// Create and export API client instance
const getApiBaseUrl = () => {
  // Try environment variable first
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // Fallback to localhost with /api context path
  return 'http://localhost:8080/api'
}

const apiConfig: ApiConfig = {
  baseURL: getApiBaseUrl(),
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000') // ✅ Reduced from 30s to 10s
}

// ✅ FIXED: Enhanced API client with retry logic and better error handling
class EnhancedApiClient extends ApiClient {
  private retryCount = 3
  private retryDelay = 1000
  
  constructor(config: ApiConfig) {
    super(config)
    this.setupEnhancedInterceptors()
  }
  
  private setupEnhancedInterceptors(): void {
    // Enhanced response interceptor with retry logic
    this.client.interceptors.response.use(
      (response) => {
        log.info('✅ API Response:', {
          status: response.status,
          url: response.config.url,
          responseTime: Date.now() - (response.config as any).__timestamp
        })
        return response
      },
      async (error: any) => {
        const config = error.config
        
        // ✅ Add timestamp for response time tracking
        if (!config.__timestamp) {
          config.__timestamp = Date.now()
        }
        
        // ✅ Retry logic for network errors and timeouts
        if (this.shouldRetry(error) && !config.__retryCount) {
          config.__retryCount = 0
        }
        
        if (config.__retryCount < this.retryCount && this.shouldRetry(error)) {
          config.__retryCount += 1
          
          const delay = this.retryDelay * Math.pow(2, config.__retryCount - 1) // Exponential backoff
          
          log.warn(`🔄 Retrying request (${config.__retryCount}/${this.retryCount}): ${config.url}`, {
            error: error.message,
            delay: `${delay}ms`
          })
          
          await new Promise(resolve => setTimeout(resolve, delay))
          return this.client(config)
        }
        
        log.error('❌ API Error (final):', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          message: error.message,
          retries: config.__retryCount || 0
        })
        
        // Handle authentication errors
        if (error.response?.status === 401) {
          this.removeToken()
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/demo')) {
            window.location.href = '/login'
          }
        }
        
        return Promise.reject(error)
      }
    )
  }
  
  private shouldRetry(error: any): boolean {
    // Retry on network errors, timeouts, and certain HTTP status codes
    return (
      error.code === 'ECONNABORTED' ||  // Timeout
      error.code === 'ENOTFOUND' ||     // DNS lookup failed
      error.code === 'ECONNREFUSED' ||  // Connection refused
      error.code === 'ECONNRESET' ||    // Connection reset
      error.message.includes('Network Error') ||
      error.message.includes('timeout') ||
      (error.response && [
        408,  // Request Timeout
        429,  // Too Many Requests
        500,  // Internal Server Error
        502,  // Bad Gateway
        503,  // Service Unavailable
        504   // Gateway Timeout
      ].includes(error.response.status))
    )
  }
}

// ✅ Use enhanced API client instead of basic one
export const apiClient = new EnhancedApiClient(apiConfig)
export default apiClient
