'use client'

import { SearchResult, SourceDetailedMetrics } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Shield, 
  Database,
  Eye,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  TrendingUp,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface ResultItemProps {
  result: SearchResult
  viewMode?: 'list' | 'grid'
  onClick?: () => void
  isDemo?: boolean
}

export function ResultItem({ 
  result, 
  viewMode = 'list', 
  onClick, 
  isDemo = false 
}: ResultItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [metrics, setMetrics] = useState<SourceDetailedMetrics | null>(null)
  const [metricsError, setMetricsError] = useState<string | null>(null)

  // Debug: Log the result object structure
  console.log('📋 ResultItem rendered with result:', {
    id: result.id,
    source: result.source,
    hasSource: !!result.source,
    sourceType: typeof result.source,
    isDemo,
    resultKeys: Object.keys(result)
  })

  // Debug: Monitor expansion state changes
  useEffect(() => {
    console.log('🔄 Expanded state changed:', {
      isExpanded,
      source: result.source,
      hasMetrics: !!metrics,
      isLoading: metricsLoading,
      isDemo
    })
  }, [isExpanded, result.source, metrics, metricsLoading, isDemo])

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const loadDetailedMetrics = async () => {
    console.log('🚀 loadDetailedMetrics function called!')
    console.log('Current state:', { metrics, metricsLoading, isDemo })
    
    if (metrics || metricsLoading || isDemo) {
      console.log('⚠️ Early return due to:', {
        hasMetrics: !!metrics,
        isLoading: metricsLoading,
        isDemo
      })
      return
    }
    
    console.log('🔍 Loading metrics for source:', result.source)
    setMetricsLoading(true)
    setMetricsError(null)
    
    try {
      console.log('📡 Making API call to:', `/v1/search/metrics/${encodeURIComponent(result.source)}`)
      const data = await apiClient.getSourceMetrics(result.source)
      console.log('✅ Metrics loaded successfully:', data)
      setMetrics(data)
      toast.success('Metrics loaded successfully!')
    } catch (error) {
      console.error('❌ Error loading metrics:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        response: error.response?.data,
        status: error.response?.status
      })
      setMetricsError(error instanceof Error ? error.message : 'Failed to load metrics')
      toast.error('Failed to load detailed metrics')
    } finally {
      setMetricsLoading(false)
    }
  }

  // Test function with mock data - for debugging
  const loadMockMetrics = () => {
    console.log('🧪 Loading mock metrics for testing...')
    const mockMetrics: SourceDetailedMetrics = {
      source: result.source,
      totalRecordsAffected: 1250000,
      passwordStats: {
        totalRecords: 1250000,
        withPassword: 875000,
        withoutPassword: 375000,
        strongPasswords: 125000,
        percentage: 70.0,
        strongPasswordPercentage: 14.3
      },
      domainDistribution: {
        "gmail.com": 450000,
        "yahoo.com": 280000,
        "outlook.com": 175000,
        "hotmail.com": 95000,
        "apple.com": 67000,
        "facebook.com": 48000
      },
      qualityAssessment: {
        score: 85.5,
        details: "Login: 95.2%, Password: 70.0%, URL: 88.1%, Domain: 92.3%",
        loginCompleteness: 95.2,
        passwordCompleteness: 70.0,
        urlCompleteness: 88.1,
        domainCompleteness: 92.3
      },
      breachDate: "2025-10-07T00:00:00",
      riskLevel: "HIGH",
      insights: {
        breachSizeCategory: "Large",
        highValueDomainsPercentage: 65.4,
        passwordStrengthGood: false,
        topDomain: "gmail.com",
        topDomainCount: 450000
      },
      calculatedAt: new Date().toISOString()
    }
    setMetrics(mockMetrics)
    toast.success('Mock metrics loaded!')
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const getDataTypes = () => {
    if (result.additionalInfo?.dataTypes) {
      return result.additionalInfo.dataTypes
    }
    return Object.keys(result.data).map(key => 
      key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    )
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="font-semibold text-lg">{result.source}</h3>
            <Badge variant={getSeverityColor(result.severity)}>
              {result.severity.toUpperCase()}
            </Badge>
            {result.verified ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">Verified</span>
              </div>
            ) : (
              <div className="flex items-center text-yellow-600">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span className="text-sm">Unverified</span>
              </div>
            )}
          </div>
          {result.breachDate && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              {formatDate(result.breachDate)}
            </div>
          )}
        </div>

        {/* Description */}
        {result.additionalInfo?.description && (
          <p className="text-sm text-muted-foreground">
            {result.additionalInfo.description}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span>Severity: {result.severity}</span>
          </div>
          {result.additionalInfo?.recordCount && (
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span>{result.additionalInfo.recordCount.toLocaleString()} records</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span>{getDataTypes().length} data types</span>
          </div>
        </div>

        {/* Data Types */}
        <div>
          <div className="flex flex-wrap gap-2">
            {getDataTypes().slice(0, isExpanded ? undefined : 4).map((type, i) => (
              <Badge key={i} variant="outline">
                {type}
              </Badge>
            ))}
            {!isExpanded && getDataTypes().length > 4 && (
              <Badge variant="outline">
                +{getDataTypes().length - 4} more
              </Badge>
            )}
          </div>
        </div>

        {/* Expanded Data */}
        {isExpanded && (
          <div className="pt-4 border-t border-border space-y-4">
            {/* Detailed Metrics Section */}
            <div className="bg-muted/50 rounded-lg p-4">
              {/* Debug Info - Remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
                  <div><strong>Debug Info:</strong></div>
                  <div>Source: {result.source}</div>
                  <div>Demo Mode: {isDemo ? 'Yes' : 'No'}</div>
                  <div>Metrics Loaded: {metrics ? 'Yes' : 'No'}</div>
                  <div>Loading: {metricsLoading ? 'Yes' : 'No'}</div>
                  <div>Error: {metricsError || 'None'}</div>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Detailed Metrics
                </h4>
                {/* Show loading indicator when fetching */}
                {metricsLoading && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Loading metrics...
                  </div>
                )}
                {/* Debug buttons for development */}
                {process.env.NODE_ENV === 'development' && !metricsLoading && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        loadDetailedMetrics()
                      }}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        loadMockMetrics()
                      }}
                      className="bg-blue-50 hover:bg-blue-100"
                    >
                      Test UI
                    </Button>
                  </div>
                )}
              </div>

              {metricsError && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  {metricsError}
                </div>
              )}

              {/* Loading State */}
              {metricsLoading && (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">Loading detailed breach analysis...</div>
                </div>
              )}

              {/* Metrics Display */}
              {metrics && !metricsLoading && (
                <div className="space-y-4">
                  {/* Risk Level & Date */}
                  <div className="flex items-center justify-between">
                    <div className={`px-2 py-1 rounded text-xs font-medium border ${getRiskLevelColor(metrics.riskLevel)}`}>
                      Risk: {metrics.riskLevel}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(metrics.breachDate)}
                    </div>
                  </div>

                  {/* Key Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-lg">{formatNumber(metrics.totalRecordsAffected)}</div>
                      <div className="text-muted-foreground">Total Records</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-lg">{metrics.passwordStats.percentage.toFixed(1)}%</div>
                      <div className="text-muted-foreground">With Passwords</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-lg">{metrics.qualityAssessment.score.toFixed(0)}/100</div>
                      <div className="text-muted-foreground">Data Quality</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-lg">{Object.keys(metrics.domainDistribution).length}</div>
                      <div className="text-muted-foreground">Unique Domains</div>
                    </div>
                  </div>

                  {/* Top Domains */}
                  {Object.keys(metrics.domainDistribution).length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground mb-2">TOP AFFECTED DOMAINS</h5>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(metrics.domainDistribution).slice(0, 6).map(([domain, count]) => (
                          <Badge key={domain} variant="outline" className="text-xs">
                            {domain} ({formatNumber(count)})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Insights */}
                  {metrics.insights && Object.keys(metrics.insights).length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground mb-2">INSIGHTS</h5>
                      <div className="space-y-1 text-xs">
                        {metrics.insights.breachSizeCategory && (
                          <div className="flex justify-between">
                            <span>Breach Size:</span>
                            <span className="font-medium">{metrics.insights.breachSizeCategory}</span>
                          </div>
                        )}
                        {typeof metrics.insights.highValueDomainsPercentage === 'number' && (
                          <div className="flex justify-between">
                            <span>High-Value Domains:</span>
                            <span className="font-medium">{metrics.insights.highValueDomainsPercentage.toFixed(1)}%</span>
                          </div>
                        )}
                        {typeof metrics.insights.passwordStrengthGood === 'boolean' && (
                          <div className="flex justify-between">
                            <span>Password Strength:</span>
                            <span className={`font-medium ${
                              metrics.insights.passwordStrengthGood ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {metrics.insights.passwordStrengthGood ? 'Good' : 'Poor'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!metrics && !metricsLoading && !metricsError && !isDemo && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  <div className="flex items-center justify-center mb-2">
                    <BarChart3 className="h-4 w-4 mr-1" />
                  </div>
                  Detailed metrics will load automatically when you expand this section
                </div>
              )}

              {isDemo && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  <Badge variant="outline" className="text-blue-600">
                    Demo Mode - Metrics not available
                  </Badge>
                </div>
              )}
            </div>

            {/* Sample Data Section */}
            <div>
              <h4 className="text-sm font-medium mb-2">Sample Data:</h4>
              <div className="space-y-2">
                {Object.entries(result.data).slice(0, 5).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-muted-foreground">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono">
                        {String(value).length > 30 ? String(value).substring(0, 30) + '...' : String(value)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(String(value))
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              console.log('🔘 Show More button clicked')
              e.stopPropagation()
              const newExpanded = !isExpanded
              console.log('📖 Current state:', {
                isExpanded,
                newExpanded,
                isDemo,
                hasMetrics: !!metrics,
                isLoading: metricsLoading,
                resultSource: result.source
              })
              
              setIsExpanded(newExpanded)
              
              // Auto-load metrics when expanding (unless demo mode)
              if (newExpanded && !isDemo && !metrics && !metricsLoading) {
                console.log('✅ Conditions met - calling loadDetailedMetrics()')
                loadDetailedMetrics()
              } else {
                console.log('❌ Conditions NOT met for auto-loading:', {
                  expanding: newExpanded,
                  notDemo: !isDemo,
                  noMetrics: !metrics,
                  notLoading: !metricsLoading
                })
              }
            }}
          >
            {isExpanded ? (
              <>
                Show Less
                <ChevronUp className="ml-2 h-3 w-3" />
              </>
            ) : (
              <>
                Show More
                <ChevronDown className="ml-2 h-3 w-3" />
              </>
            )}
          </Button>
          
          {isDemo && (
            <Badge variant="outline" className="text-blue-600">
              Demo Data
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
}
