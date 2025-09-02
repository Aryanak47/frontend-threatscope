import Link from 'next/link'
import { 
  Shield, 
  Github, 
  Twitter, 
  Linkedin, 
  Mail,
  Globe,
  Lock,
  Eye,
  Activity,
  Zap,
  Database,
  Users,
  Terminal,
  Cpu
} from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/95 to-slate-900" />
        <div className="absolute inset-0 cyber-grid opacity-5" />
        
        {/* Top border effect */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
      </div>
      
      {/* Floating security elements */}
      <div className="absolute top-10 left-10 w-20 h-20 glow-blue rounded-full opacity-5 float-slow" />
      <div className="absolute bottom-10 right-10 w-24 h-24 glow-green rounded-full opacity-5 float-medium" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Enhanced Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Logo */}
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <Shield className="h-8 w-8 text-blue-400 transition-transform group-hover:scale-110 duration-300" />
                <div className="absolute inset-0 glow-blue rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              </div>
              <div>
                <span className="text-2xl font-black text-white">ThreatScope</span>
                <div className="text-xs text-blue-400 opacity-75 font-mono tracking-wider">SECURE</div>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-slate-300 leading-relaxed max-w-md">
              Cybersecurity intelligence platform with custom development services. 
              <span className="text-white font-semibold">Hunt threats</span>, {" "}
              <span className="text-white font-semibold">monitor assets</span>, and {" "}
              <span className="text-white font-semibold">stay secure</span>.
            </p>
            
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <Link href="https://github.com" className="glass-card p-3 rounded-lg hover:glow-blue transition-all duration-300 group">
                <Github className="h-5 w-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
              </Link>
              <Link href="https://twitter.com" className="glass-card p-3 rounded-lg hover:glow-blue transition-all duration-300 group">
                <Twitter className="h-5 w-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
              </Link>
              <Link href="https://linkedin.com" className="glass-card p-3 rounded-lg hover:glow-blue transition-all duration-300 group">
                <Linkedin className="h-5 w-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
              </Link>
              <Link href="mailto:contact@threatscope.com" className="glass-card p-3 rounded-lg hover:glow-red transition-all duration-300 group">
                <Mail className="h-5 w-5 text-slate-400 group-hover:text-red-400 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <Terminal className="h-5 w-5 mr-2 text-blue-400" />
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/features" className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="group-hover:text-white transition-all duration-300">Features</span>
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="group-hover:text-white transition-all duration-300">Pricing</span>
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="group-hover:text-white transition-all duration-300">API Access</span>
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="group-hover:text-white transition-all duration-300">Integrations</span>
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="group-hover:text-white transition-all duration-300">Updates</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <Database className="h-5 w-5 mr-2 text-red-400" />
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/docs" className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="group-hover:text-white transition-all duration-300">Documentation</span>
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="group-hover:text-white transition-all duration-300">OSINT Guides</span>
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="group-hover:text-white transition-all duration-300">Threat Intel Blog</span>
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="group-hover:text-white transition-all duration-300">24/7 Support</span>
                </Link>
              </li>
              <li>
                <Link href="/status" className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="group-hover:text-white transition-all duration-300">System Status</span>
                  <Activity className="h-3 w-3 ml-2 text-green-400 animate-pulse" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-400" />
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="group-hover:text-white transition-all duration-300">About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="group-hover:text-white transition-all duration-300">Contact</span>
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="group-hover:text-white transition-all duration-300">Security</span>
                  <Lock className="h-3 w-3 ml-2 text-green-400" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Enhanced Bottom Section */}
        <div className="mt-16 pt-8 border-t border-white/10">
          {/* Live Status Bar */}
          <div className="flex items-center justify-center mb-8">
            <div className="glass-card px-6 py-3 rounded-full border border-white/10">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 font-semibold">All Systems Operational</span>
                </div>
                <div className="text-slate-500">•</div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-400 font-semibold">5ms Response Time</span>
                </div>
                <div className="text-slate-500">•</div>
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-purple-400" />
                  <span className="text-purple-400 font-semibold">Last Updated: 2 min ago</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Copyright and Legal */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <p className="text-sm text-slate-400">
                © 2025 <span className="text-white font-semibold">ThreatScope</span>. All rights reserved.
              </p>
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-1 h-1 bg-slate-600 rounded-full" />
                <span className="text-xs text-slate-500 font-mono">Built with ❤️ for cybersecurity</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link href="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-slate-400 hover:text-white transition-colors duration-300">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-sm text-slate-400 hover:text-white transition-colors duration-300">
                Cookie Policy
              </Link>
            </div>
          </div>
          
          {/* Security Footer */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 glass-card px-4 py-2 rounded-lg">
                <Lock className="h-4 w-4 text-green-400" />
                <span className="text-sm text-slate-300">
                  <span className="text-green-400 font-semibold">Secured by</span> industry-standard encryption
                </span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
