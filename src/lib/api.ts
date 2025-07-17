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
        
        // Add debugging
        console.log('🚀 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          fullURL: `${config.baseURL}${config.url}`,
          headers: config.headers,
          data: config.data
        })
        
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log('✅ API Response:', {
          status: response.status,
          url: response.config.url,
          data: response.data
        })
        return response
      },
      (error) => {
        console.error('❌ API Error:', {
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
    } catch (error) {
      console.warn('Backend health check failed:', error)
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

      const response = await this.client.post<ApiResponse<AuthResponse>>('/v1/auth/login', credentials)
      const authData = response.data.data!
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
      console.log('🔄 Starting registration with data:', userData)
      
      // Check if backend is available first
      const isBackendAvailable = await this.checkBackendHealth()
      if (!isBackendAvailable) {
        console.error('❌ Backend not available')
        throw new Error('Backend service is currently unavailable. Please try again later.')
      }

      console.log('✅ Backend is available, proceeding with registration')
      
      const response = await this.client.post<ApiResponse<AuthResponse>>('/v1/auth/register', userData)
      console.log('📝 Registration response received:', response.data)
      
      const authData = response.data.data!
      this.setToken(authData.accessToken)
      console.log('🎉 Registration successful, token set')
      
      return authData
    } catch (error: any) {
      console.error('💥 Registration error:', error)
      
      // Handle specific error cases with user-friendly messages
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        throw new Error('Cannot connect to server. Please check if the backend is running on http://localhost:8080')
      }
      
      if (error.response?.status === 400) {
        const message = error.response.data?.message || 'Invalid registration data'
        throw new Error(message)
      }
      
      if (error.response?.status === 409) {
        throw new Error('An account with this email already exists')
      }
      
      if (error.response?.status === 500) {
        throw new Error('Server error occurred. Please try again later.')
      }
      
      // Generic error fallback
      const message = error.response?.data?.message || error.message || 'Registration failed'
      throw new Error(message)
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout')
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error)
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
    const response = await this.client.get<ApiResponse<User>>('/auth/me')
    return response.data.data!
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
      console.error('Search API Error:', error)
      
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
    } catch (error) {
      console.error('Metrics API Error:', error)
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
  async getMonitoringItems(): Promise<any[]> {
    const response = await this.client.get('/monitoring')
    return response.data.data
  }

  async createMonitoringItem(item: any): Promise<any> {
    const response = await this.client.post('/monitoring', item)
    return response.data.data
  }

  async updateMonitoringItem(id: string, item: any): Promise<any> {
    const response = await this.client.put(`/monitoring/${id}`, item)
    return response.data.data
  }

  async deleteMonitoringItem(id: string): Promise<void> {
    await this.client.delete(`/monitoring/${id}`)
  }

  async getAlerts(page = 1, limit = 20): Promise<any> {
    const response = await this.client.get(`/alerts?page=${page}&limit=${limit}`)
    return response.data.data
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    await this.client.patch(`/alerts/${alertId}/read`)
  }

  async dismissAlert(alertId: string): Promise<void> {
    await this.client.patch(`/alerts/${alertId}/dismiss`)
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
    const response = await this.client.get<ApiResponse<UsageQuota>>('/user/usage/quota')
    return response.data.data!
  }

  async getTodayUsage(): Promise<UsageStats> {
    const response = await this.client.get<ApiResponse<UsageStats>>('/user/usage/today')
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

  // Generic request method for custom endpoints
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<ApiResponse<T>>(config)
    return response.data.data!
  }
}

// Create and export API client instance
const apiConfig: ApiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000')
}

export const apiClient = new ApiClient(apiConfig)
export default apiClient
