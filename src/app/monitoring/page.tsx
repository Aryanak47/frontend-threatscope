'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuthStore } from '@/stores/auth'
import { useUsageStore } from '@/stores/usage'
import { useMonitoringStore } from '@/stores/monitoring'
import { useSubscriptionStore } from '@/stores/subscription'
import { apiClient } from '@/lib/api'
import { CreateMonitoringModal } from '@/components/monitoring/create-monitoring-modal'
import { 
  Shield,
  Plus,
  Search,
  Mail,
  Globe,
  User,
  Hash,
  AlertTriangle,
  Clock,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Bell,
  TrendingUp,
  Activity,
  Loader2
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { CreateMonitoringItemRequest, DuplicateError } from '@/types'

export default function MonitoringPage() {
  const { isAuthenticated, user, refreshUser } = useAuthStore()
  const { quota, fetchQuota } = useUsageStore()
  const { 
    items, 
    dashboard, 
    isLoadingItems, 
    isLoadingDashboard,
    fetchItems, 
    fetchDashboard, 
    createItem 
  } = useMonitoringStore()
  const {
    details: subscriptionDetails,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
    fetchDetails: fetchSubscriptionDetails,
    canCreateMonitor,
    isFreePlan,
    getPlanDisplayName,
    getRemainingMonitors
  } = useSubscriptionStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Refresh user data to get latest subscription info
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser()
    }
  }, [isAuthenticated, refreshUser])

  // Fetch subscription details and monitoring data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔄 Fetching subscription details and monitoring data...')
      // Get current monitoring items count for accurate permissions
      const currentMonitoringItems = items.length
      // Note: We'd need to get today's searches from usage store
      const todaySearches = 0 // Could be fetched from usage store
      
      fetchSubscriptionDetails(currentMonitoringItems, todaySearches)
      
      // Only fetch monitoring data if user has permission (not free plan)
      if (subscriptionDetails && !subscriptionDetails.subscription.planType.includes('FREE')) {
        fetchItems()
        fetchDashboard()
      }
    }
  }, [isAuthenticated, fetchSubscriptionDetails, items.length])

  // Fetch monitoring data when subscription details are loaded and user has access
  useEffect(() => {
    if (isAuthenticated && subscriptionDetails && !isFreePlan()) {
      console.log('🔄 User has access, fetching monitoring data...')
      fetchItems()
      fetchDashboard()
    }
  }, [isAuthenticated, subscriptionDetails, fetchItems, fetchDashboard])

  const handleCreateMonitor = async (formData: CreateMonitoringItemRequest) => {
    try {
      console.log('🔄 Creating monitor:', formData)
      
      // Use the monitoring store to create the item
      const createdMonitor = await createItem(formData)
      
      if (createdMonitor) {
        console.log('✅ Monitor created successfully:', createdMonitor)
        toast.success(`Monitor "${formData.monitorName}" created successfully!`)
        setShowCreateModal(false)
      } else {
        throw new Error('Failed to create monitor')
      }
      
    } catch (error: any) {
      console.error('❌ Failed to create monitor:', error)
      
      // Handle duplicate error specifically
      if (error instanceof DuplicateError) {
        // The duplicate dialog will be shown automatically by the modal
        console.log('🔄 Duplicate monitor detected, showing conflict dialog')
        return // Don't show toast for duplicates, let the dialog handle it
      }
      
      // Handle other errors with better error messages
      let errorMessage = 'Failed to create monitor'
      
      if (error.response?.status === 403) {
        errorMessage = 'You have reached your monitoring limit. Please upgrade your plan.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.join(', ')
      } else if (error.message) {
        errorMessage = error.message
      }
      
      console.error('❌ Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      
      toast.error(errorMessage)
    }
  }

  const handleUpgradeClick = () => {
    // Redirect to pricing page
    window.location.href = '/pricing'
  }

  // Use dashboard data from store or fallback to defaults
  const dashboardData = dashboard || {
    totalItems: 0,
    activeItems: 0,
    totalAlerts: 0,
    unreadAlerts: 0
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container max-w-4xl mx-auto px-6 py-12">
          <Card className="p-12 text-center">
            <Shield className="h-16 w-16 mx-auto mb-6 text-gray-400" />
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-8">
              Please sign in to access monitoring and alert features.
            </p>
            <Button asChild>
              <a href="/login">Sign In</a>
            </Button>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              Monitoring & Alerts
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor your digital assets and get real-time alerts for new threats
            </p>
          </div>
          <Button 
            onClick={() => !canCreateMonitor() ? handleUpgradeClick() : setShowCreateModal(true)}
            className={!canCreateMonitor() ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"}
            disabled={isLoadingSubscription}
          >
            <Plus className="h-4 w-4 mr-2" />
            {!canCreateMonitor() ? 'Upgrade to Add Monitors' : `Add Monitor (${getRemainingMonitors()} remaining)`}
          </Button>
        </div>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Monitors</p>
                <p className="text-2xl font-bold text-blue-600">{dashboardData.activeItems}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {dashboardData.totalItems} total monitors
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread Alerts</p>
                <p className="text-2xl font-bold text-red-600">{dashboardData.unreadAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {dashboardData.totalAlerts} total alerts
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-green-600">{isLoadingDashboard ? '-' : '0'}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">New alerts</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-2xl font-bold text-purple-600">&lt;1m</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Average alert time</p>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search monitoring items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </Card>

        {/* Monitoring Items List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Your Monitors</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {items.length} monitor{items.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Plan-based Content */}
          {subscriptionError ? (
            /* Subscription error - show fallback */
            <div className="text-center py-12">
              <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3 text-red-800">Connection Error</h4>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {subscriptionError}
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => fetchSubscriptionDetails(items.length, 0)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  Retry Connection
                </Button>
                <div className="text-sm text-gray-500">
                  Make sure your backend is running on http://localhost:8080
                </div>
              </div>
            </div>
          ) : isLoadingSubscription ? (
            /* Loading subscription details */
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading subscription details...</p>
            </div>
          ) : !canCreateMonitor() ? (
            /* Free Plan or No Monitors Allowed */
            <div className="text-center py-12">
              <div className="bg-amber-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Shield className="h-10 w-10 text-amber-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3 text-amber-800">Monitoring Requires Upgrade</h4>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Monitor your digital assets and get real-time alerts for security threats. 
                Upgrade to a paid plan to unlock monitoring features.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <h5 className="font-semibold text-amber-800 mb-2">Current Plan ({getPlanDisplayName()}):</h5>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>✅ {subscriptionDetails?.planLimits?.dailySearches || 25} searches per day</li>
                  <li>✅ Basic threat intelligence access</li>
                  <li>❌ {subscriptionDetails?.planLimits?.maxMonitoringItems || 0} monitoring items</li>
                  <li>{subscriptionDetails?.planLimits?.hasEmailAlerts ? '✅' : '❌'} Email alerts</li>
                  <li>{subscriptionDetails?.planLimits?.hasRealTimeMonitoring ? '✅' : '❌'} Real-time monitoring</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleUpgradeClick}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8"
                >
                  Upgrade to Basic Plan
                </Button>
                <div className="text-sm text-gray-500">
                  Starting at $9.99/month • 25 monitors • Email alerts
                </div>
              </div>
            </div>
          ) : isLoadingItems ? (
            /* Loading monitoring items */
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading your monitors...</p>
            </div>
          ) : items.length === 0 ? (
            /* No monitoring items yet */
            <div className="text-center py-12">
              <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Shield className="h-10 w-10 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3 text-green-800">
                Welcome to {getPlanDisplayName()} Monitoring!
              </h4>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You have access to monitoring features. Create your first monitor to start tracking threats.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <h5 className="font-semibold text-green-800 mb-2">Your {getPlanDisplayName()} Includes:</h5>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✅ {subscriptionDetails?.planLimits?.dailySearches || 'Unlimited'} searches per day</li>
                  <li>✅ {subscriptionDetails?.planLimits?.maxMonitoringItems || 0} monitoring items</li>
                  <li>{subscriptionDetails?.planLimits?.hasRealTimeMonitoring ? '✅' : '❌'} Real-time monitoring</li>
                  <li>{subscriptionDetails?.planLimits?.hasEmailAlerts ? '✅' : '❌'} Email alerts</li>
                  <li>{subscriptionDetails?.planLimits?.hasInAppAlerts ? '✅' : '❌'} In-app alerts</li>
                  <li>{subscriptionDetails?.planLimits?.hasApiAccess ? '✅' : '❌'} API access</li>
                </ul>
              </div>
              
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Monitor
              </Button>
            </div>
          ) : (
            /* Show monitoring items list */
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {item.monitorType === 'EMAIL' && <Mail className="h-5 w-5 text-blue-600" />}
                          {item.monitorType === 'DOMAIN' && <Globe className="h-5 w-5 text-green-600" />}
                          {item.monitorType === 'USERNAME' && <User className="h-5 w-5 text-purple-600" />}
                          {item.monitorType === 'KEYWORD' && <Hash className="h-5 w-5 text-orange-600" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{item.monitorName}</h4>
                          <p className="text-sm text-gray-600">{item.targetValue}</p>
                          {item.description && (
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {item.frequency}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.alertCount} alerts
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {item.isActive ? (
                          <div className="flex items-center text-green-600">
                            <div className="h-2 w-2 bg-green-600 rounded-full mr-1"></div>
                            <span className="text-xs">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <div className="h-2 w-2 bg-gray-400 rounded-full mr-1"></div>
                            <span className="text-xs">Inactive</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                      {item.lastChecked && (
                        <span>Last checked: {new Date(item.lastChecked).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        {item.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Getting Started Guide */}
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">Getting Started with Monitoring</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">1. Add Monitors</h4>
              <p className="text-sm text-gray-600">
                Set up monitoring for emails, domains, usernames, or IP addresses you want to track.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                <Bell className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">2. Configure Alerts</h4>
              <p className="text-sm text-gray-600">
                Choose how you want to be notified: email, in-app notifications, or webhooks.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">3. Track & Respond</h4>
              <p className="text-sm text-gray-600">
                Monitor your alerts, investigate threats, and take action to protect your assets.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Create/Edit Modal - Only show for users who can create monitors */}
      {canCreateMonitor() && (
        <CreateMonitoringModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateMonitor}
          userPlan={getPlanDisplayName()}
        />
      )}
    </MainLayout>
  )
}
