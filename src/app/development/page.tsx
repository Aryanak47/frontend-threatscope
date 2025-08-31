'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'
import { NotificationCenter } from '@/components/ui/notification-center'
import { 
  Zap, 
  Brain, 
  Target, 
  Code, 
  Smartphone, 
  Globe, 
  CheckCircle, 
  ArrowRight,
  Calendar,
  Users,
  Trophy,
  Clock,
  Shield,
  User,
  Settings,
  LogOut
} from 'lucide-react'

const services = [
  {
    icon: Globe,
    title: 'Web Applications',
    description: 'Custom web applications, dashboards, and SaaS platforms built with modern technologies.',
    features: ['React/Next.js', 'Node.js Backend', 'Database Design', 'API Development', 'Responsive Design'],
    timeline: '2-4 weeks',
    gradient: 'text-gradient-intelligence',
    glowClass: 'glow-blue',
    borderColor: 'border-blue-500/20'
  },
  {
    icon: Smartphone,
    title: 'Mobile Applications',
    description: 'Native and cross-platform mobile applications for iOS and Android with seamless UX.',
    features: ['React Native', 'Flutter', 'Native iOS/Android', 'Push Notifications', 'Offline Support'],
    timeline: '1-3 months',
    gradient: 'text-gradient-shield',
    glowClass: 'glow-green',
    borderColor: 'border-green-500/20'
  },
  {
    icon: Brain,
    title: 'AI Agents & Automation',
    description: 'Intelligent AI agents and automation solutions to streamline your business processes.',
    features: ['OpenAI Integration', 'Custom AI Models', 'Workflow Automation', 'Data Processing', 'API Integrations'],
    timeline: '2-5 days',
    gradient: 'text-gradient-cyber',
    glowClass: 'glow-purple',
    borderColor: 'border-purple-500/20'
  },
  {
    icon: Target,
    title: 'Complete Product MVPs',
    description: 'Full-featured minimum viable products from concept to deployment in record time.',
    features: ['Market Research', 'UI/UX Design', 'Full-Stack Development', 'Testing & QA', 'Deployment'],
    timeline: '5-7 days',
    gradient: 'text-gradient-threat',
    glowClass: 'glow-red',
    borderColor: 'border-red-500/20'
  }
];

const stats = [
  {
    icon: Clock,
    value: '2-12 Weeks',
    label: 'Fast Delivery',
    sublabel: 'Based on project scope'
  },
  {
    icon: Trophy,
    value: '50-80%',
    label: 'Cost Savings',
    sublabel: 'vs traditional agencies'
  },
  {
    icon: Users,
    value: '$2K-15K',
    label: 'Affordable Pricing',
    sublabel: 'Fixed-price projects'
  }
];

const process = [
  {
    step: '01',
    title: 'Discovery & Planning',
    description: 'We analyze your requirements and create a detailed development plan.',
    duration: 'Day 1'
  },
  {
    step: '02',
    title: 'Design & Architecture',
    description: 'UI/UX design and technical architecture planning.',
    duration: 'Day 1-2'
  },
  {
    step: '03',
    title: 'Development & Testing',
    description: 'Rapid development with continuous testing and quality assurance.',
    duration: 'Day 2-6'
  },
  {
    step: '04',
    title: 'Deployment & Handover',
    description: 'Production deployment with documentation and training.',
    duration: 'Day 7'
  }
];

export default function DevelopmentServicesPage() {
  const { isAuthenticated, user, logout } = useAuthStore()
  
  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card rounded-2xl px-6 py-4 border border-white/10">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-3 group">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="relative">
                    <Shield className="h-10 w-10 text-gradient-intelligence transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 glow-blue rounded-full opacity-50 group-hover:opacity-75 transition-opacity" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-gradient-animated">ThreatScope</span>
                    <div className="text-xs text-blue-400 opacity-75 font-mono tracking-wider">SECURE</div>
                  </div>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-slate-300 hover:text-white transition-all duration-300 hover:glow-blue px-3 py-2 rounded-lg">
                  Home
                </Link>
                <Link href="/features" className="text-slate-300 hover:text-white transition-all duration-300 hover:glow-blue px-3 py-2 rounded-lg">
                  Features
                </Link>
                <Link href="/pricing" className="text-slate-300 hover:text-white transition-all duration-300 hover:glow-blue px-3 py-2 rounded-lg">
                  Pricing
                </Link>
                <Link href="/development" className="text-white bg-purple-500/20 border border-purple-500/30 px-3 py-2 rounded-lg flex items-center">
                  Development Services
                  <div className="ml-2 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-400 font-mono">NEW</div>
                </Link>
                <Link href="/about" className="text-slate-300 hover:text-white transition-all duration-300 hover:glow-blue px-3 py-2 rounded-lg">
                  About
                </Link>
              </div>

              {/* Auth Buttons */}
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
                    <Button variant="outline" className="btn-intelligence border-blue-500/50 hover:border-blue-400" asChild>
                      <Link href="/login">
                        Login
                      </Link>
                    </Button>
                    <Button className="btn-threat shadow-lg shadow-red-500/25" asChild>
                      <Link href="/register">
                        Get Started
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 px-6 lg:px-8 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-950" />
          <div className="absolute inset-0 cyber-grid opacity-5" />
        </div>
        
        {/* Floating background elements */}
        <div className="absolute top-20 right-20 w-40 h-40 glow-purple rounded-full opacity-5 float-slow" />
        <div className="absolute bottom-20 left-20 w-32 h-32 glow-blue rounded-full opacity-5 float-medium" />
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-6">
            <Code className="h-4 w-4 mr-2 text-purple-400" />
            <span className="text-sm font-semibold text-purple-400 tracking-wider uppercase">Development Services</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8">
            <span className="text-white">Rapid </span>
            <span className="text-gradient-cyber">Development</span>
            <br />
            <span className="text-gradient-animated">Solutions</span>
          </h1>
          
          {/* Motto/Quote */}
          <div className="mb-8 relative">
            <div className="glass-card rounded-2xl p-6 border border-purple-500/20 relative group overflow-hidden max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10">
                <div className="text-6xl text-purple-400/30 font-black mb-2">"</div>
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  <span className="text-gradient-cyber">Fast</span>, {" "}
                  <span className="text-gradient-threat">Affordable</span>, {" "}
                  <span className="text-gradient-intelligence">Exceptional</span>
                  <br />
                  <span className="text-slate-300 text-xl">— Pick All Three</span>
                </h2>
                <div className="text-6xl text-purple-400/30 font-black mt-2 text-right">"</div>
              </div>
            </div>
          </div>
          
          <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform your ideas into reality with our efficient development services. 
            <span className="text-gradient-intelligence font-semibold">Web applications</span>, {" "}
            <span className="text-gradient-shield font-semibold">mobile apps</span>, {" "}
            <span className="text-gradient-cyber font-semibold">AI agents</span>, and {" "}
            <span className="text-gradient-threat font-semibold">complete MVPs</span> delivered on time and on budget.
          </p>
          
          <div className="flex justify-center items-center mb-16">
            <Button className="btn-threat shadow-xl shadow-red-500/25" size="lg" asChild>
              <Link href="/development/contact">
                <Calendar className="mr-2 h-5 w-5" />
                Get Quote
              </Link>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="stats-card"
                style={{
                  animationDelay: `${index * 0.2}s`,
                  animation: 'fade-in-up 0.6s ease-out both'
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="p-4 rounded-2xl glass-card mb-4 group-hover:glow-blue transition-all duration-500">
                    <stat.icon className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="text-3xl font-black text-white mb-2">{stat.value}</div>
                  <div className="text-lg font-semibold text-slate-300 mb-1">{stat.label}</div>
                  <div className="text-sm text-slate-400">{stat.sublabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section className="relative py-24 px-6 lg:px-8">
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Our <span className="text-gradient-cyber">Development Services</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              From simple web applications to complex AI-powered solutions, we deliver high-quality products at lightning speed.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className={`feature-card relative group border ${service.borderColor}`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fade-in-up 0.6s ease-out both'
                }}
              >
                {/* Timeline Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-lg text-xs font-mono text-purple-300 uppercase tracking-wider font-semibold">
                    {service.timeline}
                  </div>
                </div>
                
                {/* Icon and Title */}
                <div className="flex items-center mb-6">
                  <div className={`relative p-4 rounded-2xl glass-card group-hover:${service.glowClass} transition-all duration-500`}>
                    <service.icon className={`h-8 w-8 ${service.gradient} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                  
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-gradient-animated transition-all duration-300">
                      {service.title}
                    </h3>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-60 group-hover:opacity-100 group-hover:w-16 transition-all duration-500" />
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-slate-300 leading-relaxed mb-6 group-hover:text-slate-200 transition-colors duration-300">
                  {service.description}
                </p>
                
                {/* Features List */}
                <div className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-sm text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Process Section */}
      <section className="relative py-24 px-6 lg:px-8 bg-slate-900/50">
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Our <span className="text-gradient-threat">Development Process</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              Streamlined workflow designed for maximum efficiency and quality delivery.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div 
                key={index}
                className="relative group"
                style={{
                  animationDelay: `${index * 0.2}s`,
                  animation: 'fade-in-up 0.6s ease-out both'
                }}
              >
                <div className="glass-card p-6 rounded-xl border border-white/10 text-center relative overflow-hidden">
                  {/* Step Number */}
                  <div className="text-6xl font-black text-gradient-cyber opacity-20 mb-4">
                    {step.step}
                  </div>
                  
                  {/* Duration Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-400 font-mono">
                      {step.duration}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{step.description}</p>
                  
                  {/* Connector Line */}
                  {index < process.length - 1 && (
                    <div className="absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-transparent hidden lg:block" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative py-24 px-6 lg:px-8">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="glass-card rounded-2xl p-12 border border-white/10 relative group overflow-hidden">
            {/* Background gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Build Your <span className="text-gradient-cyber">Next Project</span>?
              </h2>
              <div className="mb-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                  <span className="text-sm font-bold text-green-400 tracking-wider uppercase">💡 Why Pay More & Wait Longer?</span>
                </div>
              </div>
              
              <p className="text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Skip the 3-month timelines and $50K+ budgets. Get enterprise-quality applications delivered in days, not months, at a fraction of the cost.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button className="btn-threat shadow-xl shadow-red-500/25" size="lg" asChild>
                  <Link href="/development/contact">
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Consultation
                  </Link>
                </Button>
                <Button className="btn-intelligence shadow-xl shadow-blue-500/25" variant="outline" size="lg" asChild>
                  <Link href="/development/contact">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Get Quote
                  </Link>
                </Button>
              </div>
              
              <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Free Consultation
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Fixed-Price Quotes
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  24h Response
                </div>
              </div>
            </div>
            
            {/* Animated border */}
            <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-purple-500/50 transition-colors duration-500" />
          </div>
        </div>
      </section>
    </div>
  )
}