'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuthStore } from '@/stores/auth'
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
  Activity
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function MonitoringPage() {
  const { isAuthenticated, user } = useAuthStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Check user's plan - for now assume Free plan
  const userPlan = 'FREE' // TODO: Get from user data/quota
  const isFreePlan = userPlan === 'FREE'

  const handleCreateMonitor = (formData: any) => {
    console.log('Creating monitor:', formData)
    // TODO: Call API to create monitoring item
    // await apiClient.createMonitoringItem(formData)
    toast.success(`Monitor "${formData.monitorName}" created successfully!`)
  }

  const handleUpgradeClick = () => {
    // Redirect to pricing page
    window.location.href = '/pricing'
  }
  const dashboard = {
    totalItems: 0,
    activeItems: 0,
    totalAlerts: 0,
    unreadAlerts: 0
  }

  const items = [] // Empty for now

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
            onClick={() => isFreePlan ? handleUpgradeClick() : setShowCreateModal(true)}
            className={isFreePlan ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isFreePlan ? 'Upgrade to Add Monitors' : 'Add Monitor'}
          </Button>
        </div>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Monitors</p>
                <p className="text-2xl font-bold text-blue-600">{dashboard.activeItems}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {dashboard.totalItems} total monitors
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread Alerts</p>
                <p className="text-2xl font-bold text-red-600">{dashboard.unreadAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {dashboard.totalAlerts} total alerts
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-green-600">0</p>
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

          {/* Empty state */}
          {isFreePlan ? (
            /* Free Plan Upgrade Prompt */
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
                <h5 className="font-semibold text-amber-800 mb-2">Free Plan Includes:</h5>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>✅ 20 searches per day</li>
                  <li>✅ Basic threat intelligence access</li>
                  <li>❌ No monitoring items</li>
                  <li>❌ No real-time alerts</li>
                  <li>❌ No email notifications</li>
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
                  Starting at $9.99/month • 5 monitors • Email alerts
                </div>
              </div>
            </div>
          ) : (
            /* Paid Plan Empty State */
            <div className="text-center py-12">
              <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-semibold mb-2">No Monitors Yet</h4>
              <p className="text-gray-600 mb-6">
                Create your first monitoring item to start tracking threats.
              </p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Monitor
              </Button>
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

      {/* Create/Edit Modal - Only show for paid plans */}
      {!isFreePlan && (
        <CreateMonitoringModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateMonitor}
        />
      )}
    </MainLayout>
  )
}
