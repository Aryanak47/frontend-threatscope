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
  AlertTriangle,
  Lock,
  CheckCircle
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


export function StatsSection() {
  return (
    <section className="relative py-32 px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/95 to-slate-950" />
        <div className="absolute inset-0 cyber-grid opacity-5" />
        
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-10 left-10 w-24 h-24 glow-blue rounded-full opacity-5 float-slow" />
      <div className="absolute bottom-10 right-10 w-28 h-28 glow-green rounded-full opacity-5 float-medium" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-6">
            <Activity className="h-4 w-4 mr-2 text-green-400 animate-pulse" />
            <span className="text-sm font-semibold text-green-400 tracking-wider uppercase font-mono">Live Statistics</span>
          </div>
          
          <h2 className="heading-lg mb-6">
            <span className="text-white">Platform</span>
            <span className="text-white"> Statistics</span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Real-time metrics showcasing our platform's performance and the trust placed in us by cybersecurity professionals globally.
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
                <span className="text-white">Security & Trust</span> Metrics
              </h3>
              <p className="text-slate-300 max-w-2xl mx-auto">
                Our commitment to security and reliability, measured and verified by independent auditors.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center glass-card p-6 rounded-xl border border-white/10 group hover:ring-2 hover:ring-green-400/30 transition-all duration-500">
                <Lock className="h-10 w-10 mx-auto text-green-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-2xl font-black text-white mb-2">0</div>
                <div className="text-white font-semibold mb-1">Security Breaches</div>
                <div className="text-xs text-slate-400 font-mono uppercase">Perfect Record Since 2021</div>
              </div>
              
              <div className="text-center glass-card p-6 rounded-xl border border-white/10 group hover:ring-2 hover:ring-blue-400/30 transition-all duration-500">
                <AlertTriangle className="h-10 w-10 mx-auto text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-2xl font-black text-white mb-2">24/7</div>
                <div className="text-white font-semibold mb-1">Threat Monitoring</div>
                <div className="text-xs text-slate-400 font-mono uppercase">Continuous Surveillance</div>
              </div>
              
              <div className="text-center glass-card p-6 rounded-xl border border-white/10 group hover:ring-2 hover:ring-blue-400/30 transition-all duration-500">
                <CheckCircle className="h-10 w-10 mx-auto text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-2xl font-black text-white mb-2">100%</div>
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
