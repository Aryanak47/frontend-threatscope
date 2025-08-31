'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  Search, 
  Database, 
  Eye, 
  Lock, 
  Zap, 
  Globe, 
  Activity, 
  Cpu, 
  AlertTriangle, 
  Target, 
  Radar,
  Users,
  Bell,
  BarChart3,
  Download,
  Network,
  Brain,
  CheckCircle
} from 'lucide-react'

export default function ThemeDemoPage() {
  const [activeDemo, setActiveDemo] = useState('buttons')

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-900" />
        <div className="absolute inset-0 network-pattern opacity-30" />
        <div className="absolute inset-0 cyber-grid opacity-15" />
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 glow-blue rounded-full opacity-20 float-slow" />
      <div className="absolute top-40 right-20 w-24 h-24 glow-red rounded-full opacity-15 float-medium" />
      <div className="absolute bottom-32 left-1/4 w-40 h-40 glow-green rounded-full opacity-10 float-fast" />
      
      <div className="relative z-10 px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 rounded-full security-badge mb-8">
              <Cpu className="h-5 w-5 mr-3 animate-pulse" />
              <span className="font-semibold tracking-wide">THREATSCOPE DARK THEME DEMO</span>
              <Target className="h-5 w-5 ml-3 animate-spin" style={{animationDuration: '8s'}} />
            </div>
            
            <h1 className="heading-xl mb-8">
              <span className="text-white">Cybersecurity </span>
              <span className="text-gradient-cyber font-black text-glow">Dark Theme</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Explore the stunning new dark theme designed for cybersecurity professionals. 
              <span className="text-gradient-intelligence font-semibold">Military-grade aesthetics</span> meet 
              <span className="text-gradient-threat font-semibold">cutting-edge design</span>.
            </p>
          </div>

          {/* Demo Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {[
              { id: 'buttons', label: 'Buttons', icon: Target },
              { id: 'cards', label: 'Cards', icon: Database },
              { id: 'effects', label: 'Effects', icon: Zap },
              { id: 'typography', label: 'Typography', icon: Eye }
            ].map((demo) => (
              <Button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id)}
                className={`glass-button ${activeDemo === demo.id ? 'glow-blue border-blue-400/50' : ''}`}
              >
                <demo.icon className="mr-2 h-4 w-4" />
                {demo.label}
              </Button>
            ))}
          </div>

          {/* Button Demos */}
          {activeDemo === 'buttons' && (
            <div className="space-y-12">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-8">
                  <span className="text-gradient-threat">Enhanced</span> Button Variants
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gradient-threat">Threat Buttons</h3>
                    <Button className="btn-threat w-full">
                      <Shield className="mr-2 h-4 w-4" />
                      Threat Detection
                    </Button>
                    <Button size="lg" className="btn-threat w-full shadow-2xl shadow-red-500/30">
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      Emergency Response
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gradient-intelligence">Intelligence Buttons</h3>
                    <Button className="btn-intelligence w-full">
                      <Search className="mr-2 h-4 w-4" />
                      Search Intelligence
                    </Button>
                    <Button size="lg" className="btn-intelligence w-full shadow-2xl shadow-blue-500/30">
                      <Database className="mr-2 h-5 w-5" />
                      Data Analysis
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gradient-shield">Shield Buttons</h3>
                    <Button className="btn-shield w-full">
                      <Lock className="mr-2 h-4 w-4" />
                      Secure Access
                    </Button>
                    <Button size="lg" className="btn-shield w-full shadow-2xl shadow-green-500/30">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Verified Secure
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gradient-cyber">Glass Buttons</h3>
                    <Button className="glass-button w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      Stealth Mode
                    </Button>
                    <Button size="lg" className="glass-button w-full hover:glow-purple">
                      <Cpu className="mr-2 h-5 w-5" />
                      Neural Network
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Typography Demo */}
          {activeDemo === 'typography' && (
            <div className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-white mb-8">
                  <span className="text-gradient-intelligence">Enhanced</span> Typography
                </h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Gradient Text Examples */}
                <div className="space-y-8">
                  <h3 className="text-xl font-bold text-white mb-6">Gradient Text Effects</h3>
                  
                  <div className="space-y-4">
                    <h1 className="text-4xl font-black text-gradient-threat">Threat Detection</h1>
                    <h1 className="text-4xl font-black text-gradient-intelligence">Intelligence Analysis</h1>
                    <h1 className="text-4xl font-black text-gradient-shield">Security Shield</h1>
                    <h1 className="text-4xl font-black text-gradient-cyber">Cyber Warfare</h1>
                    <h1 className="text-4xl font-black text-gradient-animated">Animated Gradient</h1>
                  </div>
                </div>
                
                {/* Typography Hierarchy */}
                <div className="space-y-8">
                  <h3 className="text-xl font-bold text-white mb-6">Typography Hierarchy</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h1 className="heading-xl text-white">Heading XL</h1>
                      <p className="text-slate-400 text-sm font-mono">heading-xl class</p>
                    </div>
                    
                    <div>
                      <h2 className="heading-lg text-white">Heading Large</h2>
                      <p className="text-slate-400 text-sm font-mono">heading-lg class</p>
                    </div>
                    
                    <div>
                      <h3 className="heading-md text-white">Heading Medium</h3>
                      <p className="text-slate-400 text-sm font-mono">heading-md class</p>
                    </div>
                    
                    <div>
                      <p className="text-lg text-slate-300">Body Large Text</p>
                      <p className="text-slate-400 text-sm font-mono">text-lg class</p>
                    </div>
                    
                    <div>
                      <p className="text-base text-slate-300">Body Regular Text</p>
                      <p className="text-slate-400 text-sm font-mono">text-base class</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-400">Small Text</p>
                      <p className="text-slate-400 text-sm font-mono">text-sm class</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Effects Demo */}
          {activeDemo === 'effects' && (
            <div className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-white mb-8">
                  <span className="text-gradient-cyber">Visual</span> Effects Showcase
                </h2>
              </div>
              
              {/* Glow Effects */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="glass-card p-8 rounded-2xl text-center hover:glow-red transition-all duration-500">
                  <AlertTriangle className="h-12 w-12 mx-auto text-red-400 mb-4" />
                  <h3 className="text-white font-bold mb-2">Threat Glow</h3>
                  <p className="text-slate-400 text-sm">Red security alerts</p>
                </div>
                
                <div className="glass-card p-8 rounded-2xl text-center hover:glow-blue transition-all duration-500">
                  <Database className="h-12 w-12 mx-auto text-blue-400 mb-4" />
                  <h3 className="text-white font-bold mb-2">Intel Glow</h3>
                  <p className="text-slate-400 text-sm">Blue intelligence</p>
                </div>
                
                <div className="glass-card p-8 rounded-2xl text-center hover:glow-green transition-all duration-500">
                  <Shield className="h-12 w-12 mx-auto text-green-400 mb-4" />
                  <h3 className="text-white font-bold mb-2">Shield Glow</h3>
                  <p className="text-slate-400 text-sm">Green protection</p>
                </div>
                
                <div className="glass-card p-8 rounded-2xl text-center hover:glow-purple transition-all duration-500">
                  <Brain className="h-12 w-12 mx-auto text-purple-400 mb-4" />
                  <h3 className="text-white font-bold mb-2">Cyber Glow</h3>
                  <p className="text-slate-400 text-sm">Purple AI effects</p>
                </div>
              </div>
              
              {/* Floating Animation Demo */}
              <div className="glass-card p-8 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6 text-center">Floating Animations</h3>
                <div className="flex justify-center space-x-12">
                  <div className="text-center">
                    <Cpu className="h-16 w-16 mx-auto text-blue-400 float-slow mb-4" />
                    <p className="text-slate-400 text-sm">Slow Float</p>
                  </div>
                  <div className="text-center">
                    <Radar className="h-16 w-16 mx-auto text-green-400 float-medium mb-4" />
                    <p className="text-slate-400 text-sm">Medium Float</p>
                  </div>
                  <div className="text-center">
                    <Target className="h-16 w-16 mx-auto text-red-400 float-fast mb-4" />
                    <p className="text-slate-400 text-sm">Fast Float</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cards Demo */}
          {activeDemo === 'cards' && (
            <div className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-white mb-8">
                  <span className="text-gradient-intelligence">Interactive</span> Card Components
                </h2>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                <div className="stats-card group">
                  <div className="relative">
                    <Database className="h-10 w-10 text-gradient-threat mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-3xl font-black text-gradient-threat mb-2">14.2B+</div>
                    <div className="text-slate-300 font-semibold mb-1">Breach Records</div>
                    <div className="text-xs text-slate-400 font-mono uppercase">Live Database</div>
                    <div className="absolute top-4 right-4 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  </div>
                </div>
                
                <div className="stats-card group">
                  <div className="relative">
                    <Search className="h-10 w-10 text-gradient-intelligence mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-3xl font-black text-gradient-intelligence mb-2">1M+</div>
                    <div className="text-slate-300 font-semibold mb-1">Daily Searches</div>
                    <div className="text-xs text-slate-400 font-mono uppercase">Queries Processed</div>
                    <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  </div>
                </div>
                
                <div className="stats-card group">
                  <div className="relative">
                    <Shield className="h-10 w-10 text-gradient-shield mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-3xl font-black text-gradient-shield mb-2">99.99%</div>
                    <div className="text-slate-300 font-semibold mb-1">Security Uptime</div>
                    <div className="text-xs text-slate-400 font-mono uppercase">Zero Breaches</div>
                    <div className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                </div>
                
                <div className="stats-card group">
                  <div className="relative">
                    <Brain className="h-10 w-10 text-gradient-cyber mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-3xl font-black text-gradient-cyber mb-2">AI</div>
                    <div className="text-slate-300 font-semibold mb-1">Threat Analysis</div>
                    <div className="text-xs text-slate-400 font-mono uppercase">Machine Learning</div>
                    <div className="absolute top-4 right-4 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
              
              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="feature-card group">
                  <div className="flex items-center mb-6">
                    <div className="p-4 rounded-2xl glass-card group-hover:glow-red transition-all duration-500">
                      <AlertTriangle className="h-8 w-8 text-gradient-threat group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-white mb-1">Threat Detection</h3>
                      <div className="w-12 h-0.5 bg-gradient-to-r from-red-500 to-red-400 rounded-full" />
                    </div>
                  </div>
                  <p className="text-slate-300">Advanced threat detection using machine learning and behavioral analysis.</p>
                </div>
                
                <div className="feature-card group">
                  <div className="flex items-center mb-6">
                    <div className="p-4 rounded-2xl glass-card group-hover:glow-blue transition-all duration-500">
                      <Network className="h-8 w-8 text-gradient-intelligence group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-white mb-1">Network Analysis</h3>
                      <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
                    </div>
                  </div>
                  <p className="text-slate-300">Deep network infrastructure analysis and threat correlation mapping.</p>
                </div>
                
                <div className="feature-card group">
                  <div className="flex items-center mb-6">
                    <div className="p-4 rounded-2xl glass-card group-hover:glow-green transition-all duration-500">
                      <Lock className="h-8 w-8 text-gradient-shield group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-white mb-1">Secure Platform</h3>
                      <div className="w-12 h-0.5 bg-gradient-to-r from-green-500 to-green-400 rounded-full" />
                    </div>
                  </div>
                  <p className="text-slate-300">Military-grade encryption and zero-knowledge architecture.</p>
                </div>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-20 text-center">
            <div className="glass-card rounded-2xl p-12 border border-white/10 relative group overflow-hidden max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-white mb-6">
                  Ready to Experience <span className="text-gradient-threat">ThreatScope</span>?
                </h3>
                <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                  Transform your cybersecurity operations with our cutting-edge dark theme interface, 
                  designed for elite security professionals.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="xl" className="btn-threat shadow-2xl shadow-red-500/30">
                    <Shield className="mr-2 h-6 w-6" />
                    Start Free Trial
                  </Button>
                  <Button size="xl" className="btn-intelligence shadow-2xl shadow-blue-500/30">
                    <Search className="mr-2 h-6 w-6" />
                    Live Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
