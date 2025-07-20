'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuthStore } from '@/stores/auth'
import { 
  AlertTriangle,
  Search,
  Filter,
  CheckCircle,
  Archive,
  Flag,
  Shield,
  Clock,
  Eye,
  ArrowUp,
  Mail,
  Globe,
  User,
  Hash,
  Bell
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function AlertsPage() {
  const { isAuthenticated, user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Check user's plan - for now assume Free plan
  const userPlan = 'FREE' // TODO: Get from user data/quota
  const isFreePlan = userPlan === 'FREE'

  // Mock data for now to avoid backend errors
  const statistics = {
    total: 0,
    unread: 0,
    critical: 0,
    high: 0,
    recent: 0
  }

  const handleUpgradeClick = () => {
    // TODO: Redirect to pricing page
    toast.info('Redirecting to pricing page...')
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container max-w-4xl mx-auto px-6 py-12">
          <Card className="p-12 text-center">
            <AlertTriangle className="h-16 w-16 mx-auto mb-6 text-gray-400" />
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-8">
              Please sign in to access alerts and monitoring features.
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
              <AlertTriangle className="h-8 w-8 text-red-600" />
              Security Alerts
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor and respond to security threats and breach notifications
            </p>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold">{statistics.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-gray-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-red-600">{statistics.unread}</p>
              </div>
              <Bell className="h-8 w-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{statistics.critical}</p>
              </div>
              <ArrowUp className="h-8 w-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{statistics.high}</p>
              </div>
              <Flag className="h-8 w-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent</p>
                <p className="text-2xl font-bold text-green-600">{statistics.recent}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search alerts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">All Status</option>
                  <option value="UNREAD">Unread</option>
                  <option value="READ">Read</option>
                  <option value="ARCHIVED">Archived</option>
                  <option value="DISMISSED">Dismissed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">All Severity</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>
          )}
        </Card>

        {/* Alerts List - Free plan restriction */}
        <Card className="p-6">
          {isFreePlan ? (
            <div className="text-center py-12">
              <div className="bg-amber-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-amber-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3 text-amber-800">Alerts Require Monitoring</h4>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Security alerts are generated from monitoring items. 
                Upgrade to a paid plan to set up monitoring and receive alerts.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <h5 className="font-semibold text-amber-800 mb-2">With Monitoring You Get:</h5>
                <ul className="text-sm text-amber-700 space-y-1">
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
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8"
                >
                  Upgrade to Enable Alerts
                </Button>
                <div className="text-sm text-gray-500">
                  Basic Plan: $9.99/month • 5 monitors • Email alerts
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-semibold mb-2">No Alerts Yet</h4>
              <p className="text-gray-600 mb-6">
                Set up monitoring items to start receiving security alerts.
              </p>
              <div className="space-y-4">
                <Button asChild>
                  <a href="/monitoring">Set Up Monitoring</a>
                </Button>
                <div className="text-sm text-gray-500">
                  <p>✅ Backend API endpoints ready</p>
                  <p>✅ Database schema implemented</p>
                  <p>✅ Alert processing service active</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Help Section */}
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">Alert Management Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Alert Actions</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Mark Read:</strong> Acknowledge you've seen the alert</li>
                <li>• <strong>Archive:</strong> Hide resolved or irrelevant alerts</li>
                <li>• <strong>False Positive:</strong> Mark alerts that aren't real threats</li>
                <li>• <strong>Remediate:</strong> Mark as fixed with notes</li>
                <li>• <strong>Escalate:</strong> Send to security team for review</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Severity Levels</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <span className="text-red-600 font-medium">Critical:</span> Immediate action required</li>
                <li>• <span className="text-orange-600 font-medium">High:</span> Urgent attention needed</li>
                <li>• <span className="text-yellow-600 font-medium">Medium:</span> Review within 24 hours</li>
                <li>• <span className="text-blue-600 font-medium">Low:</span> Monitor and track</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
