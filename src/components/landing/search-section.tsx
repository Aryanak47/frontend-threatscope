'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Mail, 
  User, 
  Globe, 
  Phone, 
  Hash, 
  ChevronDown, 
  Loader2,
  Terminal,
  Wifi,
  Database,
  Activity,
  Zap,
  Shield,
  Eye,
  Lock,
  Users
} from 'lucide-react'

const searchTypes = [
  { 
    value: 'email', 
    label: 'Email Address', 
    icon: Mail, 
    placeholder: 'user@company.com',
    gradient: 'text-gradient-threat',
    examples: ['john.doe@company.com', 'admin@target.org', 'user123@gmail.com']
  },
  { 
    value: 'username', 
    label: 'Username', 
    icon: User, 
    placeholder: 'Enter username...',
    gradient: 'text-gradient-intelligence',
    examples: ['john.doe', 'admin123', 'hacker_elite']
  },
  { 
    value: 'domain', 
    label: 'Domain', 
    icon: Globe, 
    placeholder: 'company.com',
    gradient: 'text-gradient-shield',
    examples: ['company.com', 'target.org', 'vulnerable-site.net']
  },
  { 
    value: 'phone', 
    label: 'Phone Number', 
    icon: Phone, 
    placeholder: '+1-555-0123',
    gradient: 'text-gradient-cyber',
    examples: ['+1-555-0123', '+44-20-7946-0958', '+33-1-42-86-83-26']
  },
  { 
    value: 'ip', 
    label: 'IP Address', 
    icon: Wifi, 
    placeholder: '192.168.1.1',
    gradient: 'text-gradient-intelligence',
    examples: ['192.168.1.1', '10.0.0.1', '172.16.0.1']
  },
  { 
    value: 'hash', 
    label: 'Password Hash', 
    icon: Hash, 
    placeholder: 'Enter MD5/SHA hash...',
    gradient: 'text-gradient-threat',
    examples: ['5d41402abc4b2a76b9719d911017c592', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3']
  },
]

export function SearchSection() {
  const [searchType, setSearchType] = useState(searchTypes[0])
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [currentExample, setCurrentExample] = useState(0)

  // Rotate through examples
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExample((prev) => (prev + 1) % searchType.examples.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [searchType])

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setIsSearching(true)
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSearching(false)
    
    // In real implementation, this would redirect to search results
    window.location.href = `/search?q=${encodeURIComponent(query)}&type=${searchType.value}`
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <section className="relative py-32 px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 network-pattern opacity-15" />
        
        {/* Scanning lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-400 to-transparent animate-pulse" style={{animationDelay: '1s'}} />
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-20 w-20 h-20 glow-blue rounded-full opacity-10 float-slow" />
      <div className="absolute bottom-20 right-20 w-24 h-24 glow-red rounded-full opacity-10 float-medium" />
      
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-6">
            <Terminal className="h-4 w-4 mr-2 text-green-400" />
            <span className="text-sm font-semibold text-green-400 tracking-wider uppercase font-mono">OSINT TERMINAL</span>
          </div>
          
          <h2 className="heading-lg mb-6">
            <span className="text-white">Search </span>
            <span className="text-gradient-threat">14+ Billion</span>
            <span className="text-white"> Records</span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Advanced threat hunting across the world's largest collection of breach data, stealer logs, and dark web intelligence. 
            <span className="text-gradient-intelligence font-semibold">Start your investigation now.</span>
          </p>
        </div>

        {/* Enhanced Search Interface */}
        <div className="glass-card rounded-2xl p-8 border border-white/10 relative group overflow-hidden">
          {/* Terminal header */}
          <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-white/10">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <div className="flex-1 text-center">
              <span className="text-sm font-mono text-slate-400">ThreatScope OSINT Terminal</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-mono">ONLINE</span>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Enhanced Search Type Selector */}
            <div className="relative lg:w-64">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-full px-6 py-4 glass-card rounded-xl border border-white/20 hover:border-blue-400/50 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-slate-800/50">
                    <searchType.icon className={`h-5 w-5 ${searchType.gradient}`} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white">{searchType.label}</div>
                    <div className="text-xs text-slate-400 font-mono uppercase">{searchType.value}</div>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl border border-white/20 shadow-2xl z-20 overflow-hidden">
                  {searchTypes.map((type, index) => (
                    <button
                      key={type.value}
                      onClick={() => {
                        setSearchType(type)
                        setIsDropdownOpen(false)
                        setQuery('')
                      }}
                      className="flex items-center space-x-3 w-full px-6 py-4 hover:bg-white/5 transition-all duration-300 group border-b border-white/5 last:border-b-0"
                    >
                      <div className="p-2 rounded-lg bg-slate-800/50 group-hover:bg-slate-700/50">
                        <type.icon className={`h-4 w-4 ${type.gradient}`} />
                      </div>
                      <div className="text-left flex-1">
                        <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{type.label}</div>
                        <div className="text-xs text-slate-400 font-mono">{type.value.toUpperCase()}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Search Input */}
            <div className="flex-1 relative">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  key={searchType.value}
                  className="w-full px-6 py-4 bg-slate-800/80 border border-white/30 rounded-xl text-white font-semibold placeholder:text-slate-400 focus:outline-none focus:border-blue-400/70 focus:bg-slate-800/90 focus:glow-blue transition-all duration-300 font-mono shadow-inner"
                  disabled={isSearching}
                />
                
                {/* Search type indicator */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="flex items-center space-x-2">
                    <searchType.icon className={`h-4 w-4 ${searchType.gradient}`} />
                    <span className="text-xs text-slate-400 font-mono uppercase">{searchType.value}</span>
                  </div>
                </div>
                
                {/* Typing indicator */}
                {query && (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
              
              {/* Dynamic example display */}
              {!query && (
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <span className="text-slate-500 font-mono transition-all duration-500">
                    {searchType.examples[currentExample]}
                  </span>
                </div>
              )}
            </div>

            {/* Enhanced Search Button */}
            <Button 
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              size="lg"
              className="btn-threat lg:px-10 h-16 shadow-2xl shadow-red-500/30 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center">
                {isSearching ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    <div className="text-left">
                      <div className="font-bold">Hunting...</div>
                      <div className="text-xs opacity-75">Scanning databases</div>
                    </div>
                  </>
                ) : (
                  <>
                    <Search className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-bold">Hunt Threats</div>
                      <div className="text-xs opacity-75">Search & Analyze</div>
                    </div>
                  </>
                )}
              </div>
            </Button>
          </div>

          {/* Enhanced Search Examples */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-400 font-mono uppercase tracking-wider">Quick Examples:</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-mono">LIVE DATABASE</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {searchType.examples.map((example, index) => (
                <button
                  key={example}
                  onClick={() => setQuery(example)}
                  className="px-4 py-3 glass-card rounded-lg hover:glow-blue transition-all duration-300 group text-left border border-white/10 hover:border-blue-400/30"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: 'fade-in-up 0.5s ease-out both'
                  }}
                >
                  <div className="font-mono text-white group-hover:text-blue-400 transition-colors">
                    {example}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 group-hover:text-slate-300 transition-colors">
                    Click to search
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy & Security Notice */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 text-green-400">
                <Lock className="h-4 w-4" />
                <span className="font-semibold">Encrypted Queries</span>
              </div>
              <div className="text-slate-500">•</div>
              <div className="flex items-center space-x-2 text-blue-400">
                <Eye className="h-4 w-4" />
                <span className="font-semibold">Zero Logs</span>
              </div>
              <div className="text-slate-500">•</div>
              <div className="flex items-center space-x-2 text-purple-400">
                <Shield className="h-4 w-4" />
                <span className="font-semibold">Anonymous Search</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Real-time Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="stats-card group">
            <div className="relative">
              <Database className="h-10 w-10 text-gradient-threat mb-4 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-3xl font-black text-gradient-threat mb-2 group-hover:text-glow transition-all duration-300">14.2B+</div>
              <div className="text-slate-300 font-semibold mb-1">Breach Records</div>
              <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Updated Real-time</div>
              
              {/* Live update indicator */}
              <div className="absolute top-4 right-4">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="stats-card group">
            <div className="relative">
              <Globe className="h-10 w-10 text-gradient-intelligence mb-4 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-3xl font-black text-gradient-intelligence mb-2 group-hover:text-glow transition-all duration-300">500+</div>
              <div className="text-slate-300 font-semibold mb-1">Data Sources</div>
              <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Dark Web + Surface</div>
              
              {/* Live update indicator */}
              <div className="absolute top-4 right-4">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="stats-card group">
            <div className="relative">
              <Zap className="h-10 w-10 text-gradient-shield mb-4 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-3xl font-black text-gradient-shield mb-2 group-hover:text-glow transition-all duration-300">&lt;200ms</div>
              <div className="text-slate-300 font-semibold mb-1">Query Response</div>
              <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Lightning Fast</div>
              
              {/* Live update indicator */}
              <div className="absolute top-4 right-4">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="glass-card rounded-2xl p-8 border border-white/10 relative group overflow-hidden max-w-3xl mx-auto">
            {/* Background animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-4">
                Need Help Getting Started?
              </h3>
              <p className="text-slate-300 mb-6">
                Our cybersecurity experts are standing by to assist with your threat hunting and digital investigations.
              </p>
              
              <Button className="btn-intelligence shadow-xl shadow-blue-500/25" asChild>
              <Link href="/consultation">
              <Users className="mr-2 h-5 w-5" />
              Talk to an Expert
              </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
