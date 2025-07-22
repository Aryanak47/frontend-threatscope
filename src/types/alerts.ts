// Alert action types and interfaces for the frontend

export interface AlertAction {
  id: number;
  breachAlertId: number;
  actionType: AlertActionType;
  status: AlertStatus;
  title: string;
  description: string;
  userMessage?: string;
  adminResponse?: string;
  contactEmail?: string;
  contactPhone?: string;
  companyName?: string;
  urgencyLevel?: string;
  estimatedBudget?: string;
  preferredTimeline?: string;
  additionalContext?: string;
  isProcessed: boolean;
  isServiceRequest: boolean;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  scheduledFor?: string;
  actionDisplayName: string;
  actionIcon: string;
  statusDisplayName: string;
  requiresFollowUp: boolean;
}

export enum AlertActionType {
  SECURITY_ASSESSMENT = 'SECURITY_ASSESSMENT',
  CODE_INVESTIGATION = 'CODE_INVESTIGATION',
  INCIDENT_RESPONSE = 'INCIDENT_RESPONSE',
  EXPERT_CONSULTATION = 'EXPERT_CONSULTATION',
  COMPLIANCE_CHECK = 'COMPLIANCE_CHECK',
  SECURITY_TRAINING = 'SECURITY_TRAINING',
  MARK_RESOLVED = 'MARK_RESOLVED',
  MARK_FALSE_POSITIVE = 'MARK_FALSE_POSITIVE',
  ACKNOWLEDGE = 'ACKNOWLEDGE',
  ESCALATE = 'ESCALATE'
}

export enum AlertStatus {
  NEW = 'NEW',
  VIEWED = 'VIEWED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED'
}

export interface ActionTypeInfo {
  type: AlertActionType;
  displayName: string;
  description: string;
  icon: string;
  isServiceRequest: boolean;
  isAlertManagement: boolean;
}

export interface CreateAlertActionRequest {
  actionType: AlertActionType;
  userMessage?: string;
  contactEmail?: string;
  contactPhone?: string;
  companyName?: string;
  urgencyLevel?: string;
  estimatedBudget?: string;
  preferredTimeline?: string;
  additionalContext?: string;
}

export interface AlertActionStatistics {
  pendingActions: number;
  totalServiceRequests: number;
  hasServiceRequests: boolean;
  hasPendingActions: boolean;
}

export interface BreachAlert {
  id: number;
  title: string;
  description: string;
  status: AlertStatus;
  severity: AlertSeverity;
  breachSource: string;
  breachDate?: string;
  affectedEmail?: string;
  affectedDomain?: string;
  affectedUsername?: string;
  isVerified: boolean;
  isFalsePositive: boolean;
  isRemediated: boolean;
  isAcknowledged: boolean;
  isEscalated: boolean;
  createdAt: string;
  updatedAt: string;
  viewedAt?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  dismissedAt?: string;
  riskScore?: number;
  confidenceLevel?: number;
}

export enum AlertSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}
