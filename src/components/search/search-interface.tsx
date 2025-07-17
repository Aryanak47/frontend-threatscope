'use client'

import { useState, useEffect } from 'react'
import { SearchType } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import UsageQuotaDisplay from '@/components/ui/usage-quota-display'
import { useUsageStore } from '@/stores/usage'
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
import { toast } from 'react-hot-toast'
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
  const { 
    canPerformSearch, 
    getSearchesRemaining, 
    anonymousUsage,
    incrementAnonymousUsage,
    refreshAllUsageData,
    forceRefreshUsageData
  } = useUsageStore()

  // Initialize usage data on component mount
  useEffect(() => {
    refreshAllUsageData()
  }, [refreshAllUsageData, isAuthenticated])

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

    // Check usage quota
    if (!canPerformSearch()) {
      console.warn('⚠️ [Search Interface] Search blocked - quota exceeded')
      if (isAuthenticated) {
        toast.error('Search quota exceeded. Please upgrade your plan to continue searching.', {
          duration: 5000
        })
      } else {
        toast.error('Daily search limit reached (5/5). Please sign up for unlimited searches!', {
          duration: 5000
        })
      }
      return
    }

    // Perform the search
    try {
      console.log('🔍 [Search Interface] Calling onSearch...')
      await onSearch(query.trim(), selectedType)
      console.log('✅ [Search Interface] Search completed successfully')
      
      // Update usage tracking after successful search
      if (!isAuthenticated && !isDemo) {
        incrementAnonymousUsage()
        
        // Show remaining searches to anonymous users
        const remaining = getSearchesRemaining() - 1
        if (remaining > 0) {
          toast.success(`Search completed! ${remaining} searches remaining today.`)
        } else {
          toast.warning('This was your last free search today. Sign up for unlimited access!')
        }
      } else if (isAuthenticated && !isDemo) {
        // For authenticated users, force refresh usage data from backend
        console.log('🔄 [Search Interface] Search successful, refreshing usage for authenticated user...')
        try {
          await forceRefreshUsageData()
          console.log('✅ [Search Interface] Usage data force refreshed after authenticated search')
        } catch (error) {
          console.warn('⚠️ [Search Interface] Failed to force refresh usage data after search:', error)
          // Fallback to regular refresh
          try {
            await refreshAllUsageData()
            console.log('✅ [Search Interface] Usage data refreshed (fallback) after authenticated search')
          } catch (fallbackError) {
            console.warn('⚠️ [Search Interface] Fallback refresh also failed:', fallbackError)
          }
        }
      }
      
    } catch (error) {
      // Don't increment usage if search failed
      console.error('Search failed:', error)
    }
  }

  const handleQuickSearch = async (exampleQuery: string, type: SearchType) => {
    // Check usage quota
    if (!canPerformSearch()) {
      if (isAuthenticated) {
        toast.error('Search quota exceeded. Please upgrade your plan to continue searching.', {
          duration: 5000
        })
      } else {
        toast.error('Daily search limit reached (5/5). Please sign up for unlimited searches!', {
          duration: 5000
        })
      }
      return
    }

    setQuery(exampleQuery)
    setSelectedType(type)
    
    try {
      await onSearch(exampleQuery, type)
      
      // Update usage tracking after successful search
      if (!isAuthenticated && !isDemo) {
        incrementAnonymousUsage()
        
        // Show remaining searches to anonymous users
        const remaining = getSearchesRemaining() - 1
        if (remaining > 0) {
          toast.success(`Search completed! ${remaining} searches remaining today.`)
        } else {
          toast.warning('This was your last free search today. Sign up for unlimited access!')
        }
      } else if (isAuthenticated && !isDemo) {
        // For authenticated users, force refresh usage data from backend
        try {
          await forceRefreshUsageData()
          console.log('✅ Usage data force refreshed after authenticated quick search')
        } catch (error) {
          console.warn('⚠️ Failed to force refresh usage data after quick search:', error)
          // Fallback to regular refresh
          try {
            await refreshAllUsageData()
            console.log('✅ Usage data refreshed (fallback) after authenticated quick search')
          } catch (fallbackError) {
            console.warn('⚠️ Fallback refresh also failed:', fallbackError)
          }
        }
      }
      
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  // Check if search should be disabled
  const isSearchDisabled = isSearching || !query.trim() || (!isDemo && !canPerformSearch())

  // Get current usage info for display
  const getCurrentUsageInfo = () => {
    if (isDemo) return null
    
    if (!isAuthenticated) {
      return {
        remaining: getSearchesRemaining(),
        total: anonymousUsage?.maxSearchesPerDay || 5,
        type: 'anonymous'
      }
    }
    
    return {
      remaining: getSearchesRemaining(),
      total: 0, // Will be filled by quota data
      type: 'authenticated'
    }
  }

  const usageInfo = getCurrentUsageInfo()

  return (
    <div className="space-y-6">
      {/* Usage Display - Always show something */}
      {!isAuthenticated ? (
        // Anonymous user warning with real-time usage
        <Card className={`p-4 ${
          usageInfo && usageInfo.remaining <= 1 
            ? 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800'
            : usageInfo && usageInfo.remaining <= 2
            ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800'
            : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className={`h-5 w-5 ${
                usageInfo && usageInfo.remaining <= 1 ? 'text-red-600' : 'text-yellow-600'
              }`} />
              <div>
                <h3 className={`font-semibold ${
                  usageInfo && usageInfo.remaining <= 1 
                    ? 'text-red-800 dark:text-red-200'
                    : 'text-yellow-800 dark:text-yellow-200'
                }`}>
                  Anonymous Usage
                </h3>
                <p className={`text-sm ${
                  usageInfo && usageInfo.remaining <= 1 
                    ? 'text-red-700 dark:text-red-300'
                    : 'text-yellow-700 dark:text-yellow-300'
                }`}>
                  {usageInfo ? `${usageInfo.remaining}/${usageInfo.total} searches remaining today` : 'Limited to 5 searches per day'}
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
          
          {/* Progress bar for anonymous users */}
          {usageInfo && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    usageInfo.remaining <= 1 ? 'bg-red-500' :
                    usageInfo.remaining <= 2 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${(usageInfo.remaining / usageInfo.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </Card>
      ) : isDemo ? (
        // Demo mode indicator
        <Card className="p-4 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <Search className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">Demo Mode</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You're using the demo with sample data
              </p>
            </div>
          </div>
        </Card>
      ) : (
        // Authenticated user - show full quota display
        <UsageQuotaDisplay compact />
      )}

      {/* Search Interface */}
      <Card className="p-6">
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
              
              {/* Quota Warning for users who can't search */}
              {!isDemo && !canPerformSearch() && (
                <div className="mt-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    {isAuthenticated 
                      ? 'Search quota exceeded. Upgrade your plan to continue searching.'
                      : 'Daily search limit reached. Sign up for unlimited searches!'
                    }
                  </span>
                </div>
              )}

              {/* Quota Info for users who can search */}
              {!isDemo && canPerformSearch() && usageInfo && (
                <div className="mt-2 text-xs text-gray-500">
                  {usageInfo.remaining} searches remaining today
                </div>
              )}
              
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
                          : 'border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
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
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSearching}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <Icon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {type.example}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Search Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">14.2B+</div>
              <div className="text-xs text-gray-500">Email Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">8.1B+</div>
              <div className="text-xs text-gray-500">Username Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">2.5B+</div>
              <div className="text-xs text-gray-500">Domain Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">500+</div>
              <div className="text-xs text-gray-500">Data Sources</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
