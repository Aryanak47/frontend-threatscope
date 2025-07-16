import React from 'react'
import { SearchResult, SourceDetailedMetrics } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { 
  CheckCircle, 
  Clock,
  Download,
  Filter,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Search,
  Shield,
  Eye,
  EyeOff,
  Copy,
  Database,
  Info,
  Key,
  Globe,
  User
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ResultsDisplayProps {
  results: SearchResult[]
  isDemo?: boolean
  searchQuery: string
  isLoading?: boolean
  showExportButton?: boolean
  showFilterButton?: boolean
  onExport?: () => void
  onFilter?: () => void
  className?: string
  totalResults?: number
  searchTime?: number
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  results, 
  isDemo = false, 
  searchQuery, 
  isLoading = false,
  showExportButton = true,
  showFilterButton = true,
  onExport,
  onFilter,
  className = "",
  totalResults,
  searchTime
}) => {
  const [expandedResults, setExpandedResults] = React.useState<Set<string>>(new Set())
  const [maskedFields, setMaskedFields] = React.useState<Set<string>>(new Set())
  const [loadingMetrics, setLoadingMetrics] = React.useState<Set<string>>(new Set())
  const [metricsCache, setMetricsCache] = React.useState<Map<string, SourceDetailedMetrics>>(new Map())

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-600'
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getSeverityTextColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800'
      case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800'
      case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800'
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800'
    }
  }

  // Get available data fields from result structure (enhanced)
  const getAvailableFields = (result: SearchResult) => {
    // Use availableDataTypes from backend if available
    if (result.availableDataTypes && result.availableDataTypes.length > 0) {
      return result.availableDataTypes
    }
    
    // Fallback to calculating from data object
    const fields = []
    if (result.data?.login || result.email) fields.push('Email/Login')
    if (result.data?.password || result.hasPassword) fields.push('Password')
    if (result.data?.url || result.url) fields.push('URL')
    if (result.data?.domain || result.domain) fields.push('Domain')
    if (result.data?.metadata) fields.push('Metadata')
    
    return fields
  }

  const extractDomain = (email: string) => {
    if (email && email.includes('@')) {
      return email.split('@')[1]
    }
    return null
  }

  const toggleResultExpansion = async (resultId: string) => {
    const newExpanded = new Set(expandedResults)
    if (newExpanded.has(resultId)) {
      newExpanded.delete(resultId)
    } else {
      newExpanded.add(resultId)
      
      // Load metrics when expanding (only in live mode)
      if (!isDemo) {
        const result = results.find(r => r.id === resultId)
        if (result && result.source && !metricsCache.has(result.source)) {
          console.log('🚀 Loading metrics for source:', result.source)
          setLoadingMetrics(prev => {
            const newSet = new Set(prev)
            newSet.add(resultId)
            return newSet
          })
          
          try {
            console.log('📡 Making API call to:', `/v1/search/metrics/${encodeURIComponent(result.source)}`)
            const metrics = await apiClient.getSourceMetrics(result.source)
            console.log('✅ Metrics loaded successfully:', metrics)
            
            setMetricsCache(prev => {
              const newMap = new Map(prev)
              newMap.set(result.source, metrics)
              return newMap
            })
            toast.success('Detailed metrics loaded!')
          } catch (error) {
            console.error('❌ Error loading metrics:', error)
            toast.error('Failed to load detailed metrics')
          } finally {
            setLoadingMetrics(prev => {
              const newSet = new Set(prev)
              newSet.delete(resultId)
              return newSet
            })
          }
        }
      }
    }
    setExpandedResults(newExpanded)
  }

  const toggleFieldMask = (fieldKey: string) => {
    const newMasked = new Set(maskedFields)
    if (newMasked.has(fieldKey)) {
      newMasked.delete(fieldKey)
    } else {
      newMasked.add(fieldKey)
    }
    setMaskedFields(newMasked)
  }

  const maskSensitiveData = (key: string, value: string, isVisible: boolean = false) => {
    if (isVisible) return value
    
    const sensitiveFields = ['password']
    const isSensitive = sensitiveFields.some(field => key.toLowerCase().includes(field))
    
    if (isSensitive && typeof value === 'string' && value.length > 6) {
      return value.substring(0, 3) + '*'.repeat(Math.min(value.length - 6, 10)) + value.substring(value.length - 3)
    }
    
    return value
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  // Utility functions for safe metric handling
  const formatQualityScore = (score?: number | null): { display: string; description: string } => {
    if (typeof score !== 'number' || score === null) {
      return { display: 'N/A', description: 'Quality assessment unavailable' }
    }
    
    return {
      display: `${score.toFixed(1)}%`,
      description: score >= 80 ? 'High quality data' :
                   score >= 60 ? 'Medium quality data' :
                   'Lower quality data'
    }
  }

  const formatRecordsAffected = (count?: number | null): string => {
    if (typeof count !== 'number' || count === null || count <= 0) {
      return 'Unknown'
    }
    return count.toLocaleString()
  }

  const hasValidMetric = (value?: number | null): boolean => {
    return typeof value === 'number' && value !== null
  }

  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Unknown Date'
    }
  }

  const handleExport = () => {
    if (onExport) {
      onExport()
    } else {
      toast.success('Export functionality will be implemented soon')
    }
  }

  const handleFilter = () => {
    if (onFilter) {
      onFilter()
    } else {
      toast.success('Filter functionality will be implemented soon')
    }
  }

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-security-600" />
            <p className="text-muted-foreground">Searching through billions of records...</p>
            <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
          </div>
        </div>
      </Card>
    )
  }

  if (!results || results.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
          <p className="text-muted-foreground mb-4">
            No breaches found for "{searchQuery}". 
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Try a different search term or check your spelling</p>
            <p>• Use wildcard search for broader results</p>
            <p>• Check if the query format matches the selected search type</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-6 ${className}`}>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold">Search Results</h3>
            {isDemo && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Demo Data
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Found {totalResults || results.length} result{(totalResults || results.length) !== 1 ? 's' : ''} for "{searchQuery}"
            </span>
            {searchTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {searchTime}ms
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {showFilterButton && (
            <Button variant="outline" size="sm" onClick={handleFilter}>
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          )}
          {showExportButton && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {results.map((result) => {
          const isExpanded = expandedResults.has(result.id)
          const availableFields = getAvailableFields(result)
          const email = result.data?.login || result.email
          const domain = result.data?.domain || result.domain || (email ? extractDomain(email) : null)
          const url = result.data?.url || result.url
          const hasPassword = result.data?.password || result.hasPassword
          const actualPassword = result.data?.password
          
          // Debug logging for password detection
          if (result.source === 'stealer_logs_10_07_2025') {
            console.log('Password debug for stealer_logs:', {
              'result.data': result.data,
              'result.data?.password': result.data?.password,
              'actualPassword': actualPassword,
              'hasPassword': hasPassword,
              'result.hasPassword': result.hasPassword,
              'isExpanded': isExpanded
            })
          }
          const timestamp = result.data?.timestamp || result.timestamp || result.dateCompromised
          
          return (
            <div 
              key={result.id}
              className="border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"
            >
              {/* Result Header with Enhanced Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getSeverityColor(result.severity)}`} />
                  <span className="font-semibold text-lg">{result.source || 'Unknown Source'}</span>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityBadgeColor(result.severity)}`}>
                    {(result.severity || 'UNKNOWN').toUpperCase()}
                  </span>
                  {/* Verification Status */}
                  {result.isVerified !== undefined && (
                    result.isVerified ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-yellow-600">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        <span className="text-sm">Unverified</span>
                      </div>
                    )
                  )}
                  {/* Risk Level Badge */}
                  {result.sourceRiskLevel && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      result.sourceRiskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-300' :
                      result.sourceRiskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700 border border-orange-300' :
                      result.sourceRiskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                      'bg-green-100 text-green-700 border border-green-300'
                    }`}>
                      {result.sourceRiskLevel} RISK
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {timestamp && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDate(timestamp)}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleResultExpansion(result.id)}
                    disabled={loadingMetrics.has(result.id)}
                  >
                    {loadingMetrics.has(result.id) ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        {isExpanded ? 'Show Less' : 'Show More'}
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Breach Description */}
              {result.breachDescription && (
                <p className="text-sm text-muted-foreground mb-4 p-3 bg-muted/30 rounded-lg">
                  <Info className="h-4 w-4 inline mr-2" />
                  {result.breachDescription}
                </p>
              )}

              {/* Enhanced Information Grid */}
              <div className="space-y-3 mb-4">
                {/* Email/Login Row */}
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-muted-foreground block mb-1">Email/Login</span>
                    <div className="font-medium text-sm break-all" title={email}>
                      {email || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Records Affected Row - NEW */}
                {hasValidMetric(result.sourceRecordsAffected) && result.sourceRecordsAffected! > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                    <Database className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-red-800 dark:text-red-200 block mb-1">Records Affected</span>
                      <div className="font-bold text-sm text-red-900 dark:text-red-100">
                        {formatRecordsAffected(result.sourceRecordsAffected)} accounts
                      </div>
                      <div className="text-xs text-red-600 dark:text-red-300 mt-1">
                        Total victims in this breach campaign
                      </div>
                    </div>
                  </div>
                )}

                {/* Domain, Password, and Verification Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {domain && (
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <Globe className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-muted-foreground block mb-1">Domain</span>
                        <div className="font-medium text-sm break-all">{domain}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                    hasPassword ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' : 'bg-muted/30'
                  }`}>
                    <Key className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                      hasPassword ? 'text-red-600' : 'text-muted-foreground'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <span className={`text-sm font-medium block mb-1 ${
                        hasPassword ? 'text-red-800 dark:text-red-200' : 'text-muted-foreground'
                      }`}>Password</span>
                      <div className="font-medium text-sm">
                        <span className={hasPassword ? 'text-red-900 dark:text-red-100 font-bold' : 'text-red-600'}>
                          {hasPassword ? 'Yes' : 'No'}
                        </span>
                      </div>
                      {hasPassword && (
                        <div className="text-xs text-red-600 dark:text-red-300 mt-1">
                          Password available in breach
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Verification Status */}
                  {result.isVerified !== undefined && (
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <Shield className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-muted-foreground block mb-1">Verification</span>
                        <div className="font-medium text-sm">
                          <span className={result.isVerified ? 'text-green-600' : 'text-yellow-600'}>
                            {result.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quality Score and Risk Assessment Row - NEW */}
                {(hasValidMetric(result.dataQuality) || result.sourceRiskLevel) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {hasValidMetric(result.dataQuality) && (() => {
                      const qualityInfo = formatQualityScore(result.dataQuality)
                      return (
                        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200 block mb-1">Data Quality</span>
                            <div className="font-bold text-sm text-blue-900 dark:text-blue-100">
                              {qualityInfo.display}
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                              {qualityInfo.description}
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    {result.sourceRiskLevel && (
                      <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                        result.sourceRiskLevel === 'CRITICAL' ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' :
                        result.sourceRiskLevel === 'HIGH' ? 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800' :
                        result.sourceRiskLevel === 'MEDIUM' ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800' :
                        'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                      }`}>
                        <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                          result.sourceRiskLevel === 'CRITICAL' ? 'text-red-600' :
                          result.sourceRiskLevel === 'HIGH' ? 'text-orange-600' :
                          result.sourceRiskLevel === 'MEDIUM' ? 'text-yellow-600' :
                          'text-green-600'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <span className={`text-sm font-medium block mb-1 ${
                            result.sourceRiskLevel === 'CRITICAL' ? 'text-red-800 dark:text-red-200' :
                            result.sourceRiskLevel === 'HIGH' ? 'text-orange-800 dark:text-orange-200' :
                            result.sourceRiskLevel === 'MEDIUM' ? 'text-yellow-800 dark:text-yellow-200' :
                            'text-green-800 dark:text-green-200'
                          }`}>Risk Level</span>
                          <div className={`font-bold text-sm ${
                            result.sourceRiskLevel === 'CRITICAL' ? 'text-red-900 dark:text-red-100' :
                            result.sourceRiskLevel === 'HIGH' ? 'text-orange-900 dark:text-orange-100' :
                            result.sourceRiskLevel === 'MEDIUM' ? 'text-yellow-900 dark:text-yellow-100' :
                            'text-green-900 dark:text-green-100'
                          }`}>
                            {result.sourceRiskLevel}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Data Fields Row */}
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Database className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-muted-foreground block mb-1">Data Fields</span>
                    <div className="font-medium text-sm">
                      {availableFields.length} field{availableFields.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Data Types - Improved layout */}
              <div className="mb-4">
                <span className="text-sm font-medium text-muted-foreground block mb-3">
                  Available Data Fields
                </span>
                <div className="flex flex-wrap gap-2">
                  {availableFields.map((field, i) => (
                    <span 
                      key={i}
                      className="inline-flex items-center px-3 py-1.5 text-sm bg-muted text-muted-foreground rounded-full border hover:bg-muted/80 transition-colors"
                    >
                      {field}
                    </span>
                  ))}
                  {availableFields.length === 0 && (
                    <span className="text-sm text-muted-foreground italic">
                      No data fields available
                    </span>
                  )}
                </div>
              </div>

              {/* Detailed Data (Expandable) - Improved layout */}
              {isExpanded && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium">Breach Data Details</h4>
                    <div className="text-xs text-muted-foreground">
                      Click eye icon to reveal sensitive data
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {/* Display actual data fields */}
                    {email && (
                      <div className="p-3 bg-background rounded-lg border">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-medium text-muted-foreground block mb-1">
                              Email/Login
                            </span>
                            <span className="text-sm font-mono break-all select-all">{email}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(email)}
                            className="h-6 w-6 p-0 flex-shrink-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Password Field - Enhanced to show actual password when available */}
                    {(actualPassword || result.hasPassword) && (
                      <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-medium text-red-800 dark:text-red-200 block mb-1">
                              Password
                            </span>
                            {actualPassword ? (
                              <span className="text-sm font-mono break-all select-all text-red-900 dark:text-red-100">
                                {maskSensitiveData('password', actualPassword, !maskedFields.has(`${result.id}-password`))}
                              </span>
                            ) : (
                              <span className="text-sm text-red-900 dark:text-red-100">
                                Password available (hidden in demo)
                              </span>
                            )}
                            <div className="text-xs text-red-600 dark:text-red-300 mt-1">
                              ⚠️ Compromised password - change immediately
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {actualPassword && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleFieldMask(`${result.id}-password`)}
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                  title="Toggle password visibility"
                                >
                                  {!maskedFields.has(`${result.id}-password`) ? (
                                    <EyeOff className="h-3 w-3" />
                                  ) : (
                                    <Eye className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => actualPassword && copyToClipboard(actualPassword)}
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                  title="Copy password to clipboard"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {url && (
                      <div className="p-3 bg-background rounded-lg border">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-medium text-muted-foreground block mb-1">
                              URL
                            </span>
                            <span className="text-sm font-mono break-all select-all">{url}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(url)}
                            className="h-6 w-6 p-0 flex-shrink-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {result.data?.metadata && (
                      <div className="p-3 bg-background rounded-lg border">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-medium text-muted-foreground block mb-1">
                              Metadata
                            </span>
                            <span className="text-sm font-mono break-all select-all">
                              {result.data.metadata}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => result.data?.metadata && copyToClipboard(result.data.metadata)}
                            className="h-6 w-6 p-0 flex-shrink-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Detailed Metrics Section - NEW */}
                  {!isDemo && metricsCache.has(result.source) && (
                    <div className="mt-4 pt-3 border-t border-border">
                      <h5 className="text-sm font-medium mb-3 flex items-center">
                        <Database className="h-4 w-4 mr-2" />
                        Source Metrics
                      </h5>
                      {(() => {
                        const metrics = metricsCache.get(result.source)!
                        return (
                          <div className="space-y-3">
                            {/* Total Records */}
                            <div className="p-3 bg-background rounded-lg border">
                              <div className="text-xs font-medium text-muted-foreground mb-1">
                                Total Records in Source
                              </div>
                              <div className="text-sm font-mono">
                                {metrics.totalRecordsAffected?.toLocaleString() || 'N/A'}
                              </div>
                            </div>

                            {/* Password Stats */}
                            {metrics.passwordStats && (
                              <div className="p-3 bg-background rounded-lg border">
                                <div className="text-xs font-medium text-muted-foreground mb-1">
                                  Password Statistics
                                </div>
                                <div className="text-sm space-y-1">
                                  <div>With Password: {metrics.passwordStats.withPassword?.toLocaleString() || 'N/A'}</div>
                                  <div>Without Password: {metrics.passwordStats.withoutPassword?.toLocaleString() || 'N/A'}</div>
                                  <div>Strong Passwords: {metrics.passwordStats.strongPasswords?.toLocaleString() || 'N/A'}</div>
                                  <div>Password Coverage: {metrics.passwordStats.percentage?.toFixed(1)}%</div>
                                </div>
                              </div>
                            )}

                            {/* Quality Assessment */}
                            {metrics.qualityAssessment && (
                              <div className="p-3 bg-background rounded-lg border">
                                <div className="text-xs font-medium text-muted-foreground mb-1">
                                  Data Quality Score
                                </div>
                                <div className="text-sm">
                                  <div className="font-mono text-lg">{metrics.qualityAssessment.score?.toFixed(1)}%</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {metrics.qualityAssessment.details}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Top Domains */}
                            {metrics.domainDistribution && Object.keys(metrics.domainDistribution).length > 0 && (
                              <div className="p-3 bg-background rounded-lg border">
                                <div className="text-xs font-medium text-muted-foreground mb-1">
                                  Top Affected Domains
                                </div>
                                <div className="text-sm space-y-1">
                                  {Object.entries(metrics.domainDistribution).slice(0, 3).map(([domain, count]) => (
                                    <div key={domain} className="flex justify-between">
                                      <span>{domain}</span>
                                      <span className="font-mono">{(count as number).toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  )}
                  
                  {isDemo && (
                    <div className="mt-4 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        * This is sample demo data. Actual results contain real breach data from our database.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Demo Notice */}
      {isDemo && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Demo Results
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                These are sample results to demonstrate the platform's capabilities. 
                Real searches will show actual breach data from our comprehensive database.
              </p>
              <div className="mt-2">
                <Button variant="outline" size="sm" asChild className="text-blue-600 border-blue-300">
                  <a href="/register">Start Free Trial for Real Data</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default ResultsDisplay