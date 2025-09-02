'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlanSelectionModal } from '@/components/consultation/plan-selection-modal'
import {
  AlertTriangle,
  Shield,
  Calendar,
  Globe,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  Copy,
  CheckCircle,
  MessageSquare,
  Users,
  Clock,
  Info,
  Zap,
  Lock,
  Activity
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Alert {
  id: string
  title: string
  description: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'NEW' | 'VIEWED' | 'ACKNOWLEDGED' | 'DISMISSED' | 'RESOLVED'
  breachSource?: string
  breachDate?: string
  affectedEmail?: string
  affectedDomain?: string
  createdAt: string
  breachData?: string
}

interface AlertCardProps {
  alert: Alert
  onMarkRead?: (alertId: string) => void
  onViewDetails?: (alertId: string) => void
}

interface ParsedBreachData {
  email?: string
  password?: string
  domain?: string
  url?: string
  source?: string
  breachDate?: string
  [key: string]: any
}

function parseBreachData(breachDataStr?: string): ParsedBreachData {
  if (!breachDataStr) return {}
  
  try {
    return JSON.parse(breachDataStr)
  } catch {
    return {}
  }
}

function extractInfoFromDescription(description: string): {
  email?: string
  password?: string
  domain?: string
  source?: string
  date?: string
} {
  const info: any = {}
  
  // Extract email
  const emailMatch = description.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
  if (emailMatch) info.email = emailMatch[1]
  
  // Extract password (look for "Password: ...")
  const passwordMatch = description.match(/Password:\s*([^\s-]+)/)
  if (passwordMatch) info.password = passwordMatch[1]
  
  // Extract domain
  const domainMatch = description.match(/domain=([^,\s}]+)/)
  if (domainMatch) info.domain = domainMatch[1]
  
  // Extract source
  const sourceMatch = description.match(/Source:\s*([^\n-]+)/)
  if (sourceMatch) info.source = sourceMatch[1].trim()
  
  // Extract date
  const dateMatch = description.match(/Date:\s*([^\n-]+)/)
  if (dateMatch) info.date = dateMatch[1].trim()
  
  return info
}

function maskPassword(password: string): string {
  if (!password || password.length <= 4) return '****'
  
  const visibleChars = Math.min(2, Math.floor(password.length / 3))
  const start = password.substring(0, visibleChars)
  const end = password.substring(password.length - visibleChars)
  const maskedLength = Math.max(4, password.length - (2 * visibleChars))
  
  return start + '*'.repeat(maskedLength) + end
}

function formatDate(dateStr?: string): string {
  if (!dateStr || dateStr === 'null') return 'Unknown'
  
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

export function AlertCard({ alert, onMarkRead, onViewDetails }: AlertCardProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showRawData, setShowRawData] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const router = useRouter()
  
  // Parse breach data and extract info from description
  const breachData = parseBreachData(alert.breachData)
  const descriptionInfo = extractInfoFromDescription(alert.description)
  
  // Combine data sources (prefer parsed JSON data over description extraction)
  const combinedInfo = {
    email: breachData.login || breachData.email || descriptionInfo.email || alert.affectedEmail,
    password: breachData.password || descriptionInfo.password,
    domain: breachData.domain || descriptionInfo.domain || alert.affectedDomain,
    url: breachData.url,
    source: breachData.source || descriptionInfo.source || alert.breachSource,
    breachDate: breachData.breach_date || descriptionInfo.date || alert.breachDate
  }
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500 border-red-500/50'
      case 'HIGH': return 'bg-orange-500 border-orange-500/50' 
      case 'MEDIUM': return 'bg-yellow-500 border-yellow-500/50'
      case 'LOW': return 'bg-blue-500 border-blue-500/50'
      default: return 'bg-slate-500 border-slate-500/50'
    }
  }
  
  const getSeverityGlow = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'shadow-red-500/20'
      case 'HIGH': return 'shadow-orange-500/20'
      case 'MEDIUM': return 'shadow-yellow-500/20'
      case 'LOW': return 'shadow-blue-500/20'
      default: return 'shadow-slate-500/20'
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-red-500/10 text-red-400 border-red-500/30'
      case 'VIEWED': return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      case 'ACKNOWLEDGED': return 'bg-green-500/10 text-green-400 border-green-500/30'
      case 'RESOLVED': return 'bg-green-500/10 text-green-400 border-green-500/30'
      case 'DISMISSED': return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
    }
  }
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <AlertTriangle className="h-5 w-5 text-red-400" />
      case 'HIGH': return <Zap className="h-5 w-5 text-orange-400" />
      case 'MEDIUM': return <Info className="h-5 w-5 text-yellow-400" />
      case 'LOW': return <Activity className="h-5 w-5 text-blue-400" />
      default: return <Shield className="h-5 w-5 text-slate-400" />
    }
  }
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const handleConsultationSuccess = (sessionId: string) => {
    toast.success('Consultation session created successfully!')
    router.push(`/consultation/${sessionId}`)
  }
  
  return (
    <div className={`relative rounded-xl border-2 bg-slate-900/50 backdrop-blur-sm p-6 shadow-2xl transition-all duration-300 hover:shadow-3xl ${getSeverityColor(alert.severity)} ${getSeverityGlow(alert.severity)}`}>
      {/* Severity Indicator Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${getSeverityColor(alert.severity).split(' ')[0]}`} />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className={`relative p-3 rounded-xl bg-slate-800/50 border ${getSeverityColor(alert.severity).split(' ')[1]} shadow-lg`}>
            {getSeverityIcon(alert.severity)}
            {alert.severity === 'CRITICAL' && (
              <div className="absolute -top-1 -right-1">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-xl font-bold text-slate-100">
                Security Breach Detected
              </h3>
              {alert.severity === 'CRITICAL' && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/30 rounded-full animate-pulse">
                  URGENT
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className={`border ${getStatusColor(alert.status)}`}>
                {alert.status}
              </Badge>
              <Badge variant="outline" className={`border font-semibold ${getSeverityColor(alert.severity)} text-white`}>
                {alert.severity} RISK
              </Badge>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 text-slate-400 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">
              {formatDate(alert.createdAt)}
            </span>
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wide">
            Alert ID: {String(alert.id).slice(-6)}
          </div>
        </div>
      </div>
      
      {/* Main Info */}
      <div className="space-y-4">
        {/* Critical Asset Alert */}
        {combinedInfo.email && (
          <div className="relative p-4 bg-red-500/5 border border-red-500/20 rounded-xl mb-6">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 to-orange-500" />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/30">
                  <Lock className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="font-semibold text-red-400 mb-1">COMPROMISED ACCOUNT</p>
                  <p className="text-slate-200 font-mono text-lg">{combinedInfo.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(combinedInfo.email, 'Email')}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Threat Intelligence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {combinedInfo.source && combinedInfo.source !== 'Unknown' && (
            <div className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">BREACH SOURCE</p>
                  <p className="text-slate-200 font-medium">{combinedInfo.source}</p>
                </div>
              </div>
            </div>
          )}
          
          {combinedInfo.breachDate && combinedInfo.breachDate !== 'null' && (
            <div className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">BREACH DATE</p>
                  <p className="text-slate-200 font-medium">{formatDate(combinedInfo.breachDate)}</p>
                </div>
              </div>
            </div>
          )}
          
          {combinedInfo.domain && (
            <div className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg md:col-span-2">
              <div className="flex items-center space-x-3">
                <ExternalLink className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">AFFECTED DOMAIN</p>
                  <p className="text-slate-200 font-medium">{combinedInfo.domain}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Critical Password Exposure */}
        {combinedInfo.password && (
          <div className="relative p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl mb-6">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-500 to-red-500" />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/30">
                  <Key className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-amber-400 mb-1">PASSWORD COMPROMISED</p>
                  <code className="bg-slate-800/50 border border-slate-700/50 px-3 py-2 rounded-lg text-slate-200 font-mono">
                    {showPassword ? combinedInfo.password : maskPassword(combinedInfo.password)}
                  </code>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(combinedInfo.password, 'Password')}
                  className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Critical Response Actions */}
        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <h4 className="font-semibold text-blue-400 text-lg">
              IMMEDIATE RESPONSE REQUIRED
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-800/20">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-slate-200 text-sm font-medium">Change password immediately</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-800/20">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-slate-200 text-sm font-medium">Enable 2FA authentication</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-800/20">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <span className="text-slate-200 text-sm font-medium">Review account activity</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-800/20">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <span className="text-slate-200 text-sm font-medium">Use unique passwords</span>
            </div>
          </div>
        </div>

        {/* Expert Response Team */}
        <div className="relative p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-green-500 to-blue-500" />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/30">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h4 className="font-bold text-green-400 text-lg mb-1">
                  EXPERT INCIDENT RESPONSE
                </h4>
                <p className="text-slate-300">
                  Get immediate guidance from certified cybersecurity experts
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  • Threat containment • Recovery planning • Security hardening
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowPlanModal(true)}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              START RESPONSE
            </Button>
          </div>
        </div>
      </div>
      
      {/* Action Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex items-center space-x-3">
          {alert.status === 'NEW' && onMarkRead && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMarkRead(alert.id)}
              className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
            >
              <Eye className="h-4 w-4 mr-2" />
              Mark Read
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowRawData(!showRawData)}
            className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
          >
            <Activity className="h-4 w-4 mr-2" />
            {showRawData ? 'Hide' : 'Show'} Forensics
          </Button>
        </div>
        
        {onViewDetails && (
          <Button 
            size="sm" 
            onClick={() => onViewDetails(alert.id)}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Full Analysis
          </Button>
        )}
      </div>
      
      {/* Forensic Data (Collapsible) */}
      {showRawData && (
        <div className="mt-4 p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <Activity className="h-4 w-4 text-slate-400" />
            <h5 className="font-semibold text-slate-300">Forensic Data & Telemetry:</h5>
          </div>
          <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800">
            <pre className="text-xs text-slate-400 whitespace-pre-wrap overflow-auto max-h-40 font-mono">
              {JSON.stringify({ 
                alert_id: alert.id,
                title: alert.title,
                description: alert.description,
                breach_data: alert.breachData,
                timestamp: alert.createdAt,
                severity_level: alert.severity,
                detection_source: "ThreatScope Intel"
              }, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Plan Selection Modal */}
      <PlanSelectionModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        alertId={alert.id}
        alertTitle={alert.title}
        onSuccess={handleConsultationSuccess}
      />
    </div>
  )
}
