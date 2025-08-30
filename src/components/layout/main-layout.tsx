'use client'

import Link from 'next/link'
import { useAuthStore } from '@/stores/auth'
import { useMonitoringStore } from '@/stores/monitoring'
import { useNotificationStore } from '@/stores/notifications'
import useAlertStore from '@/stores/alerts'
import { Button } from '@/components/ui/button'
import { NotificationStatusIndicator } from '@/components/ui/notification-status-indicator'
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications'
import { 
  Shield, 
  Search, 
  AlertTriangle, 
  Settings, 
  User, 
  LogOut,
  Bell,
  Menu,
  X,
  Crown,
  MessageSquare
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, user, logout, isAdmin, hasRole } = useAuthStore()
  const { fetchItems: fetchMonitoringItems } = useMonitoringStore()
  const { unreadCount: notificationCount } = useNotificationStore()
  const { unreadCount: alertCount, fetchUnreadCount: fetchAlertCount, setupWebSocketListeners: setupAlertWebSocket } = useAlertStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Initialize real-time notifications
  useRealTimeNotifications()

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch monitoring items so WebSocket knows about active monitoring
      fetchMonitoringItems()
      fetchAlertCount()
      // Set up WebSocket listeners for real-time alert count updates
      setupAlertWebSocket()
    }
  }, [isAuthenticated]) // Removed function dependencies

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const getPlanType = () => {
    if (user?.subscription?.planType) {
      return user.subscription.planType
    }
    return 'FREE'
  }

  const navigation = [
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Dashboard', href: '/dashboard', icon: User, authRequired: true },
    { name: 'Monitoring', href: '/monitoring', icon: Shield, authRequired: true },
    { name: 'Alerts', href: '/alerts', icon: AlertTriangle, authRequired: true, count: alertCount > 0 ? alertCount : undefined },
    { name: 'Consultations', href: '/consultation', icon: MessageSquare, authRequired: true },
    { name: 'Expert Panel', href: '/expert', icon: Crown, authRequired: true, expertOnly: true },
    { name: 'Admin Panel', href: '/admin/consultation', icon: Settings, authRequired: true, adminOnly: true },
    { name: 'Notifications', href: '/notifications', icon: Bell, authRequired: true, count: notificationCount > 0 ? notificationCount : undefined },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-red-600" />
                <span className="text-xl font-bold text-gray-900">ThreatScope</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-3">
              {navigation.map((item) => {
                if (item.authRequired && !isAuthenticated) return null
                if (item.expertOnly && !hasRole('EXPERT') && !isAdmin()) return null
                if (item.adminOnly && !isAdmin()) return null
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-1 xl:px-2 py-2 rounded-md text-sm font-medium transition-colors relative"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden xl:inline">{item.name}</span>
                    {item.count && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                        {item.count > 9 ? '9+' : item.count}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-3">
              {/* Real-time Connection Status */}
              {isAuthenticated && (
                <NotificationStatusIndicator />
              )}
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-1 xl:space-x-3">
                  {/* Upgrade Button (only show if not Enterprise) */}
                  {getPlanType() !== 'ENTERPRISE' && (
                    <Link href="/pricing">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50 hidden xl:flex"
                      >
                        <Crown className="h-4 w-4" />
                        <span className="hidden 2xl:ml-1 2xl:inline">Upgrade</span>
                      </Button>
                    </Link>
                  )}
                  
                  {/* User Menu */}
                  <div className="flex items-center space-x-1 xl:space-x-2">
                    <span className="text-sm text-gray-700 hidden xl:block max-w-20 truncate">
                      {user?.firstName || user?.email}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-1 xl:space-x-3">
                  <Link href="/login">
                    <Button variant="outline" size="sm">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navigation.map((item) => {
                if (item.authRequired && !isAuthenticated) return null
                if (item.expertOnly && !hasRole('EXPERT') && !isAdmin()) return null
                if (item.adminOnly && !isAdmin()) return null
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                    {item.count && (
                      <span className="bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-auto">
                        {item.count > 9 ? '9+' : item.count}
                      </span>
                    )}
                  </Link>
                )
              })}
              
              {/* Mobile Auth */}
              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    {/* Mobile Upgrade Button */}
                    {getPlanType() !== 'ENTERPRISE' && (
                      <Link
                        href="/pricing"
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md text-base font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Crown className="h-4 w-4" />
                        <span>Upgrade Plan</span>
                      </Link>
                    )}
                    
                    <div className="px-3 py-2 text-sm text-gray-700">
                      {user?.firstName || user?.email}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      className="block px-3 py-2 text-gray-600 hover:text-gray-900 rounded-md text-base font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="block px-3 py-2 text-gray-600 hover:text-gray-900 rounded-md text-base font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
