'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  Search, 
  Database, 
  Download,
  Eye,
  Zap,
  Globe,
  Activity,
  Cpu,
  Target,
  Radar,
  Network,
  Brain
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const securityAlerts = [
  {
    id: 1,
    type: "Security Breach Detected",
    status: "URGENT",
    timestamp: "Sep 02, 2025, 12:09 AM",
    compromisedAccount: "d1byadhungha@gmail.com",
    breachSource: "stealer_logs_10_07_2025",
    breachDate: "Sep 02, 2025, 12:09 AM",
    affectedDomain: "www.dropbox.com",
    passwordCompromised: "ta****bs",
    severity: "critical",
  },
  {
    id: 2,
    type: "Security Breach Detected",
    status: "URGENT",
    timestamp: "Sep 02, 2025, 12:09 AM",
    compromisedAccount: "b1bek458@gmail.com",
    breachSource: "stealer_logs_10_07_2025",
    breachDate: "Sep 02, 2025, 12:09 AM",
    affectedDomain: "www.dropbox.com",
    passwordCompromised: "ta****bs",
    severity: "critical",
  },
  {
    id: 3,
    type: "Suspicious Activity Detected",
    status: "HIGH",
    timestamp: "Sep 02, 2025, 12:08 AM",
    compromisedAccount: "user.test@company.com",
    breachSource: "network_monitoring_system",
    breachDate: "Sep 02, 2025, 12:08 AM",
    affectedDomain: "www.company-portal.com",
    passwordCompromised: "ch****21",
    severity: "high",
  },
]

function SecurityAlertCard({ alert, index }: { alert: (typeof securityAlerts)[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current) return

    // Smooth slide-in animation
    gsap.fromTo(
      cardRef.current,
      {
        y: 50,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: index * 0.2,
        ease: "power2.out",
      },
    )
  }, [index])

  const getStatusColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-300"
      case "high":
        return "bg-orange-500/20 text-orange-300"
      default:
        return "bg-yellow-500/20 text-yellow-300"
    }
  }

  const getTimelineColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      default:
        return "bg-yellow-500"
    }
  }

  return (
    <div ref={cardRef} className="relative flex items-start gap-4 mb-6">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${getTimelineColor(alert.severity)} shadow-lg`}>
          <div className="w-full h-full rounded-full animate-pulse opacity-60" />
        </div>
        <div className="w-0.5 h-16 bg-gradient-to-b from-gray-600 to-transparent mt-2" />
      </div>

      {/* Alert card */}
      <div className="flex-1 bg-gray-900/40 backdrop-blur-sm rounded-lg p-4 hover:bg-gray-800/40 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-white font-medium text-sm">{alert.type}</h3>
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(alert.severity)} mt-1`}
              >
                {alert.status}
              </span>
            </div>
          </div>
          <div className="text-gray-400 text-xs font-mono">{alert.timestamp}</div>
        </div>

        <div className="bg-red-500/10 rounded-md p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded bg-red-500/60" />
            <span className="text-red-300 font-medium text-xs">COMPROMISED ACCOUNT</span>
          </div>
          <div className="text-white font-mono text-sm">{alert.compromisedAccount}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-blue-300 font-medium block mb-1">BREACH SOURCE</span>
            <div className="text-gray-300 truncate">{alert.breachSource}</div>
          </div>
          <div>
            <span className="text-green-300 font-medium block mb-1">AFFECTED DOMAIN</span>
            <div className="text-gray-300 truncate">{alert.affectedDomain}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SecurityAlertsInterface() {
  const [alerts, setAlerts] = useState(securityAlerts)
  const [totalAlerts, setTotalAlerts] = useState(154768962)
  const [criticalAlerts, setCriticalAlerts] = useState(49323081)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const newAlert = {
        ...securityAlerts[Math.floor(Math.random() * securityAlerts.length)],
        id: Date.now(),
        timestamp: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      }

      setAlerts((prev) => [newAlert, ...prev.slice(0, 4)])
      setTotalAlerts((prev) => prev + 1)
      if (newAlert.severity === "critical") {
        setCriticalAlerts((prev) => prev + 1)
      }
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const cardHeight = 120

    const tl = gsap.timeline({ repeat: -1 })

    tl.to(container, {
      y: -cardHeight,
      duration: 4,
      ease: "power1.inOut",
    })

    tl.set(container, { y: 0 })

    return () => {
      tl.kill()
    }
  }, [])

  return (
    <div className="grid lg:grid-cols-2 gap-12 items-start">
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="text-purple-400 text-sm font-medium mb-2">// Real time intelligence</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            While attackers evolve, <span className="text-gradient-threat">ThreatScope</span> dominates the digital battlefield.
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
            We don't just observe threats - we <span className="text-white font-medium">hunt them</span>. Our AI-powered intelligence network delivers 
            instant threat detection across the deepest corners of the digital underground, 
            keeping you <span className="text-white font-medium">steps ahead</span> of cybercriminals.
          </p>
        </div>

      </div>

      <div className="relative">
        <div className="h-[600px] overflow-hidden relative">
          <div ref={scrollContainerRef} className="pr-4">
            {[...alerts, ...alerts, ...alerts].map((alert, index) => (
              <SecurityAlertCard key={`${alert.id}-${index}`} alert={alert} index={index} />
            ))}
          </div>
        </div>

        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-gray-900 via-gray-900/60 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent pointer-events-none z-10" />
      </div>
    </div>
  )
}

function DevelopmentTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null)
  const progressLineRef = useRef<HTMLDivElement>(null)
  const [currentStep, setCurrentStep] = useState(0)

  // Calendly integration
  const openCalendly = () => {
    const calendlyUrl = 'https://calendly.com/aryanbimali45/threatscope-dev'
    window.open(calendlyUrl, '_blank', 'width=900,height=750,scrollbars=yes,resizable=yes')
  }

  const services = [
    {
      id: 1,
      icon: "💻",
      title: "Web Applications",
      subtitle: "Custom Solutions",
      description: "Full-stack web applications with modern frameworks, responsive design, and enterprise-grade security.",
      tech: ["React", "Next.js", "Node.js", "PostgreSQL"],
      timeline: "3-5 days",
      color: "blue",
      features: ["Responsive Design", "API Integration", "Database Design", "Security Implementation"]
    },
    {
      id: 2,
      icon: "🤖",
      title: "AI Agents & Automation",
      subtitle: "Smart Solutions",
      description: "Intelligent AI agents with natural language processing, automated workflows, and machine learning capabilities.",
      tech: ["Python", "OpenAI", "LangChain", "AutoGen"],
      timeline: "2-4 days",
      color: "purple",
      features: ["NLP Processing", "Workflow Automation", "ML Integration", "Custom Training"]
    },
    {
      id: 3,
      icon: "🚀",
      title: "Product MVPs",
      subtitle: "Rapid Delivery",
      description: "Complete product development from concept to fully functional MVP with user authentication and payment integration.",
      tech: ["Full Stack", "Cloud Deploy", "CI/CD", "Monitoring"],
      timeline: "5-7 days",
      color: "green",
      features: ["User Authentication", "Payment Gateway", "Admin Panel", "Analytics Dashboard"]
    },
  ]

  useEffect(() => {
    if (!timelineRef.current || !progressLineRef.current) return

    const timeline = timelineRef.current
    const progressLine = progressLineRef.current
    const serviceCards = timeline.querySelectorAll(".service-card")

    // Set initial states with smoother starting positions
    gsap.set(serviceCards, { 
      opacity: 0, 
      y: 100, 
      scale: 0.7,
      rotateX: 15,
      transformPerspective: 1000 
    })
    gsap.set(progressLine, { 
      scaleY: 0,
      transformOrigin: "top center"
    })

    // Ultra-smooth main timeline animation
    ScrollTrigger.create({
      trigger: timeline,
      start: "top 80%",
      end: "bottom 20%",
      scrub: 1.5,
      ease: "none",
      onUpdate: (self) => {
        const progress = self.progress
        const smoothProgress = gsap.utils.interpolate(0, 1, progress)
        
        gsap.set(progressLine, { 
          scaleY: smoothProgress
        })
        
        // Smooth step transitions with buffer zone
        const stepProgress = smoothProgress * (services.length - 0.2)
        const newStep = Math.max(0, Math.min(Math.floor(stepProgress), services.length - 1))
        
        if (newStep !== currentStep) {
          setCurrentStep(newStep)
        }
      },
      onRefresh: () => {
        gsap.set(progressLine, { scaleY: 0 })
        gsap.set(serviceCards, { 
          opacity: 0, 
          y: 100, 
          scale: 0.7,
          rotateX: 15 
        })
      },
    })

    // Silky smooth individual card animations
    serviceCards.forEach((card, index) => {
      // Staggered reveal animation
      ScrollTrigger.create({
        trigger: card,
        start: "top 85%",
        end: "top 15%",
        scrub: 1,
        ease: "none",
        onUpdate: (self) => {
          const progress = self.progress
          const smoothProgress = gsap.utils.interpolate(0, 1, progress)
          
          gsap.set(card, {
            opacity: smoothProgress,
            y: 100 * (1 - smoothProgress),
            scale: 0.7 + (0.3 * smoothProgress),
            rotateX: 15 * (1 - smoothProgress),
            transformPerspective: 1000
          })
        }
      })

      // Entrance animation with spring physics
      ScrollTrigger.create({
        trigger: card,
        start: "top 80%",
        onEnter: () => {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 1.8,
            ease: "elastic.out(1, 0.6)",
            delay: index * 0.1
          })
        },
        onEnterBack: () => {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 1.4,
            ease: "power4.out",
            delay: index * 0.05
          })
        }
      })

      // Exit animations
      ScrollTrigger.create({
        trigger: card,
        start: "bottom 70%",
        onLeave: () => {
          gsap.to(card, {
            scale: 1.03,
            y: -10,
            duration: 1.0,
            ease: "power3.out"
          })
        },
        onLeaveBack: () => {
          gsap.to(card, {
            opacity: 0,
            y: 100,
            scale: 0.7,
            rotateX: 15,
            duration: 1.0,
            ease: "power3.in"
          })
        }
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  const getColorClasses = (color: string) => {
    return {
      icon: "text-white bg-white/10",
      dot: "bg-white",
      glow: "shadow-white/30",
      border: "border-white/20",
      gradient: "from-white/5 to-white/[0.02]"
    }
  }

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-slate-950/30 to-slate-900/20" />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-white/5 text-white px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border border-white/10">
            <Zap className="w-4 h-4" />
            DEVELOPMENT SERVICES
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            From <span className="text-white">Concept</span> to <span className="text-white">Reality</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-4xl mx-auto">
            Beyond threat intelligence, we deliver <span className="text-white font-medium">lightning-fast development services</span>. 
            Complete solutions from initial concept to production deployment in record time.
          </p>
        </div>

        {/* Timeline Container */}
        <div ref={timelineRef} className="relative">
          {/* Main Timeline Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700/30 via-gray-600/20 to-gray-700/30 transform -translate-x-1/2">
            <div
              ref={progressLineRef}
              className="w-full bg-gradient-to-b from-white/60 via-white/40 to-white/60 origin-top"
              style={{ transformOrigin: "top" }}
            />
          </div>

          {/* Service Cards */}
          <div className="space-y-48">
            {services.map((service, index) => {
              const colors = getColorClasses(service.color)
              const isActive = currentStep >= index
              const isEven = index % 2 === 0

              return (
                <div
                  key={service.id}
                  className={`service-card relative flex items-center ${
                    isEven ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  {/* Enhanced Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 z-20">
                    <div className={`relative w-5 h-5 rounded-full ${colors.dot} transition-all duration-1000 ease-out ${isActive ? 'scale-150 shadow-2xl shadow-white/50' : 'scale-100 shadow-lg'}`}>
                      <div className="absolute inset-0 rounded-full animate-pulse opacity-30" />
                      <div className={`absolute inset-[-8px] rounded-full border-2 ${colors.border} transition-all duration-1000 ease-out ${isActive ? 'opacity-100 scale-200' : 'opacity-0 scale-100'}`} />
                      <div className={`absolute inset-[-12px] rounded-full border ${colors.border} transition-all duration-1200 ease-out ${isActive ? 'opacity-60 scale-250' : 'opacity-0 scale-100'}`} />
                    </div>
                  </div>

                  {/* Service Card */}
                  <div className={`w-5/12 ${isEven ? "pr-20" : "pl-20"}`}>
                    <div className={`relative bg-gradient-to-br ${colors.gradient} backdrop-blur-sm rounded-3xl p-8 border ${colors.border} hover:border-opacity-100 hover:shadow-2xl hover:shadow-white/10 transition-all duration-700 ease-out group overflow-hidden`}>
                      {/* Card Background Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Content */}
                      <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-center mb-6">
                          <div className={`w-16 h-16 rounded-3xl ${colors.icon} flex items-center justify-center text-3xl mr-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 ease-out`}>
                            {service.icon}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-white/90 transition-colors duration-300">{service.title}</h3>
                            <p className="text-sm font-medium text-gray-400 font-mono uppercase tracking-wider group-hover:text-gray-300 transition-colors duration-300">{service.subtitle}</p>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-300 leading-relaxed mb-6">{service.description}</p>

                        {/* Tech Stack */}
                        <div className="mb-6">
                          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Tech Stack</h4>
                          <div className="flex flex-wrap gap-2">
                            {service.tech.map((tech, i) => (
                              <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-gray-300 backdrop-blur-sm">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Features */}
                        <div className="mb-6">
                          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Key Features</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {service.features.map((feature, i) => (
                              <div key={i} className="flex items-center text-sm text-gray-300">
                                <div className={`w-2 h-2 rounded-full ${colors.dot} mr-2`} />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <div className="text-sm text-gray-400">
                            Delivery Time
                          </div>
                          <div className="font-bold text-white">
                            {service.timeline}
                          </div>
                        </div>
                      </div>

                      {/* Hover Glow Effect */}
                      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${colors.gradient} blur-xl`} />
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="w-5/12" />
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Meeting CTA */}
        <div className="mt-20">
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-3xl p-8 border border-white/10 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl" />
            </div>
            
            <div className="relative z-10 text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Let's discuss your project
              </h3>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Skip the lengthy forms. Jump on a quick 15-minute call to discuss your project requirements 
                and get an instant quote.
              </p>
              
              {/* Meeting Options */}
              <div className="flex justify-center">
                {/* Calendly Button */}
                <button 
                  onClick={openCalendly}
                  className="group relative bg-white/10 hover:bg-white/20 text-white px-12 py-5 rounded-2xl transition-all duration-300 flex items-center gap-4 backdrop-blur-sm border border-white/20 hover:border-white/30 hover:shadow-2xl hover:shadow-white/10"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white">
                      <path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-lg">Schedule a Call</div>
                    <div className="text-sm text-gray-400 group-hover:text-gray-300">Pick a time that works for you</div>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-2" />
                </button>
              </div>

              {/* Quick Stats */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex justify-center items-center gap-8 text-sm">
                  <div className="text-center">
                    <div className="text-white font-bold text-lg">15min</div>
                    <div className="text-gray-400">Quick call</div>
                  </div>
                  <div className="w-px h-8 bg-white/20" />
                  <div className="text-center">
                    <div className="text-white font-bold text-lg">24hrs</div>
                    <div className="text-gray-400">Response time</div>
                  </div>
                  <div className="w-px h-8 bg-white/20" />
                  <div className="text-center">
                    <div className="text-white font-bold text-lg">Free</div>
                    <div className="text-gray-400">Consultation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const features = [
  {
    icon: Search,
    title: 'Advanced Threat Hunting',
    description: 'Multi-vector search across emails, usernames, IPs, domains, and credentials with ML-powered pattern recognition and behavioral analysis.',
    gradient: 'text-gradient-intelligence',
    glowClass: 'ring-blue-400/30',
    category: 'SEARCH'
  },
  {
    icon: Database,
    title: 'Massive Breach Database',
    description: 'Access to 14+ billion compromised records from stealer logs, credential dumps, and breach collections updated in real-time.',
    gradient: 'text-gradient-threat',
    glowClass: 'ring-red-400/30',
    category: 'DATABASE'
  },
  {
    icon: Radar,
    title: 'Real-time Threat Monitoring',
    description: 'Continuous monitoring of your digital assets with instant alerts when new threats or exposures are detected across the dark web.',
    gradient: 'text-gradient-shield',
    glowClass: 'ring-green-400/30',
    category: 'MONITORING'
  },
  {
    icon: Brain,
    title: 'AI-Powered Analytics',
    description: 'Advanced machine learning algorithms for threat correlation, risk scoring, and predictive intelligence analysis.',
    gradient: 'text-gradient-cyber',
    glowClass: 'ring-purple-400/30',
    category: 'INTELLIGENCE'
  },
  {
    icon: Download,
    title: 'Enterprise Export Suite',
    description: 'Export threat intelligence in multiple formats including STIX/TAXII, CSV, JSON, PDF reports with custom branding.',
    gradient: 'text-gradient-intelligence',
    glowClass: 'ring-blue-400/30',
    category: 'EXPORT'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Zero-trust architecture with AES-256 encryption and secure authentication for maximum privacy.',
    gradient: 'text-gradient-shield',
    glowClass: 'ring-green-400/30',
    category: 'SECURITY'
  },
  {
    icon: Network,
    title: 'Dark Web Intelligence',
    description: 'Deep and dark web monitoring with automated collection from hidden marketplaces, forums, and threat actor communications.',
    gradient: 'text-gradient-threat',
    glowClass: 'ring-red-400/30',
    category: 'DARKWEB'
  },
  {
    icon: Activity,
    title: 'Threat Attribution',
    description: 'Advanced threat actor profiling and attribution analysis using behavioral patterns and infrastructure mapping.',
    gradient: 'text-gradient-cyber',
    glowClass: 'ring-purple-400/30',
    category: 'ATTRIBUTION'
  },
  {
    icon: Globe,
    title: 'Global Threat Feeds',
    description: 'Real-time integration with government agencies, threat intelligence providers, and security vendor feeds worldwide.',
    gradient: 'text-gradient-intelligence',
    glowClass: 'ring-blue-400/30',
    category: 'FEEDS'
  }
];

export function FeaturesSection() {
  return (
    <section className="relative py-32 px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-950" />
        <div className="absolute inset-0 cyber-grid opacity-5" />
      </div>
      
      {/* Floating background elements */}
      <div className="absolute top-20 right-20 w-40 h-40 glow-blue rounded-full opacity-5 float-slow" />
      <div className="absolute bottom-20 left-20 w-32 h-32 glow-red rounded-full opacity-5 float-medium" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Real-time Detection Section */}
        <div className="mb-20">
          <SecurityAlertsInterface />
        </div>
        
        {/* Development Services Timeline */}
        <DevelopmentTimeline />
        
        {/* Call-to-Action Section */}
        <div className="mt-20 text-center">
          <div className="glass-card rounded-2xl p-8 border border-white/10 relative group overflow-hidden">
            {/* Background gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to <span className="text-white">Secure</span> Your Digital Assets?
              </h3>
              <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                Join thousands of cybersecurity professionals who trust ThreatScope for advanced threat intelligence and breach monitoring.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-xl shadow-blue-500/25" asChild>
                  <Link href="/register">
                    <Shield className="mr-2 h-5 w-5" />
                    Start Free Trial
                  </Link>
                </Button>
                <Button className="bg-green-500 hover:bg-green-600 text-white shadow-xl shadow-green-500/25" asChild>
                  <Link href="/demo">
                    <Eye className="mr-2 h-5 w-5" />
                    Watch Demo
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Animated border */}
            <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-blue-500/50 transition-colors duration-500" />
          </div>
        </div>
      </div>
    </section>
  )
}
