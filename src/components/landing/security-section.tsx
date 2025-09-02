import { 
  Lock, 
  Eye, 
  Server, 
  UserX,
  Shield,
  Fingerprint,
  Key
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
    description: 'Enterprise-grade infrastructure with 24/7 security monitoring and advanced threat detection.',
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


export function SecuritySection() {
  return (
    <section className="relative py-32 px-6 lg:px-8 overflow-hidden">
      {/* Enhanced Background Effects */}
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
            <Shield className="h-4 w-4 mr-2 text-green-400 animate-pulse" />
            <span className="text-sm font-semibold text-green-400 tracking-wider uppercase font-mono">Security Features</span>
          </div>
          
          <h2 className="heading-lg mb-6">
            <span className="text-white">Enterprise-Grade</span>
            <span className="text-white"> Security</span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Advanced security measures designed to protect your data and maintain the highest standards of privacy and compliance.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {securityFeatures.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card group relative overflow-hidden"
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: 'fade-in-up 0.6s ease-out both'
              }}
            >
              {/* Feature Icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center group-hover:ring-2 group-hover:ring-blue-400/30 transition-all duration-500">
                  <feature.icon className={`h-6 w-6 ${feature.gradient} group-hover:scale-110 transition-transform duration-300`} />
                </div>
                <div className="flex items-center px-2 py-1 rounded-full bg-white/5 border border-white/10">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
                  <span className="text-xs font-mono text-green-400 uppercase tracking-wider">{feature.status}</span>
                </div>
              </div>
              
              {/* Feature Content */}
              <div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-glow transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-slate-300 group-hover:text-slate-200 transition-colors duration-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              {/* Hover border effect */}
              <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-white/20 transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}