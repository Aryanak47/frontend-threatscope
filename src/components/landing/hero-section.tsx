'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { 
  Shield, 
  Search, 
  Database, 
  Users, 
  ChevronRight, 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut,
  Eye,
  Lock,
  Zap,
  Globe,
  Activity,
  Cpu,
  AlertTriangle,
  Target,
  Radar
} from 'lucide-react'
import { NotificationCenter } from '@/components/ui/notification-center'

export function HeroSection() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentSlogan, setCurrentSlogan] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const { isAuthenticated, user, logout } = useAuthStore()

  const slogans = [
    "Your Digital Shield Against Cyber Threats",
    "Platform for Cybersecurity Experts", 
    "Protect Yourself from Hackers",
    "Advanced Threat Intelligence at Your Fingertips",
    "Defend. Detect. Dominate."
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(false)
      setTimeout(() => {
        setCurrentSlogan((prev) => (prev + 1) % slogans.length)
        setIsTyping(true)
      }, 500)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Enhanced Animated Background Layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-900" />
        <div className="absolute inset-0 network-pattern opacity-30" />
        <div className="absolute inset-0 cyber-grid opacity-15" />
        
        {/* Scan line effect */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-60 animate-pulse" />
      </div>
      
      {/* Enhanced Floating Security Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 glow-blue rounded-full opacity-20 float-slow" />
      <div className="absolute top-40 right-20 w-24 h-24 glow-red rounded-full opacity-15 float-medium" />
      <div className="absolute bottom-32 left-1/4 w-40 h-40 glow-green rounded-full opacity-10 float-fast" />
      <div className="absolute bottom-20 right-10 w-28 h-28 glow-purple rounded-full opacity-20 float-slow" />
      
      {/* Additional cyber elements */}
      <div className="absolute top-1/2 left-5 opacity-10">
        <Cpu className="h-16 w-16 text-blue-400 float-medium" />
      </div>
      <div className="absolute top-1/3 right-5 opacity-10">
        <Radar className="h-20 w-20 text-green-400 float-slow" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card rounded-2xl px-6 py-4 border border-white/10">
            <div className="flex items-center justify-between">
              {/* Enhanced Logo */}
              <div className="flex items-center space-x-3 group">
                <div className="relative">
                  <Shield className="h-10 w-10 text-gradient-intelligence transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 glow-blue rounded-full opacity-50 group-hover:opacity-75 transition-opacity" />
                </div>
                <div>
                  <span className="text-2xl font-black text-gradient-animated">ThreatScope</span>
                  <div className="text-xs text-blue-400 opacity-75 font-mono tracking-wider">SECURE</div>
                </div>
              </div>

              {/* Enhanced Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/features" className="text-slate-300 hover:text-white transition-all duration-300 hover:glow-blue px-3 py-2 rounded-lg">
                  Features
                </Link>
                <Link href="/pricing" className="text-slate-300 hover:text-white transition-all duration-300 hover:glow-blue px-3 py-2 rounded-lg">
                  Pricing
                </Link>
                <Link href="/docs" className="text-slate-300 hover:text-white transition-all duration-300 hover:glow-blue px-3 py-2 rounded-lg">
                  API Docs
                </Link>
                <Link href="/development" className="text-slate-300 hover:text-white transition-all duration-300 hover:glow-purple px-3 py-2 rounded-lg flex items-center">
                  Development Services
                  <div className="ml-2 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-400 font-mono">NEW</div>
                </Link>
                <Link href="/about" className="text-slate-300 hover:text-white transition-all duration-300 hover:glow-blue px-3 py-2 rounded-lg">
                  About
                </Link>
              </div>

              {/* Enhanced Auth Buttons */}
              <div className="hidden md:flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-2 text-sm glass-card px-3 py-2 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <User className="h-4 w-4 text-green-400" />
                      <span className="text-white">Welcome, {user?.firstName}</span>
                    </div>
                    <NotificationCenter />
                    <Button variant="outline" className="btn-intelligence border-blue-500/50 hover:border-blue-400" asChild>
                      <Link href="/dashboard">
                        <Settings className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-red-500/20" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="glass-button text-white hover:text-blue-400" asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button className="btn-threat shadow-lg shadow-red-500/25" asChild>
                      <Link href="/register">
                        <Shield className="mr-2 h-4 w-4" />
                        Get Started
                      </Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden glass-button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>

            {/* Enhanced Mobile Menu */}
            {isMenuOpen && (
              <div className="md:hidden mt-4 glass-card rounded-xl p-6 border-t border-white/10">
                <div className="space-y-4">
                  <Link href="/features" className="block text-slate-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5">
                    Features
                  </Link>
                  <Link href="/pricing" className="block text-slate-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5">
                    Pricing
                  </Link>
                  <Link href="/docs" className="block text-slate-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5">
                    API Docs
                  </Link>
                  <Link href="/about" className="block text-slate-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5">
                    About
                  </Link>
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    {isAuthenticated ? (
                      <>
                        <div className="flex items-center space-x-2 text-sm glass-card px-3 py-2 rounded-lg">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <User className="h-4 w-4 text-green-400" />
                          <span className="text-white">Welcome, {user?.firstName}</span>
                        </div>
                        <Button variant="outline" className="w-full justify-start btn-intelligence" asChild>
                          <Link href="/dashboard">
                            <Settings className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-red-500/20" onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" className="w-full justify-start glass-button" asChild>
                          <Link href="/login">Sign In</Link>
                        </Button>
                        <Button className="w-full btn-threat" asChild>
                          <Link href="/register">
                            <Shield className="mr-2 h-4 w-4" />
                            Get Started
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Content */}
      <div className="relative z-40 px-6 lg:px-8 pt-16 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-5xl mx-auto">
            {/* Enhanced Security Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full security-badge mb-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <AlertTriangle className="h-5 w-5 mr-3 animate-pulse" />
              <span className="font-semibold tracking-wide">TRUSTED BY SECURITY PROFESSIONALS</span>
              <Target className="h-5 w-5 ml-3 animate-spin" style={{animationDuration: '8s'}} />
            </div>

            {/* Dynamic Main Heading */}
            <h1 className="heading-xl mb-8 relative">
              <span className="block mb-4">
                <span className="text-white">Professional </span>
                <span className="text-gradient-intelligence font-black">OSINT</span>
              </span>
              <span className="block text-gradient-cyber font-black text-glow">
                Platform
              </span>
              
              {/* Animated underline */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-80" />
            </h1>

            {/* Dynamic Slogan with Typewriter Effect */}
            <div className="mb-8 h-16 flex items-center justify-center">
              <p className={`text-xl md:text-2xl font-semibold text-gradient-animated transition-opacity duration-500 ${isTyping ? 'opacity-100' : 'opacity-0'}`}>
                {slogans[currentSlogan]}
              </p>
            </div>

            {/* Enhanced Subheading */}
            <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Advanced cybersecurity platform with comprehensive threat intelligence and custom development services. 
              <span className="text-gradient-intelligence font-semibold">Search billions of records</span>, {" "}
              <span className="text-gradient-shield font-semibold">monitor your digital footprint</span>, and {" "}
              <span className="text-gradient-threat font-semibold">stay ahead of cyber threats</span>.
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              {isAuthenticated ? (
                <>
                  <Button size="xl" className="btn-threat min-w-[240px] h-14 text-lg font-bold shadow-2xl shadow-red-500/30" asChild>
                    <Link href="/search">
                      <Search className="mr-3 h-6 w-6" />
                      Start Threat Hunting
                      <ChevronRight className="ml-3 h-6 w-6" />
                    </Link>
                  </Button>
                  <Button size="xl" className="btn-intelligence min-w-[240px] h-14 text-lg font-bold shadow-2xl shadow-blue-500/30" asChild>
                    <Link href="/dashboard">
                      <Settings className="mr-3 h-6 w-6" />
                      Command Center
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="xl" className="btn-threat min-w-[260px] h-16 text-lg font-bold shadow-2xl shadow-red-500/30 relative group" asChild>
                    <Link href="/register">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10 flex items-center">
                        <Shield className="mr-3 h-6 w-6" />
                        Start Free Trial
                        <ChevronRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </Button>
                  <Button size="xl" className="btn-intelligence min-w-[260px] h-16 text-lg font-bold shadow-2xl shadow-blue-500/30 relative group" asChild>
                    <Link href="/demo">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10 flex items-center">
                        <Eye className="mr-3 h-6 w-6" />
                        Live Demo
                        <Activity className="ml-3 h-6 w-6 group-hover:animate-pulse" />
                      </div>
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Enhanced Trust Indicators with Animation */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="stats-card group">
                <div className="relative">
                  <div className="text-3xl md:text-4xl font-black text-gradient-threat mb-2 group-hover:scale-110 transition-transform">14B+</div>
                  <div className="text-sm text-slate-400 font-medium tracking-wider uppercase">Breach Records</div>
                  <Database className="absolute -top-2 -right-2 h-6 w-6 text-red-400 opacity-20 group-hover:opacity-60 transition-opacity" />
                </div>
              </div>
              <div className="stats-card group">
                <div className="relative">
                  <div className="text-3xl md:text-4xl font-black text-gradient-intelligence mb-2 group-hover:scale-110 transition-transform">500+</div>
                  <div className="text-sm text-slate-400 font-medium tracking-wider uppercase">Data Sources</div>
                  <Globe className="absolute -top-2 -right-2 h-6 w-6 text-blue-400 opacity-20 group-hover:opacity-60 transition-opacity" />
                </div>
              </div>
              <div className="stats-card group">
                <div className="relative">
                  <div className="text-3xl md:text-4xl font-black text-gradient-shield mb-2 group-hover:scale-110 transition-transform">99.9%</div>
                  <div className="text-sm text-slate-400 font-medium tracking-wider uppercase">Uptime SLA</div>
                  <Zap className="absolute -top-2 -right-2 h-6 w-6 text-green-400 opacity-20 group-hover:opacity-60 transition-opacity" />
                </div>
              </div>
              <div className="stats-card group">
                <div className="relative">
                  <div className="text-3xl md:text-4xl font-black text-gradient-cyber mb-2 group-hover:scale-110 transition-transform">24/7</div>
                  <div className="text-sm text-slate-400 font-medium tracking-wider uppercase">Threat Monitoring</div>
                  <Eye className="absolute -top-2 -right-2 h-6 w-6 text-purple-400 opacity-20 group-hover:opacity-60 transition-opacity" />
                </div>
              </div>
            </div>

            {/* Security Indicators */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-slate-400">
              <div className="flex items-center space-x-2 glass-card px-4 py-2 rounded-lg hover:glow-green transition-all duration-300">
                <Lock className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium">256-bit Encryption</span>
              </div>
              <div className="flex items-center space-x-2 glass-card px-4 py-2 rounded-lg hover:glow-blue transition-all duration-300">
                <Shield className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">SOC 2 Compliant</span>
              </div>
              <div className="flex items-center space-x-2 glass-card px-4 py-2 rounded-lg hover:glow-purple transition-all duration-300">
                <Eye className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium">Zero-Log Policy</span>
              </div>
              <div className="flex items-center space-x-2 glass-card px-4 py-2 rounded-lg hover:glow-red transition-all duration-300">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium">Threat Detection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
