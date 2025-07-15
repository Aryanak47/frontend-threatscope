'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useSearchStore } from '@/stores/search'
import { SearchType, SearchResult } from '@/types'
import toast from 'react-hot-toast'
import { SearchInterface } from '@/components/search/search-interface'
import ResultsDisplay from '@/components/ui/results-display'
import { 
  Shield, 
  Search, 
  Database, 
  Clock,
  ArrowLeft,
  Loader2
} from 'lucide-react'

// Mock demo data - Updated with enhanced metrics
const demoSearchResults: SearchResult[] = [
  {
    id: '686f0ee82e9b69278527462',
    source: 'stealer_logs_10_07_2025',
    data: {
      login: 'siang.heartcomputer@gmail.com',
      password: 'heartcomputer9033038113',
      url: 'https://www.dropbox.com/login',
      domain: 'www.dropbox.com',
      metadata: 'https://www.dropbox.com/login siang.heartcomputer@gmail.com:heartcompu...'
    },
    timestamp: '2023-08-15T10:30:00',
    severity: 'high',
    hasPassword: true,
    isVerified: true, // Now calculated
    // Enhanced metrics
    sourceRecordsAffected: 2847593,
    sourceQualityScore: 87.3,
    sourceRiskLevel: 'HIGH',
    availableDataTypes: ['Email Address', 'Password', 'Target URL', 'Domain', 'Metadata'],
    breachDescription: 'Information stealer malware campaign targeting credentials affecting 2,847,593 accounts',
    timeline: {
      breachDate: '2023-08-15T10:30:00',
      discoveryDate: '2023-08-16T14:22:00',
      reportedDate: '2023-08-17T09:15:00',
      daysBetweenBreachAndDiscovery: 1
    }
  },
  {
    id: '686f0ee82e9b69278527463',
    source: 'stealer_logs_09_15_2025', 
    data: {
      login: 'john.player@gamesite.com',
      password: 'gaming123secure',
      url: 'https://gamesite.com/signin',
      domain: 'gamesite.com',
      metadata: 'Gaming platform login credentials'
    },
    timestamp: '2023-03-22T15:45:00',
    severity: 'medium',
    hasPassword: true,
    isVerified: true,
    // Enhanced metrics
    sourceRecordsAffected: 654821,
    sourceQualityScore: 78.9,
    sourceRiskLevel: 'MEDIUM',
    availableDataTypes: ['Email Address', 'Password', 'Target URL', 'Domain', 'Metadata'],
    breachDescription: 'Credential harvesting operation via malicious software affecting 654,821 accounts',
    timeline: {
      breachDate: '2023-03-22T15:45:00',
      discoveryDate: '2023-03-23T08:12:00',
      reportedDate: '2023-03-24T11:30:00',
      daysBetweenBreachAndDiscovery: 1
    }
  },
  {
    id: '686f0ee82e9b69278527464',
    source: 'stealer_logs_08_20_2025',
    data: {
      login: 'test.user@company.com',
      url: 'https://company.com/portal',
      domain: 'company.com',
      metadata: 'Corporate portal access attempt'
    },
    timestamp: '2023-01-10T09:15:00',
    severity: 'low',
    hasPassword: false,
    isVerified: false, // No password = lower verification
    // Enhanced metrics
    sourceRecordsAffected: 98432,
    sourceQualityScore: 45.6,
    sourceRiskLevel: 'LOW',
    availableDataTypes: ['Email Address', 'Target URL', 'Domain', 'Metadata'],
    breachDescription: 'Data theft incident from stealer malware distribution affecting 98,432 accounts',
    timeline: {
      breachDate: '2023-01-10T09:15:00',
      discoveryDate: '2023-01-12T16:45:00',
      reportedDate: '2023-01-13T10:00:00',
      daysBetweenBreachAndDiscovery: 2
    }
  }
]

export default function DemoPage() {
  const { 
    performSearch, 
    results, 
    isSearching, 
    searchError, 
    selectedSearchType, 
    setSearchType,
    clearError
  } = useSearchStore()
   const [searchQuery, setSearchQuery] = useState('')
  const [isDemo, setIsDemo] = useState(true) // Toggle between demo and real search
  const [showDemoResults, setShowDemoResults] = useState(false)
  
  const showResults = isDemo ? showDemoResults : (results && results.results.length > 0)

  const handleDemoSearch = (query: string, type: SearchType) => {
    setSearchQuery(query)
    setShowDemoResults(true)
  }

  const handleRealSearch = async (query: string, type: SearchType) => {
    if (!query.trim()) {
      toast.error('Please enter a search query')
      return
    }

    try {
      await performSearch({
        query,
        type,
        mode: 'exact'
      })
      toast.success(`Found ${results?.results.length || 0} results`)
    } catch (error) {
      toast.error('Search failed. Please try again.')
    }
  }

  const handleSearch = (query: string, type: SearchType) => {
    if (isDemo) {
      handleDemoSearch(query, type)
    } else {
      handleRealSearch(query, type)
    }
  }

  return (
    <div className="min-h-screen bg-background">
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
              <Shield className="h-6 w-6 text-security-600" />
              <span className="text-lg font-semibold">ThreatScope Demo</span>
            </div>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Mode:</span>
              <Button 
                variant={isDemo ? "security" : "outline"} 
                size="sm"
                onClick={() => setIsDemo(true)}
              >
                Demo
              </Button>
              <Button 
                variant={!isDemo ? "security" : "outline"} 
                size="sm"
                onClick={() => setIsDemo(false)}
              >
                Live Search
              </Button>
            </div>
            <Button variant="security" asChild>
              <Link href="/register">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-6 py-12">
        {/* Demo Introduction */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Interactive Platform Demo
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Experience the power of ThreatScope with our interactive demo. 
            See how easy it is to search billions of records and uncover threats.
          </p>
        </div>

        {/* Demo Interface */}
        <div className="max-w-4xl mx-auto">
          <SearchInterface
            onSearch={handleSearch}
            isSearching={isSearching}
            error={searchError}
            isDemo={isDemo}
            placeholder={isDemo ? "Try: john.doe@company.com" : "Enter your search query..."}
          />

          {/* Search Results */}
          {showResults && (
            <ResultsDisplay 
              results={isDemo ? demoSearchResults : results?.results || []}
              isDemo={isDemo}
              searchQuery={searchQuery || (isDemo ? 'john.doe@company.com' : '')}
              isLoading={isSearching}
              totalResults={isDemo ? demoSearchResults.length : results?.metadata?.totalResults}
              searchTime={isDemo ? 156 : results?.metadata?.searchTime}
              onExport={() => {
                toast.success('Export functionality will be implemented soon')
              }}
              onFilter={() => {
                toast.success('Filter functionality will be implemented soon')
              }}
            />
          )}
        </div>

        {/* Demo Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 text-center">
            <Database className="h-12 w-12 text-security-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">14B+ Records</h3>
            <p className="text-muted-foreground">
              Search across billions of breach records from 500+ sources
            </p>
          </Card>
          
          <Card className="p-6 text-center">
            <Clock className="h-12 w-12 text-intelligence-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">&lt;200ms Response</h3>
            <p className="text-muted-foreground">
              Lightning-fast search results with advanced indexing
            </p>
          </Card>
          
          <Card className="p-6 text-center">
            <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Zero Retention</h3>
            <p className="text-muted-foreground">
              Your searches are ephemeral and never stored
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Investigation?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get full access to ThreatScope's comprehensive OSINT platform. 
            Start your free trial today and protect your digital assets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="security" asChild>
              <Link href="/register">
                Start Free Trial
                <Shield className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
