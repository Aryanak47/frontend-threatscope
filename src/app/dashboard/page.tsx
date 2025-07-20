'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'
import { useUsageStore } from '@/stores/usage'
import UsageQuotaDisplay from '@/components/ui/usage-quota-display'
import AuthGuard from '@/components/auth-guard'
import { MainLayout } from '@/components/layout/main-layout'
import { 
  Shield, 
  BarChart3,
  Calendar,
  Download,
  Search,
  Zap,
  Crown,
  Loader2,
  AlertTriangle,
  Bell
} from 'lucide-react'

function DashboardContent() {
  const { user, isAuthenticated } = useAuthStore()
  const { 
    todayUsage, 
    usageStats, 
    quota,
    isLoadingQuota,
    isLoadingStats,
    isLoadingToday,
    refreshAllUsageData 
  } = useUsageStore()

  useEffect(() => {
    console.log('🔍 Dashboard: Component mounted, isAuthenticated:', isAuthenticated)
    
    if (isAuthenticated) {
      console.log('🔍 Dashboard: Authenticated, fetching usage data')
      // Fetch usage data when component mounts
      refreshAllUsageData()
    }
  }, [isAuthenticated, refreshAllUsageData])

  const getPlanType = () => {
    if (!quota) return 'Free'
    if (quota.totalSearches <= 25) return 'Free'
    if (quota.totalSearches <= 100) return 'Basic'
    if (quota.totalSearches <= 1200) return 'Professional'
    return 'Enterprise'
  }

  const getPlanColor = () => {
    const plan = getPlanType()
    switch (plan) {
      case 'Free': return 'text-gray-600'
      case 'Basic': return 'text-blue-600'
      case 'Professional': return 'text-purple-600'
      case 'Enterprise': return 'text-amber-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Here's an overview of your ThreatScope usage and account status.
          </p>
        </div>

        {/* Usage Quota Card */}
        <div className="mb-8">
          <UsageQuotaDisplay />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today's Searches */}
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <Search className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Searches</p>
                <p className="text-2xl font-bold">
                  {isLoadingToday ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    todayUsage?.totalSearches || 0
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Total Searches */}
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Searches</p>
                <p className="text-2xl font-bold">
                  {isLoadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    usageStats?.totalSearches || 5
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Exports */}
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Exports</p>
                <p className="text-2xl font-bold">
                  {isLoadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    usageStats?.totalExports || 0
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Active Days */}
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Days</p>
                <p className="text-2xl font-bold">
                  {isLoadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    usageStats?.activeDays || 1
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Search */}
          <Card className="p-6">
            <div className="text-center">
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start Searching</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Search through billions of breach records and threat intelligence data.
              </p>
              <Button asChild className="w-full">
                <Link href="/search">
                  Launch Search
                </Link>
              </Button>
            </div>
          </Card>

          {/* Monitoring */}
          <Card className="p-6">
            <div className="text-center">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Set Up Monitoring</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Monitor your digital assets and get real-time alerts for new threats.
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/monitoring">
                  Manage Monitors
                </Link>
              </Button>
            </div>
          </Card>

          {/* Alerts */}
          <Card className="p-6">
            <div className="text-center">
              <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Security Alerts</h3>
              <p className="text-sm text-muted-foreground mb-4">
                View and manage security alerts from your monitoring items.
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/alerts">
                  View Alerts
                </Link>
              </Button>
            </div>
          </Card>

          {/* Upgrade Plan */}
          {getPlanType() === 'Free' && (
            <Card className="p-6 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
              <div className="text-center">
                <div className="p-4 bg-amber-100 dark:bg-amber-900 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Crown className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-200">
                  Upgrade Your Plan
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                  Get more searches, exports, and premium features with a paid plan.
                </p>
                <Button variant="outline" asChild className="w-full border-amber-300">
                  <Link href="/pricing">
                    View Plans
                  </Link>
                </Button>
              </div>
            </Card>
          )}

          {/* API Access */}
          <Card className="p-6">
            <div className="text-center">
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">API Access</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Integrate ThreatScope into your applications with our powerful API.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/api-docs">
                  View API Docs
                </Link>
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Activity tracking coming soon. We'll show your recent searches, exports, and account changes here.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
