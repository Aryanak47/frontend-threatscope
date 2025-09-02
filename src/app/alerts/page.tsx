'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscription'
import useAlertStore from '@/stores/alerts'
import { AlertCard } from '@/components/alerts/alert-card'
import { 
  AlertTriangle,
  Search,
  Filter,
  Shield,
  Clock,
  ArrowUp,
  Flag,
  Bell
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function AlertsPage() {
  const { isAuthenticated, user, refreshUser } = useAuthStore()
  const {
    details: subscriptionDetails,
    isLoading: isLoadingSubscription,
    fetchDetails: fetchSubscriptionDetails,
    canCreateMonitor,
    isFreePlan,
    getPlanDisplayName
  } = useSubscriptionStore()
  const { 
    alerts, 
    alertsLoading, 
    alertsError, 
    unreadCount, 
    fetchAlerts, 
    fetchUnreadCount,
    markAsRead,
    setupWebSocketListeners
  } = useAlertStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Calculate statistics from actual alerts
  const statistics = {
    total: alerts.length,
    unread: unreadCount,
    critical: alerts.filter(alert => alert.severity === 'CRITICAL').length,
    high: alerts.filter(alert => alert.severity === 'HIGH').length,
    recent: alerts.filter(alert => {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return new Date(alert.createdAt) > dayAgo
    }).length
  }

  // Refresh user data to get latest subscription info
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser()
    }
  }, [isAuthenticated, refreshUser])

  // Fetch subscription details when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔄 Fetching subscription details for alerts page...')
      fetchSubscriptionDetails(0, 0) // No current usage needed for alerts
    }
  }, [isAuthenticated, fetchSubscriptionDetails])

  // Fetch alerts when subscription details are loaded and user has access
  useEffect(() => {
    if (isAuthenticated && subscriptionDetails && !isFreePlan()) {
      console.log('🔄 User has alert access, fetching alerts...')
      fetchAlerts()
      fetchUnreadCount()
      // Set up WebSocket listeners for real-time alert updates
      setupWebSocketListeners()
    }
  }, [isAuthenticated, subscriptionDetails, fetchAlerts, fetchUnreadCount, setupWebSocketListeners])

  const handleUpgradeClick = () => {
    // Redirect to pricing page
    window.location.href = '/pricing'
  }
  
  const handleMarkRead = async (alertId: string) => {
    try {
      await markAsRead(parseInt(alertId))
      toast.success('Alert marked as read')
    } catch (error) {
      toast.error('Failed to mark alert as read')
      console.error('Error marking alert as read:', error)
    }
  }
  
  const handleViewDetails = (alertId: string) => {
    // TODO: Implement view details functionality
    toast.info('Alert details view coming soon')
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container max-w-4xl mx-auto px-6 py-12">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-12 text-center">
            <AlertTriangle className="h-16 w-16 mx-auto mb-6 text-slate-400" />
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-slate-400 mb-8">
              Please sign in to access alerts and monitoring features.
            </p>
            <Button asChild variant="security">
              <a href="/login">Sign In</a>
            </Button>
          </div>
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
              <AlertTriangle className="h-8 w-8 text-red-600" />
              Security Alerts
            </h1>
            <p className="text-slate-400 mt-2">
              Monitor and respond to security threats and breach notifications
            </p>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 hover:border-slate-600/50 transition-all">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-700/30 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Total Alerts</p>
                <p className="text-2xl font-bold text-slate-100">{statistics.total}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 hover:border-slate-600/50 transition-all">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-700/30 rounded-xl">
                <Bell className="h-6 w-6 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Unread</p>
                <p className="text-2xl font-bold text-slate-100">{statistics.unread}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 hover:border-slate-600/50 transition-all">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-700/30 rounded-xl">
                <ArrowUp className="h-6 w-6 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Critical</p>
                <p className="text-2xl font-bold text-slate-100">{statistics.critical}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 hover:border-slate-600/50 transition-all">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-700/30 rounded-xl">
                <Flag className="h-6 w-6 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">High Priority</p>
                <p className="text-2xl font-bold text-slate-100">{statistics.high}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 hover:border-slate-600/50 transition-all">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-700/30 rounded-xl">
                <Clock className="h-6 w-6 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Recent</p>
                <p className="text-2xl font-bold text-slate-100">{statistics.recent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search alerts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700/30 border border-slate-600/50 text-slate-200 placeholder:text-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200"
                  />
                </div>
              </div>
              
              <Button 
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="flex items-center space-x-4 pt-4 border-t border-slate-600/50">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <select className="bg-slate-700/30 border border-slate-600/50 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400">
                  <option value="">All Status</option>
                  <option value="UNREAD">Unread</option>
                  <option value="READ">Read</option>
                  <option value="ARCHIVED">Archived</option>
                  <option value="DISMISSED">Dismissed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Severity</label>
                <select className="bg-slate-700/30 border border-slate-600/50 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400">
                  <option value="">All Severity</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Alerts List */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
          {isLoadingSubscription ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-400">Loading subscription details...</p>
            </div>
          ) : isFreePlan() ? (
            <div className="text-center py-12">
              <div className="bg-slate-800/50 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-amber-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3 text-amber-800">Alerts Require Monitoring</h4>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Security alerts are generated from monitoring items. 
                Upgrade to a paid plan to set up monitoring and receive alerts.
              </p>
              
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <h5 className="font-semibold text-slate-200 mb-2">With Monitoring You Get:</h5>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>✅ Real-time threat monitoring</li>
                  <li>✅ Email & in-app alerts</li>
                  <li>✅ Multiple monitoring types</li>
                  <li>✅ Alert management tools</li>
                  <li>✅ Security incident tracking</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleUpgradeClick}
                  variant="outline"
                  className="px-8 border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                >
                  Upgrade to Enable Alerts
                </Button>
                <div className="text-sm text-slate-400">
                  Basic Plan: $9.99/month • 5 monitors • Email alerts
                </div>
              </div>
            </div>
          ) : alertsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-slate-400">Loading alerts...</p>
            </div>
          ) : alertsError ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-400" />
              <h4 className="text-lg font-semibold mb-2 text-red-600">Error Loading Alerts</h4>
              <p className="text-slate-400 mb-4">{alertsError}</p>
              <Button onClick={() => fetchAlerts()} variant="security">Try Again</Button>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 mx-auto mb-4 text-green-400" />
              <h4 className="text-lg font-semibold mb-2">No Security Alerts</h4>
              <p className="text-slate-400 mb-6">
                Great news! No security alerts have been detected for your monitoring items.
              </p>
              <div className="space-y-4">
                <Button asChild variant="security">
                  <a href="/monitoring">View Monitoring Items</a>
                </Button>
                <div className="text-sm text-slate-400">
                  <p>✅ {statistics.total === 0 ? 'No alerts found' : `${statistics.total} total alerts`}</p>
                  <p>✅ Backend monitoring active</p>
                  <p>✅ Real-time breach detection enabled</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onMarkRead={handleMarkRead}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">Alert Management Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Alert Actions</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• <strong>Mark Read:</strong> Acknowledge you've seen the alert</li>
                <li>• <strong>Archive:</strong> Hide resolved or irrelevant alerts</li>
                <li>• <strong>False Positive:</strong> Mark alerts that aren't real threats</li>
                <li>• <strong>Remediate:</strong> Mark as fixed with notes</li>
                <li>• <strong>Escalate:</strong> Send to security team for review</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Severity Levels</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• <span className="text-red-600 font-medium">Critical:</span> Immediate action required</li>
                <li>• <span className="text-orange-600 font-medium">High:</span> Urgent attention needed</li>
                <li>• <span className="text-yellow-600 font-medium">Medium:</span> Review within 24 hours</li>
                <li>• <span className="text-blue-600 font-medium">Low:</span> Monitor and track</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
