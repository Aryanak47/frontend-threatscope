// Consultation System Types

export interface ConsultationPlan {
  id: string
  name: string
  displayName: string
  description: string
  price: number
  currency: string
  sessionDurationMinutes: number
  durationDisplay: string
  features: string[]
  deliverables: string[]
  isPopular: boolean
  includesFollowUp: boolean
  followUpDays?: number
  formattedPrice: string
}

export interface ConsultationSession {
  id: string
  status: 'PENDING' | 'ASSIGNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  sessionPrice: number
  sessionNotes: string
  expertSummary?: string
  userRating?: number
  userFeedback?: string
  scheduledAt?: string
  startedAt?: string
  timerStartedAt?: string // NEW: When the actual consultation timer started
  completedAt?: string
  expiresAt?: string
  createdAt: string
  
  // NEW: Admin extension fields
  adminExtendedUntil?: string
  extendedByAdminEmail?: string
  extensionReason?: string
  isAdminManaged?: boolean
  
  // Related objects
  plan: ConsultationPlan
  expert?: Expert
  triggeringAlert?: any // TODO: Define proper BreachAlertSummary type
  user?: {
    id: number
    email: string
    firstName?: string
    lastName?: string
    fullName: string
    planType: string
    createdAt: string
  }
  
  // Session state
  durationMinutes?: number
  messageCount?: number
  fileCount?: number
  canStart: boolean
  canRate: boolean
  isExpired: boolean
  
  // NEW: Access control methods
  canUserAccess?: boolean
  canAdminAccess?: boolean
  needsAdminAttention?: boolean
  effectiveExpirationTime?: string
  minutesUntilExpiration?: number
}

export interface Expert {
  id: string
  name: string
  email: string
  specialization: string
  expertiseAreas: string[]
  hourlyRate?: number
  isAvailable: boolean
  isActive: boolean
  bio?: string
  certifications: string[]
  languages: string[]
  timezone: string
  maxConcurrentSessions: number
  totalSessions: number
  completedSessions: number
  averageRating?: number
  lastActiveAt?: string
}

export interface ChatMessage {
  id: string
  sender: 'USER' | 'EXPERT' | 'SYSTEM'
  messageType: 'TEXT' | 'FILE' | 'LINK' | 'ZOOM_LINK' | 'SYSTEM_MESSAGE'
  content: string
  isRead: boolean
  isSystemMessage: boolean
  createdAt: string
  editedAt?: string
  attachments?: ConsultationFile[]
  // NEW: Backend now provides sender identification
  senderUserId?: string
  senderName?: string
}

export interface ConsultationFile {
  id: string
  filename: string
  originalFilename: string
  contentType: string
  fileSize: number
  formattedFileSize: string
  uploadedBy: 'USER' | 'EXPERT' | 'SYSTEM'
  uploadedAt: string
  expiresAt: string
  downloadCount: number
  isImage: boolean
  isPdf: boolean
  isDocument: boolean
  isExpired: boolean
}

export interface SessionChat {
  session: ConsultationSession
  messages: ChatMessage[]
  files: ConsultationFile[]
  unreadCount: number
  canSendMessages: boolean
}

// Request types
export interface CreateConsultationRequest {
  alertId?: string | null  // Optional - can be null for general consultations
  planId: string          // Will be converted to number when sending to backend
  sessionNotes: string
  preferredTime?: string
  consultationType?: string  // "alert" or "general"
  consultationCategory?: string  // For general consultations
}

export interface SendMessageRequest {
  content: string
  messageType?: string
}

export interface RateSessionRequest {
  rating: number
  feedback?: string
}

// UI State types
export interface ConsultationState {
  plans: ConsultationPlan[]
  sessions: ConsultationSession[]
  currentSession: ConsultationSession | null
  currentChat: SessionChat | null
  loading: boolean
  error: string | null
}
