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
      case 'PROFESSIONAL': return 'text-green-600'
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
              <div className={`p-3 rounded-lg border ${
                getPlanType() === 'FREE' ? 'bg-slate-500/10 border-slate-500/20' :
                getPlanType() === 'BASIC' ? 'bg-blue-500/10 border-blue-500/20' :
                getPlanType() === 'PROFESSIONAL' ? 'bg-green-500/10 border-green-500/20' :
                'bg-amber-500/10 border-amber-500/20'
              }`}>
                {
                  getPlanType() === 'FREE' ? <Shield className="h-6 w-6 text-slate-400" /> :
                  getPlanType() === 'BASIC' ? <Zap className="h-6 w-6 text-blue-400" /> :
                  getPlanType() === 'PROFESSIONAL' ? <BarChart3 className="h-6 w-6 text-green-400" /> :
                  <Crown className="h-6 w-6 text-amber-400" />
                }
              </div>
              
              {/* Upgrade Button (only show if not Enterprise) */}
              {getPlanType() !== 'ENTERPRISE' && (
                <Button 
                  asChild 
                  size="sm" 
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400/40"
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
            <div className="relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center space-x-2 bg-slate-700/30 border border-slate-600/30 rounded-full px-4 py-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <h3 className="text-lg font-semibold text-slate-200">
                    {getPlanType()} Plan Active
                  </h3>
                </div>
                <p className="text-slate-400 text-sm">
                  You're enjoying premium features and enhanced limits!
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-slate-700/20 border border-slate-600/30 hover:border-slate-500/50 transition-all">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-slate-700/30 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-slate-300" />
                  </div>
                  <p className="text-xs font-medium text-slate-300">Enhanced Security</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-slate-700/20 border border-slate-600/30 hover:border-slate-500/50 transition-all">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-slate-700/30 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-slate-300" />
                  </div>
                  <p className="text-xs font-medium text-slate-300">Email Alerts</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-slate-700/20 border border-slate-600/30 hover:border-slate-500/50 transition-all">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-slate-700/30 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-slate-300" />
                  </div>
                  <p className="text-xs font-medium text-slate-300">Advanced Analytics</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-slate-700/20 border border-slate-600/30 hover:border-slate-500/50 transition-all">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-slate-700/30 flex items-center justify-center">
                    <Download className="h-5 w-5 text-slate-300" />
                  </div>
                  <p className="text-xs font-medium text-slate-300">Export Features</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Usage Quota Card */}
        <div className="mb-8">
          <UsageQuotaDisplay />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today's Searches */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 hover:border-slate-600/50 transition-all">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-700/30 rounded-xl">
                <Search className="h-6 w-6 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Today's Searches</p>
                <p className="text-2xl font-bold text-slate-100">
                  {isLoadingToday ? (
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  ) : (
                    todayUsage?.totalSearches || 0
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Total Searches */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 hover:border-slate-600/50 transition-all">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-700/30 rounded-xl">
                <BarChart3 className="h-6 w-6 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Total Searches</p>
                <p className="text-2xl font-bold text-slate-100">
                  {isLoadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  ) : (
                    usageStats?.totalSearches || 5
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Exports */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 hover:border-slate-600/50 transition-all">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-700/30 rounded-xl">
                <Download className="h-6 w-6 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Total Exports</p>
                <p className="text-2xl font-bold text-slate-100">
                  {isLoadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  ) : (
                    usageStats?.totalExports || 0
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Active Days */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 hover:border-slate-600/50 transition-all">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-700/30 rounded-xl">
                <Calendar className="h-6 w-6 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Active Days</p>
                <p className="text-2xl font-bold text-slate-100">
                  {isLoadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  ) : (
                    usageStats?.activeDays || 1
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Search */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-8 hover:border-slate-600/50 transition-all">
            <div className="text-center">
              <div className="p-4 bg-slate-700/30 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Search className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-200">Start Searching</h3>
              <p className="text-sm text-slate-400 mb-6">
                Search through billions of breach records and threat intelligence data.
              </p>
              <Button asChild variant="security" className="w-full">
                <Link href="/search">
                  Launch Search
                </Link>
              </Button>
            </div>
          </div>

          {/* Monitoring */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-8 hover:border-slate-600/50 transition-all">
            <div className="text-center">
              <div className="p-4 bg-slate-700/30 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Shield className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-200">Set Up Monitoring</h3>
              <p className="text-sm text-slate-400 mb-6">
                Monitor your digital assets and get real-time alerts for new threats.
              </p>
              <Button asChild variant="intelligence" className="w-full">
                <Link href="/monitoring">
                  Manage Monitors
                </Link>
              </Button>
            </div>
          </div>

          {/* Expert Consultation */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-8 hover:border-slate-600/50 transition-all">
            <div className="text-center">
              <div className="p-4 bg-slate-700/30 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-200">Ask a Security Expert</h3>
              <p className="text-sm text-slate-400 mb-6">
                Get personalized cybersecurity advice from certified experts.
              </p>
              <AskExpertButton className="w-full" />
            </div>
          </div>
        </div>

        {/* Quick Access Links */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-6 text-foreground">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 hover:border-slate-600/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-700/30 rounded-lg">
                  <Bell className="h-5 w-5 text-slate-300" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-200">Alerts & Notifications</h3>
                  <p className="text-sm text-slate-400">Manage your alert settings</p>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-slate-300 hover:text-slate-200 hover:bg-slate-700/30">
                  <Link href="/alerts">View</Link>
                </Button>
              </div>
            </div>
            
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 hover:border-slate-600/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-700/30 rounded-lg">
                  <Shield className="h-5 w-5 text-slate-300" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-200">Monitoring Items</h3>
                  <p className="text-sm text-slate-400">Manage what you're monitoring</p>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-slate-300 hover:text-slate-200 hover:bg-slate-700/30">
                  <Link href="/monitoring">View</Link>
                </Button>
              </div>
            </div>
            
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 hover:border-slate-600/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-700/30 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-slate-300" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-200">Ask Expert</h3>
                  <p className="text-sm text-slate-400">Get cybersecurity advice</p>
                </div>
                <AskExpertButton variant="ghost" size="sm" className="h-8 px-3 text-sm text-slate-300 hover:text-slate-200 hover:bg-slate-700/30">
                  Chat
                </AskExpertButton>
              </div>
            </div>
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
