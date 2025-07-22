'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  CheckCircle
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

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
      case 'CRITICAL': return 'bg-red-500'
      case 'HIGH': return 'bg-orange-500' 
      case 'MEDIUM': return 'bg-yellow-500'
      case 'LOW': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-red-100 text-red-800'
      case 'VIEWED': return 'bg-blue-100 text-blue-800'
      case 'ACKNOWLEDGED': return 'bg-green-100 text-green-800'
      case 'RESOLVED': return 'bg-green-100 text-green-800'
      case 'DISMISSED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }
  
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`} />
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              🚨 Security Breach Detected
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className={getStatusColor(alert.status)}>
                {alert.status}
              </Badge>
              <Badge variant="outline" className={`${getSeverityColor(alert.severity)} text-white`}>
                {alert.severity}
              </Badge>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {formatDate(alert.createdAt)}
        </div>
      </div>
      
      {/* Main Info */}
      <div className="space-y-4">
        {/* Target Asset */}
        {combinedInfo.email && (
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Compromised Account</p>
                <p className="text-red-700">{combinedInfo.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(combinedInfo.email, 'Email')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Breach Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Source */}
          {combinedInfo.source && combinedInfo.source !== 'Unknown' && (
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Source:</span>
              <span className="text-sm font-medium">{combinedInfo.source}</span>
            </div>
          )}
          
          {/* Date */}
          {combinedInfo.breachDate && combinedInfo.breachDate !== 'null' && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Date:</span>
              <span className="text-sm font-medium">{formatDate(combinedInfo.breachDate)}</span>
            </div>
          )}
          
          {/* Domain */}
          {combinedInfo.domain && (
            <div className="flex items-center space-x-2">
              <ExternalLink className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Domain:</span>
              <span className="text-sm font-medium">{combinedInfo.domain}</span>
            </div>
          )}
        </div>
        
        {/* Password Section */}
        {combinedInfo.password && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Password Exposed:</span>
                <code className="bg-yellow-100 px-2 py-1 rounded text-sm">
                  {showPassword ? combinedInfo.password : maskPassword(combinedInfo.password)}
                </code>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(combinedInfo.password, 'Password')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Security Recommendations */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Immediate Actions Required
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Change password immediately for this account</li>
            <li>• Enable two-factor authentication (2FA)</li>
            <li>• Check for unauthorized account activity</li>
            <li>• Use unique passwords for each service</li>
          </ul>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          {alert.status === 'NEW' && onMarkRead && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMarkRead(alert.id)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Mark Read
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowRawData(!showRawData)}
          >
            {showRawData ? 'Hide' : 'Show'} Raw Data
          </Button>
        </div>
        
        {onViewDetails && (
          <Button size="sm" onClick={() => onViewDetails(alert.id)}>
            View Details
          </Button>
        )}
      </div>
      
      {/* Raw Data (Collapsible) */}
      {showRawData && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h5 className="font-semibold text-gray-700 mb-2">Raw Alert Data:</h5>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-40">
            {JSON.stringify({ 
              title: alert.title,
              description: alert.description,
              breachData: alert.breachData 
            }, null, 2)}
          </pre>
        </div>
      )}
    </Card>
  )
}
