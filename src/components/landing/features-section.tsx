import Link from 'next/link'
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

const features = [
  {
    icon: Search,
    title: 'Advanced Threat Hunting',
    description: 'Multi-vector search across emails, usernames, IPs, domains, and credentials with ML-powered pattern recognition and behavioral analysis.',
    gradient: 'text-gradient-intelligence',
    glowClass: 'glow-blue',
    category: 'SEARCH'
  },
  {
    icon: Database,
    title: 'Massive Breach Database',
    description: 'Access to 14+ billion compromised records from stealer logs, credential dumps, and breach collections updated in real-time.',
    gradient: 'text-gradient-threat',
    glowClass: 'glow-red',
    category: 'DATABASE'
  },
  {
    icon: Radar,
    title: 'Real-time Threat Monitoring',
    description: 'Continuous monitoring of your digital assets with instant alerts when new threats or exposures are detected across the dark web.',
    gradient: 'text-gradient-shield',
    glowClass: 'glow-green',
    category: 'MONITORING'
  },
  {
    icon: Brain,
    title: 'AI-Powered Analytics',
    description: 'Advanced machine learning algorithms for threat correlation, risk scoring, and predictive intelligence analysis.',
    gradient: 'text-gradient-cyber',
    glowClass: 'glow-purple',
    category: 'INTELLIGENCE'
  },
  {
    icon: Download,
    title: 'Enterprise Export Suite',
    description: 'Export threat intelligence in multiple formats including STIX/TAXII, CSV, JSON, PDF reports with custom branding.',
    gradient: 'text-gradient-intelligence',
    glowClass: 'glow-blue',
    category: 'EXPORT'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Zero-trust architecture with AES-256 encryption, SOC 2 compliance, and secure authentication for maximum privacy.',
    gradient: 'text-gradient-shield',
    glowClass: 'glow-green',
    category: 'SECURITY'
  },
  {
    icon: Network,
    title: 'Dark Web Intelligence',
    description: 'Deep and dark web monitoring with automated collection from hidden marketplaces, forums, and threat actor communications.',
    gradient: 'text-gradient-threat',
    glowClass: 'glow-red',
    category: 'DARKWEB'
  },
  {
    icon: Activity,
    title: 'Threat Attribution',
    description: 'Advanced threat actor profiling and attribution analysis using behavioral patterns and infrastructure mapping.',
    gradient: 'text-gradient-cyber',
    glowClass: 'glow-purple',
    category: 'ATTRIBUTION'
  },
  {
    icon: Globe,
    title: 'Global Threat Feeds',
    description: 'Real-time integration with government agencies, threat intelligence providers, and security vendor feeds worldwide.',
    gradient: 'text-gradient-intelligence',
    glowClass: 'glow-blue',
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
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-6">
            <Cpu className="h-4 w-4 mr-2 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400 tracking-wider uppercase">Advanced Capabilities</span>
          </div>
          
          <h2 className="heading-lg mb-6">
            <span className="text-white">Cutting-Edge </span>
            <span className="text-gradient-cyber">Cybersecurity Arsenal</span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Military-grade threat intelligence tools designed for elite cybersecurity professionals and enterprise security teams.
          </p>
        </div>
        
        {/* Enhanced Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card relative group"
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: 'fade-in-up 0.6s ease-out both'
              }}
            >
              {/* Category Badge */}
              <div className="absolute -top-3 -right-3 z-10">
                <div className="px-2 py-1 bg-slate-800 border border-slate-600 rounded-lg text-xs font-mono text-slate-400 uppercase tracking-wider">
                  {feature.category}
                </div>
              </div>
              
              {/* Icon Container */}
              <div className="flex items-center mb-6">
                <div className={`relative p-4 rounded-2xl glass-card group-hover:${feature.glowClass} transition-all duration-500`}>
                  <feature.icon className={`h-8 w-8 ${feature.gradient} group-hover:scale-110 transition-transform duration-300`} />
                  
                  {/* Pulsing background effect */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br from-white/10 to-transparent" />
                </div>
                
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-gradient-animated transition-all duration-300">
                    {feature.title}
                  </h3>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-60 group-hover:opacity-100 group-hover:w-16 transition-all duration-500" />
                </div>
              </div>
              
              {/* Description */}
              <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                {feature.description}
              </p>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
        
        {/* Coming Soon - Developer Platform */}
        <div className="mt-24 mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-6">
              <Zap className="h-4 w-4 mr-2 text-purple-400" />
              <span className="text-sm font-semibold text-purple-400 tracking-wider uppercase">Coming Soon</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              <span className="text-gradient-cyber">Development Services</span>
            </h3>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Beyond threat intelligence, we offer rapid development services. Web applications, mobile apps, AI agents, and complete product MVPs delivered in under a week.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-xl border border-purple-500/20 relative group opacity-75">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-lg bg-purple-500/10 mr-4">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Web Applications</h4>
                  <p className="text-sm text-purple-400 font-mono">Custom Solutions</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm">Custom web applications, dashboards, and digital solutions for any industry.</p>
            </div>
            
            <div className="glass-card p-6 rounded-xl border border-blue-500/20 relative group opacity-75">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-lg bg-blue-500/10 mr-4">
                  <Brain className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">AI Agents & Automation</h4>
                  <p className="text-sm text-blue-400 font-mono">Smart Solutions</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm">Intelligent AI agents and automation solutions for business processes.</p>
            </div>
            
            <div className="glass-card p-6 rounded-xl border border-green-500/20 relative group opacity-75">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-lg bg-green-500/10 mr-4">
                  <Target className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Product MVPs</h4>
                  <p className="text-sm text-green-400 font-mono">1 Week Delivery</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm">Complete product development from concept to MVP in under a week.</p>
            </div>
          </div>
        </div>
        
        {/* Call-to-Action Section */}
        <div className="mt-20 text-center">
          <div className="glass-card rounded-2xl p-8 border border-white/10 relative group overflow-hidden">
            {/* Background gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to <span className="text-gradient-threat">Secure</span> Your Digital Assets?
              </h3>
              <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                Join thousands of cybersecurity professionals who trust ThreatScope for advanced threat intelligence and breach monitoring.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="btn-threat shadow-xl shadow-red-500/25" asChild>
                  <Link href="/register">
                    <Shield className="mr-2 h-5 w-5" />
                    Start Free Trial
                  </Link>
                </Button>
                <Button className="btn-intelligence shadow-xl shadow-blue-500/25" asChild>
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
