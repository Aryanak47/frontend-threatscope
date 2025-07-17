'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useSearchStore } from '@/stores/search'
import { SearchType } from '@/types'
import { SearchInterface } from '@/components/search/search-interface'
import ResultsDisplay from '@/components/ui/results-display'
import { DebugInfo } from '@/components/debug-info'
import toast from 'react-hot-toast'
import { 
  Shield, 
  ArrowLeft,
  Database,
  Clock,
  Users
} from 'lucide-react'

export default function SearchPage() {
  const { 
    performSearch, 
    results, 
    isSearching, 
    searchError, 
    clearError,
    clearResults
  } = useSearchStore()

  const handleSearch = async (query: string, type: SearchType) => {
    if (!query.trim()) {
      toast.error('Please enter a search query')
      return
    }

    try {
      console.log('🔍 [Search Page] Starting search for:', query)
      
      const searchResults = await performSearch({
        query: query.trim(),
        type,
        mode: 'exact'
      })
      
      console.log('✅ [Search Page] Search completed, results:', searchResults)
      
      // Use the returned results directly
      const resultCount = searchResults?.results?.length || 0
      console.log('📊 [Search Page] Result count:', resultCount)
      
      toast.success(`Search completed! Found ${resultCount} result${resultCount !== 1 ? 's' : ''}`)
      
    } catch (error: any) {
      console.error('❌ [Search Page] Search failed:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Search failed. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleExport = () => {
    if (!results?.results?.length) {
      toast.error('No results to export')
      return
    }
    
    // This would integrate with your export API
    toast.success('Export feature coming soon')
  }

  const handleFilter = () => {
    toast.success('Advanced filtering coming soon')
  }

  const hasResults = results && results.results && results.results.length > 0

  return (
    <div className="min-h-screen bg-background">
      {/* Debug Info */}
      <DebugInfo />
      
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center max-w-7xl mx-auto px-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-red-600" />
              <span className="text-lg font-semibold">ThreatScope Search</span>
            </div>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={clearResults}>
              Clear Results
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Advanced Threat Intelligence Search
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Search through billions of breach records and threat intelligence data. 
            Discover compromised credentials, exposed data, and security threats.
          </p>
        </div>

        {/* Search Interface */}
        <div className="max-w-4xl mx-auto mb-8">
          <SearchInterface
            onSearch={handleSearch}
            isSearching={isSearching}
            error={searchError}
            isDemo={false}
            placeholder="Enter email, username, domain, IP address, or other identifier..."
          />
        </div>

        {/* Search Results */}
        {hasResults && (
          <div className="max-w-6xl mx-auto">
            <ResultsDisplay 
              results={results.results}
              isDemo={false}
              searchQuery={results.metadata?.query || ''}
              isLoading={isSearching}
              totalResults={results.metadata?.totalResults}
              searchTime={results.metadata?.searchTime}
              onExport={handleExport}
              onFilter={handleFilter}
            />
          </div>
        )}

        {/* No Results State */}
        {results && !hasResults && !isSearching && (
          <div className="max-w-4xl mx-auto">
            <Card className="p-12 text-center">
              <div className="text-gray-500">
                <Database className="h-16 w-16 mx-auto mb-6 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
                <p className="text-lg mb-4">
                  No breaches or threat intelligence found for your search query.
                </p>
                <div className="text-sm space-y-2 max-w-md mx-auto">
                  <p>• Double-check your search term for typos</p>
                  <p>• Try a different search type (email, username, domain, etc.)</p>
                  <p>• Use broader search terms or wildcards</p>
                  <p>• Consider that no results might be good news!</p>
                </div>
                <div className="mt-8 space-x-4">
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Try Another Search
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Platform Stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8">
          <Card className="p-6 text-center">
            <Database className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-1">14B+</h3>
            <p className="text-gray-500 text-sm">Breach Records</p>
          </Card>
          
          <Card className="p-6 text-center">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-1">500+</h3>
            <p className="text-gray-500 text-sm">Data Sources</p>
          </Card>
          
          <Card className="p-6 text-center">
            <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-1">&lt;200ms</h3>
            <p className="text-gray-500 text-sm">Average Response</p>
          </Card>

          <Card className="p-6 text-center">
            <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-1">24/7</h3>
            <p className="text-gray-500 text-sm">Monitoring</p>
          </Card>
        </div>

        {/* Help Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Search Tips & Guidelines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">Search Types</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><strong>Email:</strong> Find breaches containing specific email addresses</li>
                  <li><strong>Username:</strong> Search for compromised usernames across platforms</li>
                  <li><strong>Domain:</strong> Discover breaches affecting entire domains</li>
                  <li><strong>IP Address:</strong> Find exposed IP addresses in breach data</li>
                  <li><strong>Phone:</strong> Search for compromised phone numbers</li>
                  <li><strong>Hash:</strong> Lookup password hashes and their plaintext values</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Best Practices</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Use exact matches for precise results</li>
                  <li>• Try multiple search types for comprehensive coverage</li>
                  <li>• Check spelling and format of your search terms</li>
                  <li>• Use domain searches for organizational assessments</li>
                  <li>• Regular monitoring helps catch new breaches</li>
                  <li>• Export results for further analysis and reporting</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
