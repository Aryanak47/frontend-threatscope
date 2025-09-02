'use client';

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
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
  LogOut,
  Star,
  Play,
  Layers,
  Sparkles,
  ExternalLink,
  Award,
  TrendingUp,
  Rocket,
  Palette,
  Database,
  Cpu,
  Monitor,
  Eye,
  Heart,
  MessageSquare,
  ChevronRight
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

// Portfolio projects data
const portfolioProjects = [
  {
    id: 1,
    title: "VerifyWise - AI Governance Platform",
    category: "AI/ML Platform",
    description: "Open source AI governance platform providing compliance tracking, risk assessment, and ethics monitoring for AI systems.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
    technologies: ["React", "TypeScript", "Node.js", "AI/ML", "PostgreSQL"],
    metrics: {
      compliance: "100% tracking",
      governance: "Enterprise AI",
      monitoring: "Real-time"
    },
    timeline: "8 weeks",
    budget: "$45K",
    features: ["Compliance tracking", "Risk assessment", "Ethics monitoring", "Enterprise governance"],
    testimonial: "The AI governance platform exceeded our expectations. Compliance tracking is now automated and risk assessment provides actionable insights. Ethics monitoring has become seamless.",
    client: "@VerifyWise",
    demoUrl: "#",
    caseStudyUrl: "#"
  },
  {
    id: 2,
    title: "Hamro Remittance Platform",
    category: "FinTech",
    description: "In-house remittance platform replacing costly third-party APIs and achieving 60% cost savings for 100K+ daily users.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    technologies: ["Java", "Spring Boot", "AWS", "PostgreSQL", "React"],
    metrics: {
      users: "100K+",
      savings: "60% cost reduction",
      transactions: "Daily processing"
    },
    timeline: "12 weeks",
    budget: "$85K",
    features: ["Cost-effective transfers", "High-volume processing", "AWS infrastructure", "Admin dashboard"],
    testimonial: "Incredible cost reduction! The platform handles 100K+ daily transactions flawlessly. AWS infrastructure scales perfectly and the admin dashboard provides complete visibility into operations.",
    client: "@HamroRemittance",
    demoUrl: "#",
    caseStudyUrl: "#"
  },
  {
    id: 3,
    title: "ThreatScope - OSINT Security Platform",
    category: "Cybersecurity",
    description: "Professional OSINT and breach monitoring security platform with advanced threat detection capabilities.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop",
    technologies: ["Next.js 14", "TypeScript", "Java Spring Boot", "Docker", "JWT"],
    metrics: {
      threats: "Real-time detection",
      security: "Enterprise-grade",
      monitoring: "24/7 surveillance"
    },
    timeline: "10 weeks",
    budget: "$65K",
    features: ["Threat detection", "Role-based access", "JWT authentication", "OSINT monitoring"],
    testimonial: "ThreatScope transformed our cybersecurity operations. Real-time OSINT monitoring detected threats we would have missed. The JWT authentication and role-based access controls are enterprise-grade.",
    client: "@ThreatScope",
    demoUrl: "#",
    caseStudyUrl: "#"
  },
  {
    id: 4,
    title: "Claude AI Futures Trading System",
    category: "AI Trading",
    description: "Sophisticated full-stack AI-powered futures trading platform with real-time market data and technical indicators.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop",
    technologies: ["React 18", "Node.js", "Express.js", "PostgreSQL", "Claude AI"],
    metrics: {
      accuracy: "85% prediction",
      trades: "Real-time execution",
      analysis: "AI-powered insights"
    },
    timeline: "6 weeks",
    budget: "$55K",
    features: ["Real-time data", "Technical indicators", "AI market insights", "Automated trading"],
    testimonial: "Game-changing AI trading platform! Claude AI integration provides unmatched market insights. Real-time data processing and technical indicators helped achieve 85% prediction accuracy. The PostgreSQL backend handles high-frequency trading perfectly.",
    client: "@ClaudeTrading",
    demoUrl: "#",
    caseStudyUrl: "#"
  }
];

// Enhanced services with more detail
const services = [
  {
    icon: Globe,
    title: 'Web Applications',
    description: 'Enterprise-grade web applications with cutting-edge technology stacks and scalable architecture.',
    longDescription: 'From MVP to enterprise-scale applications, we build performant, secure, and scalable web solutions that drive business growth.',
    features: ['Next.js/React', 'Node.js/Python Backend', 'Cloud Architecture', 'API Development', 'Performance Optimization'],
    timeline: '2-6 weeks',
    priceRange: '$5K - $50K',
    gradient: 'from-blue-500 to-cyan-500',
    glowClass: 'shadow-blue-500/20',
    borderColor: 'border-blue-500/30',
    deliverables: ['Responsive Web App', 'Admin Dashboard', 'API Documentation', 'Deployment Guide']
  },
  {
    icon: Smartphone,
    title: 'Mobile Applications',
    description: 'Native iOS/Android and cross-platform mobile apps with exceptional user experiences.',
    longDescription: 'Build mobile applications that users love, with intuitive interfaces and powerful functionality that drives engagement.',
    features: ['React Native/Flutter', 'Native iOS/Android', 'Push Notifications', 'Offline Support', 'App Store Optimization'],
    timeline: '4-12 weeks',
    priceRange: '$10K - $80K',
    gradient: 'from-green-500 to-emerald-500',
    glowClass: 'shadow-green-500/20',
    borderColor: 'border-green-500/30',
    deliverables: ['iOS App', 'Android App', 'Backend API', 'App Store Listings']
  },
  {
    icon: Brain,
    title: 'AI Solutions',
    description: 'Intelligent automation and AI-powered features that transform business operations.',
    longDescription: 'Leverage the power of AI to automate processes, gain insights, and create competitive advantages through intelligent solutions.',
    features: ['GPT Integration', 'Custom ML Models', 'Process Automation', 'Data Analytics', 'Predictive Intelligence'],
    timeline: '1-4 weeks',
    priceRange: '$3K - $25K',
    gradient: 'from-purple-500 to-pink-500',
    glowClass: 'shadow-purple-500/20',
    borderColor: 'border-purple-500/30',
    deliverables: ['AI Models', 'Integration APIs', 'Training Data', 'Performance Reports']
  },
  {
    icon: Rocket,
    title: 'Complete MVPs',
    description: 'Full-featured minimum viable products from concept to market launch.',
    longDescription: 'Turn your idea into a market-ready product with our comprehensive MVP development process, from ideation to launch.',
    features: ['Market Research', 'UI/UX Design', 'Full Development', 'Testing & QA', 'Launch Strategy'],
    timeline: '3-8 weeks',
    priceRange: '$8K - $60K',
    gradient: 'from-red-500 to-orange-500',
    glowClass: 'shadow-red-500/20',
    borderColor: 'border-red-500/30',
    deliverables: ['Complete Product', 'Brand Identity', 'Go-to-Market Plan', 'Growth Analytics']
  }
];

// Technology skills data
const techSkills = [
  { name: 'React/Next.js', level: 95, category: 'Frontend', icon: '⚛️' },
  { name: 'Node.js/Python', level: 90, category: 'Backend', icon: '🐍' },
  { name: 'TypeScript', level: 92, category: 'Languages', icon: '🔷' },
  { name: 'AWS/Cloud', level: 88, category: 'DevOps', icon: '☁️' },
  { name: 'PostgreSQL', level: 85, category: 'Database', icon: '🐘' },
  { name: 'AI/ML', level: 82, category: 'AI', icon: '🤖' },
  { name: 'Mobile Dev', level: 87, category: 'Mobile', icon: '📱' },
  { name: 'UI/UX Design', level: 90, category: 'Design', icon: '🎨' }
];

// Testimonials data
const testimonials = [
  {
    name: "Alex Thompson",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    content: "This AI governance platform is actually insane! 🔥 Automated compliance tracking just hits different. No more manual work!",
    rating: 5,
    project: "@VerifyWise",
    metrics: "100% automation"
  },
  {
    name: "Priya Sharma",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    content: "Not gonna lie, this remittance platform is absolutely fire 🚀 60% cost savings and handles 100K users daily. Built different fr",
    rating: 5,
    project: "@HamroRemittance",
    metrics: "60% cost savings"
  },
  {
    name: "Bibek Uprety",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    content: "ThreatScope lowkey changed the game for cybersecurity. Real-time OSINT detection is chef's kiss 👌 Security level: maximum",
    rating: 5,
    project: "@ThreatScope",
    metrics: "24/7 protection"
  }
];

const stats = [
  {
    icon: Rocket,
    value: '200+',
    label: 'Projects Delivered',
    sublabel: 'Across 15+ industries',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Trophy,
    value: '99%',
    label: 'Client Satisfaction',
    sublabel: '4.9/5 average rating',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    icon: TrendingUp,
    value: '10x',
    label: 'ROI Average',
    sublabel: 'Client revenue growth',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Clock,
    value: '60%',
    label: 'Faster Delivery',
    sublabel: 'Than industry average',
    gradient: 'from-purple-500 to-pink-500'
  }
];

const process = [
  {
    step: '01',
    title: 'Strategy & Discovery',
    description: 'Deep dive into your business goals, user needs, and technical requirements to craft the perfect solution.',
    duration: '1-2 days',
    icon: Target,
    features: ['Business analysis', 'User research', 'Technical planning', 'Risk assessment']
  },
  {
    step: '02',
    title: 'Design & Prototyping',
    description: 'Create stunning UI/UX designs and interactive prototypes that bring your vision to life.',
    duration: '3-5 days',
    icon: Palette,
    features: ['UI/UX design', 'Interactive prototypes', 'Design systems', 'User testing']
  },
  {
    step: '03',
    title: 'Development & Integration',
    description: 'Build your product using cutting-edge technologies with agile development and continuous integration.',
    duration: '1-6 weeks',
    icon: Code,
    features: ['Agile development', 'CI/CD pipeline', 'Quality assurance', 'Performance optimization']
  },
  {
    step: '04',
    title: 'Launch & Growth',
    description: 'Deploy to production with monitoring, analytics, and ongoing support for continuous growth.',
    duration: '1-2 days',
    icon: Sparkles,
    features: ['Production deployment', 'Performance monitoring', 'Analytics setup', 'Growth strategy']
  }
];

export default function DevelopmentServicesPage() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const [selectedProject, setSelectedProject] = useState(null)
  const [activeService, setActiveService] = useState(0)
  const [filterCategory, setFilterCategory] = useState('All')
  
  const categories = ['All', 'FinTech', 'AI/ML Platform', 'Cybersecurity', 'AI Trading']
  const filteredProjects = filterCategory === 'All' 
    ? portfolioProjects 
    : portfolioProjects.filter(project => project.category === filterCategory)
  
  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const openCalendly = () => {
    const calendlyUrl = 'https://calendly.com/aryanbimali45/threatscope-dev'
    window.open(calendlyUrl, '_blank', 'width=900,height=750,scrollbars=yes,resizable=yes')
  }

  useEffect(() => {
    // Advanced scroll animations
    gsap.fromTo('.hero-title', 
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }
    )
    
    gsap.fromTo('.hero-subtitle', 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: 'power3.out' }
    )
    
    // Portfolio cards stagger animation
    gsap.fromTo('.portfolio-card', 
      { y: 80, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.2, ease: 'power3.out' }
    )
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl px-8 py-5 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-3 group">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="relative">
                    <Shield className="h-12 w-12 text-blue-400 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity blur-xl" />
                  </div>
                  <div>
                    <span className="text-3xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">ThreatScope</span>
                    <div className="text-xs text-blue-400 opacity-75 font-mono tracking-[0.2em] uppercase">Development</div>
                  </div>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                {['Home', 'Features', 'Pricing', 'About'].map((item, index) => (
                  <Link 
                    key={item}
                    href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                    className="relative group px-4 py-2 rounded-xl transition-all duration-300"
                  >
                    <span className="relative z-10 text-slate-300 group-hover:text-white transition-colors duration-300">{item}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                ))}
                <div className="relative group px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                  <span className="text-white font-semibold">Development</span>
                  <div className="absolute -top-1 -right-1">
                    <div className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-xs text-white font-bold animate-pulse">HOT</div>
                  </div>
                </div>
              </div>

              {/* Auth Buttons */}
              <div className="hidden md:flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-4 py-2 rounded-xl border border-green-500/20">
                      <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                      <User className="h-4 w-4 text-green-400" />
                      <span className="text-white font-medium">Hey, {user?.firstName}!</span>
                    </div>
                    <NotificationCenter />
                    <Button 
                      variant="outline" 
                      className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-400/30 hover:border-blue-400 text-blue-400 hover:text-white hover:from-blue-500/20 hover:to-cyan-500/20 backdrop-blur-sm" 
                      asChild
                    >
                      <Link href="/dashboard">
                        <Settings className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-slate-400 hover:text-white hover:bg-red-500/20 backdrop-blur-sm" 
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/50 hover:border-blue-400 text-slate-200 hover:text-white backdrop-blur-sm" 
                      asChild
                    >
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300" 
                      asChild
                    >
                      <Link href="/register">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6 lg:px-8 overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-bounce" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Hero Content */}
          <div className="text-center mb-20">
            {/* Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm mb-8 group hover:scale-105 transition-all duration-300">
              <Sparkles className="h-5 w-5 mr-3 text-purple-400 group-hover:animate-spin" />
              <span className="text-sm font-bold text-purple-300 tracking-wider uppercase">✨ Premium Development Services</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Build the
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Impossible
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="hero-subtitle text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              We turn ambitious ideas into stunning digital products that users love and businesses need. 
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold"> Fast, beautiful, scalable.</span>
            </p>
            
            {/* CTA Button */}
            <div className="flex justify-center items-center mb-16">
              <Button 
                size="lg" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 text-base font-semibold shadow-xl shadow-blue-500/25 relative group"
                onClick={openCalendly}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex items-center">
                  <Calendar className="mr-3 h-5 w-5" />
                  Schedule Consultation
                  <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Button>
            </div>
          </div>
          
          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="group relative"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fade-in-up 0.6s ease-out both'
                }}
              >
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 text-center group-hover:scale-105">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r ${stat.gradient} p-3 group-hover:animate-pulse`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-white mb-2">{stat.value}</div>
                  <div className="text-sm font-semibold text-slate-300 mb-1">{stat.label}</div>
                  <div className="text-xs text-slate-400">{stat.sublabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Portfolio Section */}
      <section id="portfolio" className="relative py-24 px-6 lg:px-8 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 backdrop-blur-sm mb-6">
              <Award className="h-4 w-4 mr-2 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-300 tracking-wider uppercase">Featured Work</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Projects That
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Define Excellence
              </span>
            </h2>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Every project is a testament to our commitment to innovation, quality, and results that exceed expectations.
            </p>
          </div>

          {/* Project Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  filterCategory === category
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white/10 border border-white/20 text-slate-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Portfolio Grid */}
          <div className="space-y-20">
            {filteredProjects.map((project, index) => (
              <div 
                key={project.id}
                className={`portfolio-card grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}
              >
                {/* Project Image */}
                <div className={`relative group ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                    <Image
                      src={project.image}
                      alt={project.title}
                      width={800}
                      height={600}
                      className="w-full h-auto transition-all duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                    
                    {/* Overlay Content */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex gap-2 mb-4">
                        {project.technologies.slice(0, 3).map((tech, techIndex) => (
                          <span key={techIndex} className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                            {tech}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex gap-3">
                        <Button 
                          size="sm" 
                          className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-0 h-9 px-4 text-xs font-medium transition-all duration-200 hover:scale-105" 
                          asChild
                        >
                          <Link href={project.demoUrl}>
                            <ExternalLink className="h-3 w-3 mr-2" />
                            Live Demo
                          </Link>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 h-9 px-4 text-xs font-medium transition-all duration-200 hover:scale-105" 
                          asChild
                        >
                          <Link href={project.caseStudyUrl}>
                            Case Study
                          </Link>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl" />
                  </div>
                </div>

                {/* Project Details */}
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                  {/* Category Badge */}
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                    <Layers className="h-4 w-4 mr-2 text-purple-400" />
                    <span className="text-sm font-semibold text-purple-300">{project.category}</span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">
                    {project.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-lg text-slate-300 leading-relaxed">
                    {project.description}
                  </p>
                  
                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(project.metrics).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-2xl font-black text-white">{value}</div>
                        <div className="text-sm text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Enhanced Technologies */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Tech Stack:</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, techIndex) => {
                        const techColors = {
                          'Next.js': 'from-black to-gray-800 border-gray-600',
                          'Next.js 14': 'from-black to-gray-800 border-gray-600',
                          'React': 'from-blue-500 to-cyan-500 border-cyan-400',
                          'React 18': 'from-blue-500 to-cyan-500 border-cyan-400',
                          'TypeScript': 'from-blue-600 to-indigo-600 border-blue-400',
                          'Python': 'from-yellow-500 to-blue-600 border-blue-400',
                          'Java': 'from-red-600 to-orange-600 border-red-500',
                          'Spring Boot': 'from-green-600 to-emerald-600 border-green-500',
                          'Node.js': 'from-green-500 to-emerald-600 border-green-400',
                          'Express.js': 'from-gray-700 to-gray-900 border-gray-600',
                          'Express': 'from-gray-700 to-gray-900 border-gray-600',
                          'PostgreSQL': 'from-blue-600 to-indigo-600 border-blue-500',
                          'MongoDB': 'from-green-600 to-teal-600 border-green-500',
                          'Docker': 'from-blue-400 to-cyan-500 border-blue-400',
                          'JWT': 'from-purple-600 to-pink-600 border-purple-500',
                          'AI/ML': 'from-purple-500 to-pink-500 border-purple-400',
                          'Claude AI': 'from-orange-500 to-red-500 border-orange-400',
                          'Payment Gateway': 'from-yellow-500 to-orange-500 border-yellow-400',
                          'AWS': 'from-orange-600 to-yellow-600 border-orange-500'
                        };
                        const colorClass = techColors[tech] || 'from-slate-600 to-slate-700 border-slate-500';
                        
                        return (
                          <span 
                            key={techIndex} 
                            className={`px-3 py-1 bg-gradient-to-r ${colorClass} border rounded-lg text-sm text-white font-medium shadow-lg hover:scale-105 transition-transform duration-200`}
                          >
                            {tech}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Client Testimonial */}
                  <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl p-6 border border-slate-600/50">
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-slate-300 italic mb-3">"{project.testimonial}"</p>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-semibold text-white">{project.client}</div>
                          <div className="w-1 h-1 bg-slate-400 rounded-full" />
                          <div className="text-sm text-slate-400">{project.timeline} delivery</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Enhanced Services Section */}
      <section className="relative py-24 px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-sm mb-6">
              <Code className="h-4 w-4 mr-2 text-blue-400" />
              <span className="text-sm font-bold text-blue-300 tracking-wider uppercase">Our Services</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                What We
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Build Best
              </span>
            </h2>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              From concept to deployment, we handle every aspect of your digital product development with precision and expertise.
            </p>
          </div>

          {/* Interactive Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {services.map((service, index) => (
              <div 
                key={index}
                className={`group relative cursor-pointer transition-all duration-500 ${activeService === index ? 'scale-105' : 'hover:scale-102'}`}
                onClick={() => setActiveService(index)}
                onMouseEnter={() => setActiveService(index)}
              >
                {/* Main Card */}
                <div className={`relative overflow-hidden rounded-3xl p-8 backdrop-blur-xl bg-white/5 border transition-all duration-300 flex flex-col h-full ${activeService === index ? 'border-white/30 shadow-2xl' : 'border-white/10 hover:border-white/20'}`}>
                  
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  {/* Top Section */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className={`relative p-4 rounded-2xl bg-gradient-to-r ${service.gradient} ${service.glowClass} shadow-lg transition-all duration-300 group-hover:scale-110`}>
                        <service.icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white mb-1">{service.title}</h3>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-400 font-mono">{service.timeline}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price Range */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{service.priceRange}</div>
                      <div className="text-xs text-slate-400">Starting from</div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-slate-300 leading-relaxed mb-6">
                    {service.description}
                  </p>
                  
                  {/* Features Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className="text-sm text-slate-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Deliverables */}
                  <div className="border-t border-white/10 pt-6 flex-grow">
                    <h4 className="text-sm font-semibold text-white mb-3">What you get:</h4>
                    <div className="flex flex-wrap gap-2">
                      {service.deliverables.map((deliverable, deliverableIndex) => (
                        <span 
                          key={deliverableIndex}
                          className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white"
                        >
                          {deliverable}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <div className="mt-auto pt-6">
                    <Button 
                      className={`w-full bg-gradient-to-r ${service.gradient} hover:shadow-lg hover:${service.glowClass} transition-all duration-300 group-hover:scale-105 h-12 text-sm font-semibold`}
                      asChild
                    >
                      <Link href="/development/contact">
                        <Rocket className="mr-2 h-4 w-4" />
                        Get Started
                      </Link>
                    </Button>
                  </div>
                  
                  {/* Hover Effect */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />
                </div>
              </div>
            ))}
          </div>
          
          {/* Service Details Panel */}
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {services[activeService].title} - Deep Dive
              </h3>
              <p className="text-slate-300 max-w-2xl mx-auto">
                {services[activeService].longDescription}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Timeline</h4>
                <p className="text-slate-300">{services[activeService].timeline}</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Investment</h4>
                <p className="text-slate-300">{services[activeService].priceRange}</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Deliverables</h4>
                <p className="text-slate-300">{services[activeService].deliverables.length}+ components</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Skills Section */}
      <section className="relative py-24 px-6 lg:px-8 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 backdrop-blur-sm mb-6">
              <Cpu className="h-4 w-4 mr-2 text-cyan-400" />
              <span className="text-sm font-bold text-cyan-300 tracking-wider uppercase">Our Expertise</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Technologies We
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Master Daily
              </span>
            </h2>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Our team stays at the cutting edge of technology, constantly learning and mastering the tools that build tomorrow's digital experiences.
            </p>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techSkills.map((skill, index) => (
              <div 
                key={skill.name}
                className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 p-6 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fade-in-up 0.6s ease-out both'
                }}
              >
                {/* Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  {/* Skill Header */}
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-3">{skill.icon}</div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{skill.name}</h3>
                      <span className="text-sm text-slate-400">{skill.category}</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-300">Proficiency</span>
                      <span className="text-sm font-bold text-white">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Interactive Process Timeline */}
      <section className="relative py-24 px-6 lg:px-8 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 backdrop-blur-sm mb-6">
              <Zap className="h-4 w-4 mr-2 text-orange-400" />
              <span className="text-sm font-bold text-orange-300 tracking-wider uppercase">Our Process</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                How We Turn
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Ideas Into Reality
              </span>
            </h2>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Our proven 4-step methodology ensures your project is delivered on time, on budget, and exceeds expectations.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full hidden lg:block" />
            
            <div className="space-y-12 lg:space-y-24">
              {process.map((step, index) => (
                <div 
                  key={index}
                  className={`relative flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} flex-col`}
                >
                  {/* Step Content */}
                  <div className={`w-full lg:w-5/12 ${index % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12'}`}>
                    <div className="group relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/5 p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105">
                      {/* Background Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative z-10">
                        {/* Step Header */}
                        <div className="flex items-center mb-6">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                            <step.icon className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center mb-2">
                              <span className="text-2xl font-black text-slate-500">{step.step}</span>
                              <div className="ml-4 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
                                <span className="text-xs font-mono text-purple-300">{step.duration}</span>
                              </div>
                            </div>
                            <h3 className="text-2xl font-black text-white">{step.title}</h3>
                          </div>
                        </div>
                        
                        {/* Description */}
                        <p className="text-slate-300 leading-relaxed mb-6 text-lg">
                          {step.description}
                        </p>
                        
                        {/* Features */}
                        <div className="grid grid-cols-2 gap-3">
                          {step.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                              <span className="text-sm text-slate-300">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Node */}
                  <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-slate-900 shadow-2xl z-10">
                    <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse" />
                  </div>
                  
                  {/* Mobile Timeline Indicator */}
                  <div className="lg:hidden w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4 shadow-2xl">
                    <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-24 px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 backdrop-blur-sm mb-6">
              <Heart className="h-4 w-4 mr-2 text-pink-400" />
              <span className="text-sm font-bold text-pink-300 tracking-wider uppercase">Client Love</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                What Our Clients
              </span>
              <br />
              <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                Say About Us
              </span>
            </h2>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Real results from real businesses that trusted us with their vision.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="group relative"
                style={{
                  animationDelay: `${index * 0.2}s`,
                  animation: 'fade-in-up 0.6s ease-out both'
                }}
              >
                <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 p-6 border border-white/10 hover:border-white/20 transition-all duration-500 h-full group-hover:scale-105 flex flex-col">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Rating */}
                    <div className="flex items-center mb-3">
                      {[...Array(testimonial.rating)].map((_, starIndex) => (
                        <Star key={starIndex} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    {/* Content */}
                    <p className="text-slate-300 leading-relaxed mb-4 text-sm flex-grow">
                      "{testimonial.content}"
                    </p>
                    
                    {/* Project Info */}
                    <div className="mb-4">
                      <div className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full mb-2">
                        <span className="text-xs font-semibold text-blue-300">{testimonial.project}</span>
                      </div>
                      <div className="text-xs text-emerald-400 font-semibold">{testimonial.metrics}</div>
                    </div>
                    
                    {/* Client Info */}
                    <div className="flex items-center space-x-3 mt-auto">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={40}
                        height={40}
                        className="rounded-full border-2 border-white/20"
                      />
                      <div>
                        <div className="font-bold text-white text-sm">{testimonial.name}</div>
                        <div className="text-xs text-blue-400 font-semibold">{testimonial.project}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Enhanced CTA Section */}
      <section className="relative py-32 px-6 lg:px-8 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/30 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950 to-slate-950" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 backdrop-blur-2xl bg-gradient-to-b from-white/10 to-white/5">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-gradient-x" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
            
            <div className="relative z-10 p-12 md:p-16 text-center">
              {/* Header */}
              <div className="mb-12">
                <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 backdrop-blur-sm mb-8">
                  <Sparkles className="h-5 w-5 mr-3 text-emerald-400 animate-pulse" />
                  <span className="text-sm font-bold text-emerald-300 tracking-wider uppercase">✨ Ready to Start?</span>
                </div>
                
                <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                    Let's Build Something
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Amazing Together
                  </span>
                </h2>
                
                <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                  Join 200+ satisfied clients who chose excellence over compromise. 
                  <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent font-semibold">
                    Your success story starts here.
                  </span>
                </p>
              </div>

              {/* Value Proposition */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-white mb-2">Free Consultation</h3>
                  <p className="text-sm text-slate-400">No-obligation strategy session</p>
                </div>
                
                <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-white mb-2">24h Response</h3>
                  <p className="text-sm text-slate-400">Lightning-fast project quotes</p>
                </div>
                
                <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-white mb-2">Guaranteed Results</h3>
                  <p className="text-sm text-slate-400">100% satisfaction guarantee</p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex justify-center mb-12">
                <Button 
                  size="lg" 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 text-base font-semibold shadow-xl shadow-blue-500/25 relative group"
                  onClick={openCalendly}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 flex items-center">
                    <Calendar className="mr-3 h-5 w-5" />
                    Schedule Consultation
                    <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Button>
              </div>

            </div>

            {/* Animated Border */}
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 opacity-0 hover:opacity-20 transition-opacity duration-500 blur-xl" />
          </div>
        </div>
      </section>
    </div>
  )
}