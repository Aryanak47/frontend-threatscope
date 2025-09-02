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

  // Prioritize main navigation items for better UX
  const mainNavigation = [
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Dashboard', href: '/dashboard', icon: User, authRequired: true },
    { name: 'Monitoring', href: '/monitoring', icon: Shield, authRequired: true },
    { name: 'Alerts', href: '/alerts', icon: AlertTriangle, authRequired: true, count: alertCount > 0 ? alertCount : undefined },
  ]
  
  // Secondary navigation for dropdown menu
  const secondaryNavigation = [
    { name: 'Consultations', href: '/consultation', icon: MessageSquare, authRequired: true },
    { name: 'Notifications', href: '/notifications', icon: Bell, authRequired: true, count: notificationCount > 0 ? notificationCount : undefined },
    { name: 'Expert Panel', href: '/expert', icon: Crown, authRequired: true, expertOnly: true },
    { name: 'Admin Panel', href: '/admin/consultation', icon: Settings, authRequired: true, adminOnly: true },
  ]

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-slate-900/95 backdrop-blur border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-red-600" />
                <span className="text-xl font-bold text-slate-100">ThreatScope</span>
              </Link>
            </div>

            {/* Desktop Navigation - Clean main items */}
            <div className="hidden lg:flex items-center space-x-1">
              {mainNavigation.map((item) => {
                if (item.authRequired && !isAuthenticated) return null
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 text-slate-400 hover:text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-slate-800/50 relative"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden xl:block">{item.name}</span>
                    {item.count && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-medium">
                        {item.count > 9 ? '9+' : item.count}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Right Side - Clean User Menu */}
            <div className="hidden lg:flex items-center space-x-3">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  {/* Connection Status - Compact */}
                  <NotificationStatusIndicator />
                  
                  {/* User Profile Dropdown */}
                  <div className="relative group">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex items-center space-x-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 px-3"
                    >
                      <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="hidden xl:block text-sm">
                        {user?.firstName || user?.email?.split('@')[0] || 'User'}
                      </span>
                    </Button>
                    
                    {/* User Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700/50 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-slate-700/50">
                        <div className="text-sm font-medium text-slate-200">
                          {user?.firstName || user?.email}
                        </div>
                        <div className="text-xs text-slate-400">
                          {getPlanType()} Plan
                        </div>
                      </div>
                      
                      {/* Navigation Items */}
                      {secondaryNavigation.map((item) => {
                        if (item.authRequired && !isAuthenticated) return null
                        if (item.expertOnly && !hasRole('EXPERT') && !isAdmin()) return null
                        if (item.adminOnly && !isAdmin()) return null
                        
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 text-sm relative"
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.name}</span>
                            {item.count && (
                              <span className="ml-auto bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                                {item.count > 9 ? '9+' : item.count}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                      
                      {/* Upgrade Option */}
                      {getPlanType() !== 'ENTERPRISE' && (
                        <Link
                          href="/pricing"
                          className="flex items-center space-x-2 px-4 py-2 text-blue-400 hover:text-blue-300 hover:bg-slate-700/50 text-sm border-t border-slate-700/50"
                        >
                          <Crown className="h-4 w-4" />
                          <span>Upgrade Plan</span>
                        </Link>
                      )}
                      
                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-slate-700/50 text-sm w-full text-left border-t border-slate-700/50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-400 hover:text-slate-200 focus:outline-none focus:text-slate-200 p-2 rounded-lg hover:bg-slate-800/50 transition-all"
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-800 border-t border-slate-700/50">
              {/* Main Navigation */}
              {mainNavigation.concat(secondaryNavigation).map((item) => {
                if (item.authRequired && !isAuthenticated) return null
                if (item.expertOnly && !hasRole('EXPERT') && !isAdmin()) return null
                if (item.adminOnly && !isAdmin()) return null
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 text-slate-400 hover:text-slate-200 block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-700/50 transition-all"
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
              <div className="pt-4 border-t border-slate-700/50">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    {/* User Info */}
                    <div className="px-3 py-2 text-slate-300 bg-slate-700/50 rounded-md">
                      <div className="text-sm font-medium">{user?.firstName || user?.email}</div>
                      <div className="text-xs text-slate-400">{getPlanType()} Plan</div>
                    </div>
                    
                    {/* Mobile Upgrade Button */}
                    {getPlanType() !== 'ENTERPRISE' && (
                      <Link
                        href="/pricing"
                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 px-3 py-2 rounded-md text-base font-medium hover:bg-slate-700/50 transition-all"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Crown className="h-4 w-4" />
                        <span>Upgrade Plan</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-slate-400 hover:text-slate-200 px-3 py-2 rounded-md text-base font-medium w-full text-left hover:bg-slate-700/50 transition-all"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      className="block px-3 py-2 text-slate-400 hover:text-slate-200 rounded-md text-base font-medium hover:bg-slate-700/50 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="block px-3 py-2 text-slate-400 hover:text-slate-200 rounded-md text-base font-medium hover:bg-slate-700/50 transition-all"
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
