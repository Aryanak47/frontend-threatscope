import { 
  Lock, 
  Eye, 
  Server, 
  UserX,
  Shield,
  Fingerprint,
  Key,
  AlertTriangle,
  CheckCircle,
  Zap,
  Globe,
  Database
} from 'lucide-react'

const securityFeatures = [
  {
    icon: UserX,
    title: 'Secure Data Handling',
    description: 'Encrypted search sessions with secure data transmission. Your queries are protected end-to-end.',
    gradient: 'text-gradient-shield',
    glowClass: 'glow-green',
    status: 'ACTIVE'
  },
  {
    icon: Lock,
    title: 'Strong Encryption',
    description: 'AES-256 encryption for all data in transit and at rest. NSA-approved cryptographic standards.',
    gradient: 'text-gradient-intelligence',
    glowClass: 'glow-blue',
    status: 'SECURED'
  },
  {
    icon: Eye,
    title: 'Session Security',
    description: 'Time-locked sessions with automatic expiration. Secure authentication and access control.',
    gradient: 'text-gradient-cyber',
    glowClass: 'glow-purple',
    status: 'PROTECTED'
  },
  {
    icon: Server,
    title: 'Secure Infrastructure',
    description: 'SOC 2 Type II compliant infrastructure with 24/7 security monitoring and threat detection.',
    gradient: 'text-gradient-threat',
    glowClass: 'glow-red',
    status: 'MONITORED'
  },
  {
    icon: Fingerprint,
    title: 'Multi-Factor Authentication',
    description: 'Advanced MFA with biometric options, hardware tokens, and behavioral analysis.',
    gradient: 'text-gradient-intelligence',
    glowClass: 'glow-blue',
    status: 'VERIFIED'
  },
  {
    icon: Key,
    title: 'API Security',
    description: 'Rate-limited APIs with JWT tokens, IP whitelisting, and request signing for enterprise integration.',
    gradient: 'text-gradient-shield',
    glowClass: 'glow-green',
    status: 'VALIDATED'
  }
]

const complianceItems = [
  { name: 'SOC 2 Type II', status: 'Certified', color: 'text-green-400' },
  { name: 'ISO 27001', status: 'Compliant', color: 'text-blue-400' },
  { name: 'GDPR', status: 'Compliant', color: 'text-purple-400' },
  { name: 'CCPA', status: 'Compliant', color: 'text-cyan-400' },
  { name: 'HIPAA', status: 'Ready', color: 'text-yellow-400' }
]

export function SecuritySection() {
  return (
    <section className="relative py-32 px-6 lg:px-8 overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950" />
        <div className="absolute inset-0 network-pattern opacity-20" />
        <div className="absolute inset-0 cyber-grid opacity-10" />
        
        {/* Security scan lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent animate-pulse" />
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-400/50 to-transparent animate-pulse" style={{animationDelay: '1s'}} />
      </div>
      
      {/* Floating security elements */}
      <div className="absolute top-10 left-10 w-24 h-24 glow-green rounded-full opacity-10 float-slow" />
      <div className="absolute top-20 right-20 w-32 h-32 glow-blue rounded-full opacity-10 float-medium" />
      <div className="absolute bottom-20 left-1/3 w-20 h-20 glow-red rounded-full opacity-10 float-fast" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-6 group">
            <AlertTriangle className="h-4 w-4 mr-2 text-red-400 animate-pulse" />
            <span className="text-sm font-semibold text-red-400 tracking-wider uppercase">Maximum Security</span>
            <Shield className="h-4 w-4 ml-2 text-green-400" />
          </div>
          
          <h2 className="heading-lg mb-6">
            <span className="text-gradient-threat">Privacy & Security</span>
            {" "}
            <span className="text-white">First Architecture</span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Built with zero-trust principles and industry-standard security practices. Your data never leaves your control,
            {" "}
            and your searches remain completely secure and private.
          </p>
          
          {/* Security Status Dashboard */}
          <div className="glass-card rounded-2xl p-6 max-w-2xl mx-auto border border-green-500/20">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 font-semibold">All Systems Secure</span>
              </div>
              <div className="text-slate-500">|</div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-400" />
                <span className="text-blue-400 font-semibold">Threat Level: MINIMAL</span>
              </div>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Last Security Audit: PASSED • Next Review: 24 HOURS
            </div>
          </div>
        </div>
        
        {/* Enhanced Security Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {securityFeatures.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card relative group"
              style={{
                animationDelay: `${index * 0.15}s`,
                animation: 'fade-in-up 0.8s ease-out both'
              }}
            >
              {/* Status Indicator */}
              <div className="absolute -top-2 -right-2 z-20">
                <div className="flex items-center space-x-1 px-2 py-1 bg-slate-800 border border-slate-600 rounded-full text-xs">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 font-mono uppercase tracking-wide">{feature.status}</span>
                </div>
              </div>
              
              {/* Security Level Indicator */}
              <div className="absolute top-4 left-4 z-10">
                <div className="px-2 py-1 bg-slate-900/80 border border-slate-700 rounded text-xs font-mono text-slate-400 uppercase tracking-wider">
                  CLASSIFIED
                </div>
              </div>
              
              {/* Main Content */}
              <div className="pt-8">
                {/* Icon and Title */}
                <div className="flex items-center mb-6">
                  <div className={`relative p-4 rounded-2xl glass-card group-hover:${feature.glowClass} transition-all duration-500 mr-4`}>
                    <feature.icon className={`h-8 w-8 ${feature.gradient} group-hover:scale-110 transition-transform duration-300`} />
                    
                    {/* Security scan effect */}
                    <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-current opacity-0 group-hover:opacity-50 transition-all duration-500" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-gradient-animated transition-all duration-300">
                      {feature.title}
                    </h3>
                    <div className="w-full h-0.5 bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-full opacity-60 group-hover:opacity-100 transition-all duration-500" />
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
              
              {/* Security verification checkmark */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          ))}
        </div>
        
        {/* Compliance & Certifications */}
        <div className="text-center mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">
            <span className="text-gradient-shield">Compliance</span> & Certifications
          </h3>
          
          <div className="flex flex-wrap justify-center items-center gap-6">
            {complianceItems.map((item, index) => (
              <div key={index} className="glass-card px-6 py-4 rounded-xl border border-white/10 group hover:glow-green transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <CheckCircle className={`h-5 w-5 ${item.color}`} />
                  <div>
                    <div className="text-white font-semibold">{item.name}</div>
                    <div className={`text-xs ${item.color} font-mono uppercase tracking-wide`}>{item.status}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Trust Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center glass-card p-8 rounded-2xl border border-white/10 group hover:glow-blue transition-all duration-500">
            <div className="relative mb-4">
              <Database className="h-12 w-12 mx-auto text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 glow-blue rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
            </div>
            <div className="text-3xl font-black text-gradient-intelligence mb-2">0</div>
            <div className="text-slate-300 font-semibold mb-1">Data Breaches</div>
            <div className="text-xs text-slate-400 font-mono">PERFECT RECORD SINCE 2021</div>
          </div>
          
          <div className="text-center glass-card p-8 rounded-2xl border border-white/10 group hover:glow-green transition-all duration-500">
            <div className="relative mb-4">
              <Zap className="h-12 w-12 mx-auto text-green-400 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 glow-green rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
            </div>
            <div className="text-3xl font-black text-gradient-shield mb-2">99.99%</div>
            <div className="text-slate-300 font-semibold mb-1">Uptime SLA</div>
            <div className="text-xs text-slate-400 font-mono">ENTERPRISE-GRADE RELIABILITY</div>
          </div>
          
          <div className="text-center glass-card p-8 rounded-2xl border border-white/10 group hover:glow-purple transition-all duration-500">
            <div className="relative mb-4">
              <Globe className="h-12 w-12 mx-auto text-purple-400 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 glow-purple rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
            </div>
            <div className="text-3xl font-black text-gradient-cyber mb-2">&lt;5ms</div>
            <div className="text-slate-300 font-semibold mb-1">Response Time</div>
            <div className="text-xs text-slate-400 font-mono">LIGHTNING-FAST QUERIES</div>
          </div>
        </div>
        
        {/* Security Promise */}
        <div className="mt-20 text-center">
          <div className="glass-card rounded-2xl p-8 border border-green-500/20 relative group overflow-hidden max-w-4xl mx-auto">
            {/* Background security pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full"
                   style={{
                     backgroundImage: `repeating-linear-gradient(
                       45deg,
                       transparent,
                       transparent 10px,
                       rgba(34, 197, 94, 0.1) 10px,
                       rgba(34, 197, 94, 0.1) 20px
                     )`
                   }} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <Shield className="h-8 w-8 text-green-400 animate-pulse" />
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  <span className="text-gradient-shield">ThreatScope Security Guarantee</span>
                </h3>
                <Shield className="h-8 w-8 text-green-400 animate-pulse" />
              </div>
              
              <div className="space-y-4 text-left max-w-3xl mx-auto">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-slate-300">
                    <span className="text-white font-semibold">Zero Knowledge Architecture:</span> We never see your search queries or results
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-slate-300">
                    <span className="text-white font-semibold">Secure Processing:</span> All search data is encrypted during transmission and processing
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-slate-300">
                    <span className="text-white font-semibold">End-to-End Encryption:</span> Military-grade AES-256 encryption for all data transmission
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-slate-300">
                    <span className="text-white font-semibold">Audit Compliance:</span> Full compliance with SOC 2, ISO 27001, GDPR, and CCPA standards
                  </span>
                </div>
              </div>
              
              <div className="mt-8 glass-card p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                <div className="text-sm text-green-400 font-mono text-center">
                  🛡️ SECURITY COMMITMENT: Your privacy is our highest priority 🛡️
                </div>
              </div>
            </div>
            
            {/* Animated security border */}
            <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-green-500/30 transition-colors duration-500" />
          </div>
        </div>
      </div>
    </section>
  )
}