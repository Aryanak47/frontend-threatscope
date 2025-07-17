'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { Shield, Search, Database, Users, ChevronRight, Menu, X, User, Settings, LogOut } from 'lucide-react'

export function HeroSection() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
      
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-security-600" />
            <span className="text-2xl font-bold text-gradient">ThreatScope</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
              API Docs
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span>Welcome, {user?.firstName}</span>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">
                    <Settings className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button variant="security" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-card border-b border-border shadow-lg">
            <div className="px-6 py-4 space-y-4">
              <Link href="/features" className="block text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="block text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="block text-muted-foreground hover:text-foreground transition-colors">
                API Docs
              </Link>
              <Link href="/about" className="block text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <div className="pt-4 border-t border-border space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Welcome, {user?.firstName}</span>
                    </div>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/dashboard">
                        <Settings className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button variant="security" className="w-full" asChild>
                      <Link href="/register">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Content */}
      <div className="relative z-40 px-6 lg:px-8 pt-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-security-50 text-security-700 dark:bg-security-950 dark:text-security-300 mb-8">
              <Database className="h-4 w-4 mr-2" />
              Trusted by 10,000+ Security Professionals
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Professional{' '}
              <span className="text-gradient bg-gradient-to-r from-security-600 to-intelligence-600 bg-clip-text text-transparent">
                OSINT Platform
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Comprehensive breach monitoring and threat intelligence platform. 
              Search billions of records, monitor your digital footprint, and stay ahead of cyber threats.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              {isAuthenticated ? (
                <>
                  <Button size="xl" variant="security" className="min-w-[200px]" asChild>
                    <Link href="/search">
                      <Search className="mr-2 h-5 w-5" />
                      Start Searching
                    </Link>
                  </Button>
                  <Button size="xl" variant="outline" className="min-w-[200px]" asChild>
                    <Link href="/dashboard">
                      <Settings className="mr-2 h-5 w-5" />
                      View Dashboard
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="xl" variant="security" className="min-w-[200px]" asChild>
                    <Link href="/register">
                      Start Free Trial
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="xl" variant="outline" className="min-w-[200px]" asChild>
                    <Link href="/demo">
                      <Search className="mr-2 h-5 w-5" />
                      View Demo
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-muted-foreground">
              <div>
                <div className="text-2xl font-bold text-foreground">14B+</div>
                <div className="text-sm">Records Indexed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">500+</div>
                <div className="text-sm">Data Sources</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">99.9%</div>
                <div className="text-sm">Uptime SLA</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">24/7</div>
                <div className="text-sm">Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-security-500/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-1/3 right-10 w-32 h-32 bg-intelligence-500/10 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute bottom-1/4 left-1/4 w-16 h-16 bg-security-500/10 rounded-full blur-xl animate-pulse delay-500" />
    </div>
  )
}
