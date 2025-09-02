'use client'

import { useState } from 'react'
import { SearchType } from '@/types'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { 
  Search, 
  Loader2, 
  Mail, 
  User, 
  Phone, 
  Globe, 
  Hash,
  PersonStanding,
  Shield,
  AlertTriangle,
  Crown
} from 'lucide-react'
import Link from 'next/link'

interface SearchInterfaceProps {
  onSearch: (query: string, type: SearchType) => void
  isSearching?: boolean
  error?: string | null
  isDemo?: boolean
  placeholder?: string
}

export function SearchInterface({ 
  onSearch, 
  isSearching = false, 
  error, 
  isDemo = false,
  placeholder = "Enter your search query..."
}: SearchInterfaceProps) {
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState<SearchType>('email')
  
  const { isAuthenticated } = useAuthStore()

  const searchTypes = [
    { value: 'email', label: 'Email', icon: Mail, example: 'john@example.com' },
    { value: 'username', label: 'Username', icon: User, example: 'johndoe123' },
    { value: 'phone', label: 'Phone', icon: Phone, example: '+1-555-123-4567' },
    { value: 'domain', label: 'Domain', icon: Globe, example: 'company.com' },
    { value: 'ip', label: 'IP Address', icon: Shield, example: '192.168.1.1' },
    { value: 'hash', label: 'Hash', icon: Hash, example: 'md5:5d41402abc4b2a76b9719d911017c592' },
    { value: 'name', label: 'Name', icon: PersonStanding, example: 'John Doe' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!query.trim()) return

    console.log('🔍 [Search Interface] Starting search:', { query: query.trim(), type: selectedType, isAuthenticated, isDemo })

    try {
      await onSearch(query.trim(), selectedType)
      console.log('✅ Search completed successfully!')
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  const handleQuickSearch = async (exampleQuery: string, type: SearchType) => {
    setQuery(exampleQuery)
    setSelectedType(type)
    
    try {
      await onSearch(exampleQuery, type)
      console.log('✅ Quick search completed successfully!')
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  // Simple disabled check
  const isSearchDisabled = isSearching || !query.trim()

  return (
    <div className="space-y-6">
      {/* Simple status display without usage store calls */}
      {!isAuthenticated && (
        <div className="p-4 border border-amber-500/30 bg-amber-500/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <div>
                <h3 className="font-semibold text-amber-300">Anonymous Usage</h3>
                <p className="text-sm text-amber-300">
                  Limited features - sign up for full access
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/register">
                <Crown className="h-4 w-4 mr-2" />
                Sign Up Free
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Search Interface */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
        <div className="space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Search Query {isDemo && <span className="text-blue-600">(Demo Mode)</span>}
              </label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 bg-slate-900/90 border border-slate-600 rounded-lg text-white font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500/50 focus:bg-slate-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSearching}
                  />
                </div>
                <Button 
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  size="lg"
                  disabled={isSearchDisabled}
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
              
              {/* Error Display */}
              {error && (
                <div className="mt-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  {error}
                </div>
              )}
            </div>

            {/* Search Type Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Search Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {searchTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSelectedType(type.value as SearchType)}
                      disabled={isSearching}
                      className={`p-3 border rounded-lg transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed ${
                        selectedType === type.value
                          ? 'border-red-500 bg-red-50 dark:bg-red-950'
                          : 'border-slate-600/50 bg-slate-800/30 hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-xs font-medium">{type.label}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          </form>

          {/* Quick Search Examples */}
          {isDemo && (
            <div>
              <h4 className="text-sm font-medium mb-3">Quick Demo Examples</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchTypes.slice(0, 6).map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      onClick={() => handleQuickSearch(type.example, type.value as SearchType)}
                      className="p-3 border border-slate-600/50 bg-slate-800/30 rounded-lg hover:bg-slate-700/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSearching}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <Icon className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-200">{type.label}</span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {type.example}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Search Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-700/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">14.2B+</div>
              <div className="text-xs text-slate-400">Email Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">8.1B+</div>
              <div className="text-xs text-slate-400">Username Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">2.5B+</div>
              <div className="text-xs text-slate-400">Domain Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">500+</div>
              <div className="text-xs text-slate-400">Data Sources</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
