import { 
  Users, 
  Search, 
  Shield, 
  Building2, 
  Globe, 
  Activity, 
  Zap, 
  Database,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Lock
} from 'lucide-react'

const stats = [
  {
    icon: Users,
    value: '1,000+',
    label: 'Security Professionals',
    sublabel: 'Active threat hunters',
    gradient: 'text-gradient-intelligence',
    glowClass: 'glow-blue',
    bgGradient: 'from-blue-600/10 to-blue-800/10'
  },
  {
    icon: Search,
    value: '1M+',
    label: 'Daily Threat Searches',
    sublabel: 'Queries processed',
    gradient: 'text-gradient-threat',
    glowClass: 'glow-red',
    bgGradient: 'from-red-600/10 to-red-800/10'
  },
  {
    icon: Shield,
    value: '99.99%',
    label: 'Security Uptime',
    sublabel: 'Zero breaches',
    gradient: 'text-gradient-shield',
    glowClass: 'glow-green',
    bgGradient: 'from-green-600/10 to-green-800/10'
  },
  {
    icon: Building2,
    value: '500+',
    label: 'Enterprise Clients',
    sublabel: 'Global organizations',
    gradient: 'text-gradient-cyber',
    glowClass: 'glow-purple',
    bgGradient: 'from-purple-600/10 to-purple-800/10'
  },
  {
    icon: Database,
    value: '14.2B+',
    label: 'Breach Records',
    sublabel: 'Constantly updated',
    gradient: 'text-gradient-threat',
    glowClass: 'glow-red',
    bgGradient: 'from-red-600/10 to-red-800/10'
  },
  {
    icon: Globe,
    value: '127',
    label: 'Countries Covered',
    sublabel: 'Global intelligence',
    gradient: 'text-gradient-intelligence',
    glowClass: 'glow-blue',
    bgGradient: 'from-blue-600/10 to-blue-800/10'
  },
  {
    icon: Zap,
    value: '<5ms',
    label: 'Search Latency',
    sublabel: 'Lightning response',
    gradient: 'text-gradient-shield',
    glowClass: 'glow-green',
    bgGradient: 'from-green-600/10 to-green-800/10'
  },
  {
    icon: TrendingUp,
    value: '247%',
    label: 'Threat Detection Rate',
    sublabel: 'vs industry average',
    gradient: 'text-gradient-cyber',
    glowClass: 'glow-purple',
    bgGradient: 'from-purple-600/10 to-purple-800/10'
  }
]

const achievements = [
  {
    icon: CheckCircle,
    title: 'Security Focused',
    description: 'Advanced OSINT platform built for cybersecurity professionals',
    color: 'text-green-400'
  },
  {
    icon: Shield,
    title: 'Security Excellence',
    description: 'Built with industry-standard security and best practices',
    color: 'text-blue-400'
  },
  {
    icon: Users,
    title: 'Community Choice',
    description: 'Most Trusted Platform by Cybersecurity Professionals Survey',
    color: 'text-purple-400'
  }
]

export function StatsSection() {
  return (
    <section className="relative py-32 px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950/90 to-slate-900" />
        <div className="absolute inset-0 cyber-grid opacity-5" />
        
        {/* Dynamic threat indicators */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent animate-pulse" />
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-pulse" style={{animationDelay: '2s'}} />
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-10 right-10 w-32 h-32 glow-blue rounded-full opacity-5 float-slow" />
      <div className="absolute bottom-10 left-10 w-28 h-28 glow-green rounded-full opacity-5 float-medium" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-6">
            <Activity className="h-4 w-4 mr-2 text-green-400 animate-pulse" />
            <span className="text-sm font-semibold text-green-400 tracking-wider uppercase font-mono">Live Statistics</span>
          </div>
          
          <h2 className="heading-lg mb-6">
            <span className="text-white">Trusted by </span>
            <span className="text-gradient-intelligence">Security Professionals</span>
            <span className="text-white"> Worldwide</span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Join the global community of cybersecurity experts who rely on ThreatScope for critical threat intelligence and digital investigations.
          </p>
        </div>
        
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="stats-card group relative overflow-hidden"
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: 'scale-in 0.6s ease-out both'
              }}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`h-8 w-8 ${stat.gradient} group-hover:scale-110 transition-transform duration-300`} />
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
                
                {/* Value */}
                <div className={`text-3xl md:text-4xl font-black ${stat.gradient} mb-2 group-hover:text-glow transition-all duration-300`}>
                  {stat.value}
                </div>
                
                {/* Label */}
                <div className="text-white font-semibold mb-1 group-hover:text-slate-100 transition-colors">
                  {stat.label}
                </div>
                
                {/* Sublabel */}
                <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                  {stat.sublabel}
                </div>
              </div>
              
              {/* Hover border effect */}
              <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-white/20 transition-all duration-500" />
            </div>
          ))}
        </div>
        
        {/* Achievements Section */}
        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-white mb-12">
            <span className="text-gradient-cyber">Platform</span> Capabilities
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => (
              <div 
                key={index} 
                className="feature-card text-center relative group"
                style={{
                  animationDelay: `${index * 0.2}s`,
                  animation: 'fade-in-up 0.7s ease-out both'
                }}
              >
                <div className="relative mb-6">
                  <div className="mx-auto w-16 h-16 glass-card rounded-2xl flex items-center justify-center mb-4 group-hover:glow-blue transition-all duration-500">
                    <achievement.icon className={`h-8 w-8 ${achievement.color} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                </div>
                
                <h4 className="text-xl font-bold text-white mb-3 group-hover:text-gradient-animated transition-all duration-300">
                  {achievement.title}
                </h4>
                
                <p className="text-slate-300 group-hover:text-slate-200 transition-colors duration-300">
                  {achievement.description}
                </p>
                
                {/* Achievement badge */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-black">🏆</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Trust & Security Metrics */}
        <div className="glass-card rounded-2xl p-8 border border-white/10 relative group overflow-hidden">
          {/* Background security pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full"
                 style={{
                   backgroundImage: `repeating-linear-gradient(
                     45deg,
                     transparent,
                     transparent 10px,
                     rgba(59, 130, 246, 0.1) 10px,
                     rgba(59, 130, 246, 0.1) 20px
                   )`
                 }} />
          </div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                <span className="text-gradient-shield">Security & Trust</span> Metrics
              </h3>
              <p className="text-slate-300 max-w-2xl mx-auto">
                Our commitment to security and reliability, measured and verified by independent auditors.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center glass-card p-6 rounded-xl border border-white/10 group hover:glow-green transition-all duration-500">
                <Lock className="h-10 w-10 mx-auto text-green-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-2xl font-black text-gradient-shield mb-2">0</div>
                <div className="text-white font-semibold mb-1">Security Breaches</div>
                <div className="text-xs text-slate-400 font-mono uppercase">Perfect Record Since 2021</div>
              </div>
              
              <div className="text-center glass-card p-6 rounded-xl border border-white/10 group hover:glow-blue transition-all duration-500">
                <AlertTriangle className="h-10 w-10 mx-auto text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-2xl font-black text-gradient-intelligence mb-2">24/7</div>
                <div className="text-white font-semibold mb-1">Threat Monitoring</div>
                <div className="text-xs text-slate-400 font-mono uppercase">Continuous Surveillance</div>
              </div>
              
              <div className="text-center glass-card p-6 rounded-xl border border-white/10 group hover:glow-purple transition-all duration-500">
                <CheckCircle className="h-10 w-10 mx-auto text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-2xl font-black text-gradient-cyber mb-2">100%</div>
                <div className="text-white font-semibold mb-1">Compliance Rate</div>
                <div className="text-xs text-slate-400 font-mono uppercase">All Standards Met</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
