'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Search, Mail, User, Globe, Phone, Hash, ChevronDown, Loader2 } from 'lucide-react'

const searchTypes = [
  { value: 'email', label: 'Email', icon: Mail, placeholder: 'Enter email address...' },
  { value: 'username', label: 'Username', icon: User, placeholder: 'Enter username...' },
  { value: 'domain', label: 'Domain', icon: Globe, placeholder: 'Enter domain...' },
  { value: 'phone', label: 'Phone', icon: Phone, placeholder: 'Enter phone number...' },
  { value: 'ip', label: 'IP Address', icon: Hash, placeholder: 'Enter IP address...' },
  { value: 'hash', label: 'Hash', icon: Hash, placeholder: 'Enter hash...' },
]

export function SearchSection() {
  const [searchType, setSearchType] = useState(searchTypes[0])
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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
    <section className="relative py-20 px-6 lg:px-8 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Search Billions of Records
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start your investigation with our comprehensive database of breach data, 
            stealer logs, and OSINT intelligence.
          </p>
        </div>

        {/* Search Interface */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Type Selector */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-full lg:w-48 px-4 py-3 text-left bg-background border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <searchType.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{searchType.label}</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10">
                  {searchTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => {
                        setSearchType(type)
                        setIsDropdownOpen(false)
                        setQuery('') // Clear query when changing type
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      <type.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={searchType.placeholder}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-security-500 focus:border-transparent transition-all"
                disabled={isSearching}
              />
            </div>

            {/* Search Button */}
            <Button 
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              size="lg"
              variant="security"
              className="lg:px-8"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Search Examples */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">Try searching for:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'example@company.com',
                'john.doe',
                'company.com',
                '+1-555-0123',
                '192.168.1.1'
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setQuery(example)}
                  className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-full transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            🔒 Your searches are encrypted and never stored. 
            <span className="text-security-600 hover:text-security-700 cursor-pointer"> Learn more about our privacy policy</span>
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-card border border-border rounded-lg">
            <div className="text-2xl font-bold text-security-600 mb-2">14.2B+</div>
            <div className="text-sm text-muted-foreground">Breach Records</div>
          </div>
          <div className="text-center p-6 bg-card border border-border rounded-lg">
            <div className="text-2xl font-bold text-intelligence-600 mb-2">500+</div>
            <div className="text-sm text-muted-foreground">Data Sources</div>
          </div>
          <div className="text-center p-6 bg-card border border-border rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">&lt;200ms</div>
            <div className="text-sm text-muted-foreground">Average Response</div>
          </div>
        </div>
      </div>
    </section>
  )
}
