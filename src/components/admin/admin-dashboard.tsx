'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth'
import { 
  Shield, 
  Users,
  MessageSquare,
  Database,
  Activity,
  Settings,
  BarChart3,
  AlertTriangle,
  Crown,
  RefreshCw,
  Eye,
  TrendingUp,
  Globe,
  Lock
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalSessions: number
  activeSessions: number
  totalSearches: number
  todaySearches: number
  totalAlerts: number
  unreadAlerts: number
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical'
  dataSourceStatus: {
    elasticsearch: 'online' | 'offline'
    database: 'online' | 'offline'
    monitoring: 'online' | 'offline'
  }
}

export default function AdminDashboardContent() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadAdminStats()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadAdminStats(true)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadAdminStats = async (silent = false) => {
    if (!silent) setLoading(true)
    if (silent) setRefreshing(true)
    
    try {
      // Try to load real admin stats
      const response = await fetch('http://localhost:8080/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.data || data)
      } else {
        // Backend not available - set basic stats to 0 but still show the interface
        console.warn('Admin stats API not available')
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          totalSessions: 0,
          activeSessions: 0,
          totalSearches: 0,
          todaySearches: 0,
          totalAlerts: 0,
          unreadAlerts: 0,
          systemHealth: 'good',
          dataSourceStatus: {
            elasticsearch: 'offline',
            database: 'offline',
            monitoring: 'offline'
          }
        })
        if (!silent) {
          toast.error('Admin statistics service unavailable - showing interface with empty data')
        }
      }
    } catch (error) {
      console.error('Failed to load admin stats:', error)
      // Set empty stats so interface still shows
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalSessions: 0,
        activeSessions: 0,
        totalSearches: 0,
        todaySearches: 0,
        totalAlerts: 0,
        unreadAlerts: 0,
        systemHealth: 'warning',
        dataSourceStatus: {
          elasticsearch: 'offline',
          database: 'offline',
          monitoring: 'offline'
        }
      })
      if (!silent) {
        toast.error('Failed to load admin statistics - showing interface with empty data')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'online' ? 'text-green-600' : 'text-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  🛡️ ThreatScope Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, {user?.firstName}! System administration and monitoring.
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* System Health Badge */}
              <Badge className={getHealthColor(stats?.systemHealth || 'good')}>
                <Activity className="h-3 w-3 mr-1" />
                System {stats?.systemHealth || 'Good'}
              </Badge>
              
              <Button 
                onClick={() => loadAdminStats()} 
                disabled={refreshing} 
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              {/* Switch to User Mode */}
              <Link href="/dashboard?admin=false">
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  User View
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* System Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <Card className="bg-white shadow-sm border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                  <p className="text-xs text-green-600">{stats?.activeUsers || 0} active today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consultation Sessions */}
          <Card className="bg-white shadow-sm border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Consultations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalSessions || 0}</p>
                  <p className="text-xs text-green-600">{stats?.activeSessions || 0} active now</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Searches */}
          <Card className="bg-white shadow-sm border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Searches</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalSearches || 0}</p>
                  <p className="text-xs text-purple-600">{stats?.todaySearches || 0} today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Alerts */}
          <Card className="bg-white shadow-sm border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalAlerts || 0}</p>
                  <p className="text-xs text-red-600">{stats?.unreadAlerts || 0} unread</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Status */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Elasticsearch</span>
                  </div>
                  <Badge className={`${getStatusColor(stats?.dataSourceStatus.elasticsearch || 'online')} bg-transparent`}>
                    {stats?.dataSourceStatus.elasticsearch || 'Online'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Database</span>
                  </div>
                  <Badge className={`${getStatusColor(stats?.dataSourceStatus.database || 'online')} bg-transparent`}>
                    {stats?.dataSourceStatus.database || 'Online'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Monitoring</span>
                  </div>
                  <Badge className={`${getStatusColor(stats?.dataSourceStatus.monitoring || 'online')} bg-transparent`}>
                    {stats?.dataSourceStatus.monitoring || 'Online'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Admin Actions */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <Link href="/admin/consultation">
                  <Button className="w-full" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Consultation Management
                  </Button>
                </Link>
                
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Additional admin features will be available when backend services are connected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status Notice */}
        {(!stats || stats.systemHealth === 'warning') && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-900">Backend Connection Status</h3>
                  <p className="text-amber-700">
                    Some admin statistics may show as empty or unavailable. Consultation management is available.
                  </p>
                </div>
                <Button 
                  onClick={() => loadAdminStats()} 
                  disabled={refreshing} 
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Footer */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Crown className="h-8 w-8" />
                <div>
                  <h3 className="text-lg font-semibold">Administrator Access</h3>
                  <p className="text-blue-100">You have full system administration privileges</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-blue-100">ThreatScope Admin</p>
                  <p className="text-lg font-semibold">v1.0</p>
                </div>
                <Lock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}