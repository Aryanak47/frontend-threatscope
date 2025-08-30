'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'
import { useUsageStore, initializeUsageData } from '@/stores/usage'
import UsageQuotaDisplay from '@/components/ui/usage-quota-display'
import { ConnectionStatus } from '@/components/ui/connection-status'
import AuthGuard from '@/components/auth-guard'
import { MainLayout } from '@/components/layout/main-layout'
import { useNotificationStore } from '@/stores/notifications'
import { AskExpertButton } from '@/components/consultation/ask-expert-button'
import AdminDashboardContent from '@/components/admin/admin-dashboard'
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
  Bell,
  MessageSquare
} from 'lucide-react'

function DashboardContent() {
  const { user, isAuthenticated, isAdmin } = useAuthStore()
  const { 
    todayUsage, 
    usageStats, 
    quota,
    isLoadingQuota,
    isLoadingStats,
    isLoadingToday
  } = useUsageStore()
  const { connect: connectNotifications } = useNotificationStore()

  // Check URL parameter to force user view
  const [forceUserView, setForceUserView] = useState(false)
  
  useEffect(() => {
    // Check if URL has admin=false parameter
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('admin') === 'false') {
      setForceUserView(true)
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [])

  useEffect(() => {
    console.log('🔍 Dashboard: Component mounted, isAuthenticated:', isAuthenticated)
    
    if (isAuthenticated) {
      console.log('🔍 Dashboard: Authenticated, initializing usage data')
      // FIXED: Use manual initialization instead of automatic refresh
      initializeUsageData()
      
      // Ensure WebSocket connection is established
      console.log('🔍 Dashboard: Triggering WebSocket connection...')
      try {
        connectNotifications()
        console.log('✅ Dashboard: WebSocket connection triggered')
      } catch (error) {
        console.error('❌ Dashboard: Error triggering WebSocket connection:', error)
      }
    }
  }, [isAuthenticated]) // FIXED: Removed function dependencies

  // 🛡️ ADMIN DASHBOARD: Show admin dashboard for admin users (unless forced to user view)
  if (isAuthenticated && isAdmin() && !forceUserView) {
    console.log('🛡️ Rendering Admin Dashboard for admin user')
    return (
      <div>
        <AdminDashboardContent />
      </div>
    )
  }

  const getPlanType = () => {
    // Use actual subscription data from user object
    if (user?.subscription?.planType) {
      return user.subscription.planType
    }
    // Fallback to quota-based detection if subscription data is not available
    if (!quota) return 'FREE'
    if (quota.totalSearches <= 25) return 'FREE'
    if (quota.totalSearches <= 100) return 'BASIC'
    if (quota.totalSearches <= 1200) return 'PROFESSIONAL'
    return 'ENTERPRISE'
  }

  const getPlanColor = () => {
    const plan = getPlanType()
    switch (plan) {
      case 'FREE': return 'text-gray-600'
      case 'BASIC': return 'text-blue-600'
      case 'PROFESSIONAL': return 'text-purple-600'
      case 'ENTERPRISE': return 'text-amber-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">
                  Welcome back, {user?.firstName}!
                </h1>
                <ConnectionStatus showText />
              </div>
              <p className="text-lg text-muted-foreground">
                Here's an overview of your ThreatScope usage and account status.
              </p>
            </div>
            
            {/* Current Plan Badge */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className={`text-lg font-semibold ${getPlanColor()}`}>
                  {getPlanType()}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                getPlanType() === 'FREE' ? 'bg-gray-100 dark:bg-gray-800' :
                getPlanType() === 'BASIC' ? 'bg-blue-100 dark:bg-blue-900' :
                getPlanType() === 'PROFESSIONAL' ? 'bg-purple-100 dark:bg-purple-900' :
                'bg-amber-100 dark:bg-amber-900'
              }`}>
                {
                  getPlanType() === 'FREE' ? <Shield className="h-6 w-6 text-gray-600" /> :
                  getPlanType() === 'BASIC' ? <Zap className="h-6 w-6 text-blue-600" /> :
                  getPlanType() === 'PROFESSIONAL' ? <BarChart3 className="h-6 w-6 text-purple-600" /> :
                  <Crown className="h-6 w-6 text-amber-600" />
                }
              </div>
              
              {/* Upgrade Button (only show if not Enterprise) */}
              {getPlanType() !== 'ENTERPRISE' && (
                <Button 
                  asChild 
                  size="sm" 
                  variant="outline"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <Link href="/pricing">
                    <Crown className="h-4 w-4 mr-1" />
                    Upgrade
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Plan Benefits */}
        {getPlanType() !== 'FREE' && (
          <div className="mb-8">
            <Card className="p-6 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                  🎉 {getPlanType()} Plan Active
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  You're enjoying premium features and enhanced limits!
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="text-green-700 dark:text-green-300">
                  <Shield className="h-5 w-5 mx-auto mb-1" />
                  <p className="text-xs font-medium">Enhanced Security</p>
                </div>
                <div className="text-green-700 dark:text-green-300">
                  <Bell className="h-5 w-5 mx-auto mb-1" />
                  <p className="text-xs font-medium">Email Alerts</p>
                </div>
                <div className="text-green-700 dark:text-green-300">
                  <BarChart3 className="h-5 w-5 mx-auto mb-1" />
                  <p className="text-xs font-medium">Advanced Analytics</p>
                </div>
                <div className="text-green-700 dark:text-green-300">
                  <Download className="h-5 w-5 mx-auto mb-1" />
                  <p className="text-xs font-medium">Export Features</p>
                </div>
              </div>
            </Card>
          </div>
        )}
        
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

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          {/* Expert Consultation */}
          <Card className="p-6">
            <div className="text-center">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ask a Security Expert</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get personalized cybersecurity advice from certified experts.
              </p>
              <AskExpertButton className="w-full" />
            </div>
          </Card>
        </div>

        {/* Quick Access Links */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Alerts & Notifications</h3>
                  <p className="text-sm text-muted-foreground">Manage your alert settings</p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/alerts">View</Link>
                </Button>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <Shield className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Monitoring Items</h3>
                  <p className="text-sm text-muted-foreground">Manage what you're monitoring</p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/monitoring">View</Link>
                </Button>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Ask Expert</h3>
                  <p className="text-sm text-muted-foreground">Get cybersecurity advice</p>
                </div>
                <AskExpertButton variant="ghost" size="sm" className="h-8 px-3 text-sm">
                  Chat
                </AskExpertButton>
              </div>
            </Card>
          </div>
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
