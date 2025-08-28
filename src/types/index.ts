// TypeScript type definitions for ThreatScope Frontend

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: string[]
  timestamp: string
}

// Authentication Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role?: string
  roles?: Role[] // Add roles array for better role management
  isEmailVerified: boolean
  subscription?: Subscription
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_MODERATOR' | 'ROLE_ANALYST' | 'ROLE_ENTERPRISE'
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string
  acceptTerms: boolean
  subscribeToNewsletter?: boolean
  company?: string
  jobTitle?: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// Search Types
export interface SearchRequest {
  query: string
  type: SearchType
  mode: SearchMode
  filters?: SearchFilters
  page?: number
  limit?: number
}

export interface AdvancedSearchRequest {
  criteria: SearchCriteria[]
  operator: 'AND' | 'OR'
  filters?: SearchFilters
  page?: number
  limit?: number
}

export interface BulkSearchRequest {
  queries: string[]
  type: SearchType
  mode: SearchMode
  filters?: SearchFilters
}

export interface SearchCriteria {
  field: string
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex'
  value: string
  caseSensitive?: boolean
}

export interface SearchFilters {
  dateRange?: {
    start: string
    end: string
  }
  sources?: string[]
  severity?: string[]
  verified?: boolean
}

export type SearchType = 'email' | 'username' | 'phone' | 'ip' | 'domain' | 'hash' | 'name'
export type SearchMode = 'exact' | 'fuzzy' | 'wildcard'

// Search Response Types
export interface SearchResponse {
  results: SearchResult[]
  metadata: SearchMetadata
  statistics?: SearchStatistics
  suggestions?: SearchSuggestions
  // Backend structure fields
  totalResults: number
  currentPage: number
  totalPages: number
  pageSize: number
  executionTimeMs: number
  query: string
  searchType: SearchType
  aggregations?: Record<string, any>
}

export interface SearchResult {
  id: string
  // Backend actual fields
  email?: string // For compatibility
  login?: string // Actual backend field
  domain?: string
  url?: string
  source: string
  timestamp?: string // Backend uses LocalDateTime
  dateCompromised?: string // For compatibility
  severity: 'low' | 'medium' | 'high' | 'critical'
  hasPassword?: boolean
  isVerified?: boolean // Now available from backend
  dataQuality: number // NEW: Data quality percentage from backend
  highlights?: Record<string, string[]>
  additionalData?: Record<string, any>
  
  // 🔐 SECURITY: New masked password fields
  maskedPassword?: string // Masked password from backend (e.g., "ab****xy")
  passwordDisplayMessage?: string // User-friendly message about password
  
  // NEW: Enhanced metrics from backend
  sourceRecordsAffected?: number // Total records in this breach
  sourceQualityScore?: number     // Data quality score for source
  sourceRiskLevel?: string        // Risk level for this source
  availableDataTypes?: string[]   // What data types are available
  breachDescription?: string      // Description of the breach
  timeline?: {
    breachDate?: string
    discoveryDate?: string
    reportedDate?: string
    daysBetweenBreachAndDiscovery?: number
  }
  
  // Raw data from backend (DEPRECATED: passwords no longer sent here)
  data: {
    login?: string
    // password field removed for security
    url?: string
    domain?: string
    metadata?: string
    dataQuality?: number // Also available in data object
    [key: string]: any
  }
}

export interface SearchMetadata {
  query: string
  totalResults: number
  totalSources: number
  searchTime: number
  page: number
  limit: number
  hasMore: boolean
}

export interface SearchStatistics {
  totalQueries: number
  topSearchTypes: Array<{
    type: string
    count: number
  }>
  recentSearches: Array<{
    query: string
    type: SearchType
    timestamp: string
  }>
  breachDistribution: Array<{
    source: string
    count: number
  }>
}

export interface SearchSuggestions {
  relatedQueries: string[]
  similarBreaches: string[]
  recommendedFilters: Record<string, string[]>
}

// Subscription Types
export interface Subscription {
  id: string
  planType: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED'
  billingCycle: 'MONTHLY' | 'YEARLY'
  currentPeriodStart: string
  currentPeriodEnd: string
  features: SubscriptionFeature[]
  usage: SubscriptionUsage
}

export interface SubscriptionFeature {
  name: string
  enabled: boolean
  limit?: number
}

export interface SubscriptionUsage {
  searchesUsed: number
  searchesLimit: number
  exportsUsed: number
  exportsLimit: number
  alertsUsed: number
  alertsLimit: number
}

// Alert Types
export interface BreachAlert {
  id: string
  userId: string
  monitoredItem: string
  itemType: SearchType
  breach: BreachInfo
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'NEW' | 'VIEWED' | 'DISMISSED'
  createdAt: string
}

export interface BreachInfo {
  source: string
  name: string
  description: string
  breachDate: string
  recordCount: number
  dataTypes: string[]
  verified: boolean
}

// Monitoring Types
export interface MonitoringItem {
  id: string
  userId: string
  query: string
  type: SearchType
  alertEnabled: boolean
  frequency: 'REAL_TIME' | 'DAILY' | 'WEEKLY'
  lastChecked?: string
  status: 'ACTIVE' | 'PAUSED'
  createdAt: string
}

// Enhanced Monitoring Types for Backend Integration
export interface CreateMonitoringItemRequest {
  monitorType: 'EMAIL' | 'DOMAIN' | 'USERNAME' | 'IP_ADDRESS' | 'KEYWORD' | 'PHONE' | 'ORGANIZATION'
  targetValue: string
  monitorName: string
  description?: string
  frequency: 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY'
  isActive?: boolean
  emailAlerts?: boolean
  inAppAlerts?: boolean
}

export interface UpdateMonitoringItemRequest {
  monitorName?: string
  description?: string
  frequency?: 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY'
  isActive?: boolean
  emailAlerts?: boolean
  inAppAlerts?: boolean
}

export interface MonitoringItemResponse {
  id: string
  monitorType: string
  targetValue: string
  monitorName: string
  description?: string
  frequency: string
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

// Duplicate Prevention Types
export interface DuplicateMonitoringError {
  message: string
  targetValue: string
  monitorType: string
  existingItemId: string
  suggestion: string
}

export class DuplicateError extends Error {
  public targetValue: string
  public monitorType: string
  public existingItemId: string
  public suggestion: string

  constructor(errorData: DuplicateMonitoringError) {
    super(errorData.message)
    this.name = 'DuplicateError'
    this.targetValue = errorData.targetValue
    this.monitorType = errorData.monitorType
    this.existingItemId = errorData.existingItemId
    this.suggestion = errorData.suggestion
  }
}

// Dashboard Types
export interface DashboardData {
  overview: DashboardOverview
  recentSearches: SearchHistory[]
  alerts: BreachAlert[]
  monitoringItems: MonitoringItem[]
  statistics: DashboardStatistics
}

export interface DashboardOverview {
  totalSearches: number
  breachesFound: number
  activeAlerts: number
  monitoredItems: number
}

export interface DashboardStatistics {
  searchTrends: Array<{
    date: string
    count: number
  }>
  breachSeverityDistribution: Array<{
    severity: string
    count: number
  }>
  topSources: Array<{
    source: string
    count: number
  }>
}

// History Types
export interface SearchHistory {
  id: string
  query: string
  type: SearchType
  resultsCount: number
  timestamp: string
  duration: number
}

// System Health Types
export interface SystemHealthResponse {
  status: 'healthy' | 'degraded' | 'down'
  services: ServiceHealth[]
  uptime: number
  responseTime: number
  timestamp: string
}

export interface ServiceHealth {
  name: string
  status: 'up' | 'down' | 'degraded'
  responseTime?: number
  lastCheck: string
}

// Export Types
export interface ExportRequest {
  searchId: string
  format: 'csv' | 'excel' | 'pdf' | 'json'
  fields?: string[]
  filters?: SearchFilters
}

export interface ExportResponse {
  downloadUrl: string
  filename: string
  size: number
  expiresAt: string
}

// Timeline Types
export interface TimelineEvent {
  id: string
  type: 'breach' | 'search' | 'alert' | 'export'
  title: string
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

// UI State Types
export interface AppState {
  user: User | null
  isAuthenticated: boolean
  theme: 'light' | 'dark' | 'system'
  sidebarCollapsed: boolean
  notifications: Notification[]
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: () => void
  variant?: 'default' | 'destructive'
}

// Form Types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'select' | 'checkbox' | 'textarea'
  placeholder?: string
  required?: boolean
  validation?: any
  options?: Array<{ label: string; value: string }>
}

// Component Props Types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface PageProps {
  params: Record<string, string>
  searchParams: Record<string, string | string[] | undefined>
}

// API Error Types
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}

// Utility Types
export type Status = 'idle' | 'loading' | 'success' | 'error'
export type Theme = 'light' | 'dark' | 'system'
export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  field: string
  direction: SortDirection
}

export interface PaginationConfig {
  page: number
  limit: number
  total: number
}

// External Service Types
export interface ExternalBreachData {
  source: string
  name: string
  domain: string
  breachDate: string
  addedDate: string
  modifiedDate: string
  pwnCount: number
  description: string
  logoPath: string
  dataClasses: string[]
  isVerified: boolean
  isFabricated: boolean
  isSensitive: boolean
  isRetired: boolean
  isSpamList: boolean
}

// Lazy-loaded metrics from backend
export interface SourceDetailedMetrics {
  source: string
  totalRecordsAffected: number
  passwordStats: {
    totalRecords: number
    withPassword: number
    withoutPassword: number
    strongPasswords: number
    percentage: number
    strongPasswordPercentage: number
  }
  domainDistribution: Record<string, number>
  qualityAssessment: {
    score: number
    details: string
    loginCompleteness: number
    passwordCompleteness: number
    urlCompleteness: number
    domainCompleteness: number
  }
  breachDate: string
  riskLevel: string
  insights: Record<string, any>
  calculatedAt: string
}
