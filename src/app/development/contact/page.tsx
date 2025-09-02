'use client';

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'
import { NotificationCenter } from '@/components/ui/notification-center'
import { 
  Shield,
  User,
  Settings,
  LogOut,
  Calendar,
  MessageCircle,
  Mail,
  Phone,
  Building,
  Code,
  Clock,
  DollarSign,
  CheckCircle,
  Send,
  ArrowLeft
} from 'lucide-react'

const projectTypes = [
  'Web Application',
  'Mobile App (iOS/Android)',
  'AI Agent/Automation',
  'Complete MVP',
  'API Development',
  'Dashboard/Analytics',
  'E-commerce Platform',
  'Custom Solution'
];

const budgetRanges = [
  'Under $5K',
  '$5K - $10K', 
  '$10K - $25K',
  '$25K - $50K',
  '$50K+'
];

const timeframes = [
  'ASAP (Rush Job)',
  '1-2 weeks',
  '1 month',
  '2-3 months',
  'Flexible'
];

export default function DevelopmentContactPage() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    projectType: '',
    budget: '',
    timeframe: '',
    description: '',
    features: ''
  })

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Create email content
    const emailSubject = `Development Quote Request - ${formData.projectType} - ${formData.name}`
    const emailBody = `
Hi ThreatScope Development Team,

I'm interested in your development services. Here are my project details:

CONTACT INFORMATION:
- Name: ${formData.name}
- Email: ${formData.email}
- Company: ${formData.company || 'Not provided'}
- Phone: ${formData.phone || 'Not provided'}

PROJECT DETAILS:
- Project Type: ${formData.projectType}
- Budget Range: ${formData.budget || 'Not specified'}
- Timeline: ${formData.timeframe || 'Not specified'}

PROJECT DESCRIPTION:
${formData.description}

${formData.features ? `KEY FEATURES & REQUIREMENTS:\n${formData.features}` : ''}

Please provide a detailed quote for this project.

Best regards,
${formData.name}
    `.trim()
    
    // Create mailto link
    const mailtoLink = `mailto:dev@threatscope.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    
    // Open email client
    window.location.href = mailtoLink
    
    setIsSubmitting(false)
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
                    <Shield className="h-10 w-10 text-blue-400 transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 glow-blue rounded-full opacity-50 group-hover:opacity-75 transition-opacity" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-white">ThreatScope</span>
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
                    <Button variant="outline" className="border-blue-400/50 hover:border-blue-400 text-blue-400 hover:text-white hover:bg-blue-500/20 border-blue-500/50 hover:border-blue-400" asChild>
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
                    <Button variant="outline" className="border-blue-400/50 hover:border-blue-400 text-blue-400 hover:text-white hover:bg-blue-500/20 border-blue-500/50 hover:border-blue-400" asChild>
                      <Link href="/login">
                        Login
                      </Link>
                    </Button>
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25" asChild>
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

      {/* Header Section */}
      <section className="relative py-16 px-6 lg:px-8">
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href="/development" className="inline-flex items-center text-slate-400 hover:text-white transition-colors duration-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Development Services
            </Link>
          </div>
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-6">
              <MessageCircle className="h-4 w-4 mr-2 text-purple-400" />
              <span className="text-sm font-semibold text-purple-400 tracking-wider uppercase">Get Your Quote</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black mb-6 text-white">
              Let's Build Your Next Project
            </h1>
            
            <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Tell us about your project and we'll provide a detailed quote within 24 hours. 
              No obligations, no hidden costs.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="relative py-12 px-6 lg:px-8">
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="glass-card rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Project Details</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-900/90 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-900/90 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50"
                        placeholder="john@company.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-900/90 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50"
                        placeholder="Your Company"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-900/90 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50"
                        placeholder="+1-555-123-4567"
                      />
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Project Type *
                      </label>
                      <select
                        name="projectType"
                        value={formData.projectType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-900/90 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50"
                        required
                      >
                        <option value="">Select Type</option>
                        {projectTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Budget Range
                      </label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-900/90 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50"
                      >
                        <option value="">Select Budget</option>
                        {budgetRanges.map(range => (
                          <option key={range} value={range}>{range}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Timeline
                      </label>
                      <select
                        name="timeframe"
                        value={formData.timeframe}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-900/90 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50"
                      >
                        <option value="">Select Timeline</option>
                        {timeframes.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Project Description */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Project Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-900/90 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 resize-none"
                      placeholder="Describe your project, goals, and any specific requirements..."
                      required
                    />
                  </div>

                  {/* Key Features */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Key Features & Requirements
                    </label>
                    <textarea
                      name="features"
                      value={formData.features}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-900/90 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 resize-none"
                      placeholder="List important features, integrations, or technical requirements..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-xl shadow-blue-500/25" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Sending Quote Request...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Send Quote Request
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              {/* Quick Contact */}
              <div className="glass-card rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Quick Contact</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Mail className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Email</div>
                      <div className="text-white font-mono">dev@threatscope.com</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Phone className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Phone</div>
                      <div className="text-white font-mono">+1-555-THREAT</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="glass-card rounded-xl p-6 border border-green-500/20">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="h-5 w-5 text-green-400" />
                  <h3 className="text-lg font-bold text-white">Fast Response</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-slate-300">Quote within 24 hours</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-slate-300">Free consultation call</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-slate-300">Fixed-price proposals</span>
                  </div>
                </div>
              </div>

              {/* Pricing Info */}
              <div className="glass-card rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-center space-x-3 mb-4">
                  <DollarSign className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">Transparent Pricing</h3>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <div>• Web Apps: $5K - $25K</div>
                  <div>• Mobile Apps: $10K - $50K</div>
                  <div>• AI Agents: $2K - $15K</div>
                  <div>• MVPs: $3K - $20K</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}