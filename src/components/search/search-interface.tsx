'use client'

import { useState } from 'react'
import { SearchType } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Search, 
  Loader2, 
  Mail, 
  User, 
  Phone, 
  Globe, 
  Hash,
  PersonStanding,
  Shield
} from 'lucide-react'

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

  const searchTypes = [
    { value: 'email', label: 'Email', icon: Mail, example: 'john@example.com' },
    { value: 'username', label: 'Username', icon: User, example: 'johndoe123' },
    { value: 'phone', label: 'Phone', icon: Phone, example: '+1-555-123-4567' },
    { value: 'domain', label: 'Domain', icon: Globe, example: 'company.com' },
    { value: 'ip', label: 'IP Address', icon: Shield, example: '192.168.1.1' },
    { value: 'hash', label: 'Hash', icon: Hash, example: 'md5:5d41402abc4b2a76b9719d911017c592' },
    { value: 'name', label: 'Name', icon: PersonStanding, example: 'John Doe' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim(), selectedType)
    }
  }

  const handleQuickSearch = (exampleQuery: string, type: SearchType) => {
    setQuery(exampleQuery)
    setSelectedType(type)
    onSearch(exampleQuery, type)
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Search Query {isDemo && <span className="text-security-600">(Demo Mode)</span>}
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-security-500 focus:border-transparent"
                  disabled={isSearching}
                />
              </div>
              <Button 
                type="submit"
                variant="security"
                size="lg"
                disabled={isSearching || !query.trim()}
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
                    className={`p-3 border rounded-lg transition-colors text-center ${
                      selectedType === type.value
                        ? 'border-security-500 bg-security-50 dark:bg-security-950'
                        : 'border-border hover:bg-muted/50'
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
                    className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left"
                    disabled={isSearching}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {type.example}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Search Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-security-600">14.2B+</div>
            <div className="text-xs text-muted-foreground">Email Records</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-security-600">8.1B+</div>
            <div className="text-xs text-muted-foreground">Username Records</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-security-600">2.5B+</div>
            <div className="text-xs text-muted-foreground">Domain Records</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-security-600">500+</div>
            <div className="text-xs text-muted-foreground">Data Sources</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
