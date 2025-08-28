import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUsageStore, UsageQuota } from '@/stores/usage'
import { useAuthStore } from '@/stores/auth'
import { 
  Search, 
  Download, 
  Zap, 
  AlertTriangle, 
  Crown,
  RefreshCw,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface UsageQuotaDisplayProps {
  className?: string
  compact?: boolean
}

export function UsageQuotaDisplay({ className = '', compact = false }: UsageQuotaDisplayProps) {
  const { isAuthenticated, user } = useAuthStore()
  const { 
    quota, 
    isLoadingQuota, 
    quotaError,
    fetchQuota
  } = useUsageStore()

  // Don't show for unauthenticated users
  if (!isAuthenticated) {
    return (
      <Card className={`p-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Anonymous Usage</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Limited to 5 searches per day
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/register">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade
            </Link>
          </Button>
        </div>
      </Card>
    )
  }

  if (isLoadingQuota) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading usage data...</span>
        </div>
      </Card>
    )
  }

  if (quotaError) {
    return (
      <Card className={`p-4 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200">Error Loading Usage</h3>
              <p className="text-sm text-red-700 dark:text-red-300">{quotaError}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchQuota(isAuthenticated)}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    )
  }

  if (!quota) {
    return null
  }

  const searchPercentage = quota.totalSearches > 0 
    ? Math.round((quota.remainingSearches / quota.totalSearches) * 100)
    : 0

  const isLowQuota = searchPercentage < 20
  const isNoQuota = quota.remainingSearches === 0

  const getQuotaColor = () => {
    if (isNoQuota) return 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800'
    if (isLowQuota) return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800'
    return 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800'
  }

  const getQuotaIcon = () => {
    if (isNoQuota) return <AlertTriangle className="h-5 w-5 text-red-600" />
    if (isLowQuota) return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    return <Search className="h-5 w-5 text-green-600" />
  }

  const getQuotaMessage = () => {
    if (isNoQuota) return "Daily search limit reached"
    if (isLowQuota) return `${quota.remainingSearches} searches remaining`
    return `${quota.remainingSearches} searches available`
  }

  const getPlanType = () => {
    // Use real subscription data if available
    if (user?.subscription) {
      const planType = user.subscription.planType
      switch (planType) {
        case 'FREE': return 'Free'
        case 'BASIC': return 'Basic'
        case 'PROFESSIONAL': return 'Professional'
        case 'ENTERPRISE': return 'Enterprise'
        default: return 'Free'
      }
    }
    
    // Fallback to quota-based inference
    if (quota.totalSearches <= 25) return 'Free'
    if (quota.totalSearches <= 100) return 'Basic'
    if (quota.totalSearches <= 1200) return 'Professional'
    return 'Enterprise'
  }

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 text-sm ${className}`}>
        {getQuotaIcon()}
        <span className={`${
          isNoQuota ? 'text-red-600' : 
          isLowQuota ? 'text-yellow-600' : 
          'text-green-600'
        }`}>
          {quota.remainingSearches}/{quota.totalSearches}
        </span>
      </div>
    )
  }

  return (
    <Card className={`p-4 ${getQuotaColor()} ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getQuotaIcon()}
            <div>
              <h3 className={`font-semibold ${
                isNoQuota ? 'text-red-800 dark:text-red-200' :
                isLowQuota ? 'text-yellow-800 dark:text-yellow-200' :
                'text-green-800 dark:text-green-200'
              }`}>
                {getQuotaMessage()}
              </h3>
              <p className={`text-sm ${
                isNoQuota ? 'text-red-700 dark:text-red-300' :
                isLowQuota ? 'text-yellow-700 dark:text-yellow-300' :
                'text-green-700 dark:text-green-300'
              }`}>
                {getPlanType()} Plan
              </p>
            </div>
          </div>
          
          {isNoQuota && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/pricing">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade
              </Link>
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Searches</span>
            <span>{quota.remainingSearches}/{quota.totalSearches}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isNoQuota ? 'bg-red-500' :
                isLowQuota ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${searchPercentage}%` }}
            />
          </div>
        </div>

        {/* Additional Quotas */}
        {(quota.totalExports > 0 || quota.totalApiCalls > 0) && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {quota.totalExports > 0 && (
              <div className="flex items-center space-x-2">
                <Download className="h-4 w-4 text-muted-foreground" />
                <span>Exports: {quota.remainingExports}/{quota.totalExports}</span>
              </div>
            )}
            {quota.totalApiCalls > 0 && (
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span>API: {quota.remainingApiCalls}/{quota.totalApiCalls}</span>
              </div>
            )}
          </div>
        )}

        {/* Upgrade CTA for low/no quota */}
        {(isLowQuota || isNoQuota) && (
          <div className="pt-2 border-t border-current/20">
            <p className="text-xs text-muted-foreground mb-2">
              Need more searches? Upgrade your plan for higher limits.
            </p>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/pricing">
                View Plans & Pricing
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

export default UsageQuotaDisplay
