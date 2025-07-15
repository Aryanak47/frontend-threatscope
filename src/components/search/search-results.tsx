'use client'

import { useState } from 'react'
import { SearchResult, SearchResponse } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ResultItem } from './result-item'
import { ResultsHeader } from './results-header'
import { ResultsFilters } from './results-filters'
import { ResultsPagination } from './results-pagination'
import { 
  Download, 
  Filter, 
  Grid, 
  List, 
  SortAsc, 
  SortDesc,
  Eye,
  EyeOff
} from 'lucide-react'

interface SearchResultsProps {
  results: SearchResponse | null
  isDemo?: boolean
  demoResults?: any[]
  onExport?: (format: string) => void
  onResultClick?: (result: SearchResult) => void
}

export function SearchResults({ 
  results, 
  isDemo = false, 
  demoResults = [],
  onExport,
  onResultClick
}: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'source'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    severity: [] as string[],
    sources: [] as string[],
    verified: null as boolean | null,
    dateRange: null as { start: string; end: string } | null
  })

  // Use demo results if in demo mode, otherwise use real results
  const displayResults = isDemo ? demoResults : results?.results || []
  const totalResults = isDemo ? demoResults.length : results?.metadata?.totalResults || 0
  const searchQuery = isDemo ? 'Demo Search' : results?.metadata?.query || ''

  // Filter and sort results
  const filteredResults = displayResults.filter(result => {
    // Severity filter
    if (filters.severity.length > 0 && !filters.severity.includes(result.severity)) {
      return false
    }
    
    // Source filter
    if (filters.sources.length > 0 && !filters.sources.includes(result.source)) {
      return false
    }
    
    // Verified filter
    if (filters.verified !== null && result.verified !== filters.verified) {
      return false
    }
    
    // Date range filter
    if (filters.dateRange && result.breachDate) {
      const resultDate = new Date(result.breachDate)
      const startDate = new Date(filters.dateRange.start)
      const endDate = new Date(filters.dateRange.end)
      if (resultDate < startDate || resultDate > endDate) {
        return false
      }
    }
    
    return true
  })

  // Sort results
  const sortedResults = [...filteredResults].sort((a, b) => {
    let aValue: any, bValue: any
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.breachDate || 0).getTime()
        bValue = new Date(b.breachDate || 0).getTime()
        break
      case 'severity':
        const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 }
        aValue = severityOrder[a.severity as keyof typeof severityOrder]
        bValue = severityOrder[b.severity as keyof typeof severityOrder]
        break
      case 'source':
        aValue = a.source.toLowerCase()
        bValue = b.source.toLowerCase()
        break
      default:
        return 0
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleExport = (format: string) => {
    if (onExport) {
      onExport(format)
    }
  }

  if (!results && !isDemo) {
    return null
  }

  return (
    <div className="space-y-6">
      <ResultsHeader
        query={searchQuery}
        totalResults={totalResults}
        filteredResults={filteredResults.length}
        searchTime={results?.metadata?.searchTime || 0}
        isDemo={isDemo}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:w-80">
            <ResultsFilters
              filters={filters}
              onFiltersChange={setFilters}
              availableSources={Array.from(new Set(displayResults.map(r => r.source)))}
              isDemo={isDemo}
            />
          </div>
        )}

        {/* Results Area */}
        <div className="flex-1">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
              
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === 'list' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-border rounded-md text-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="severity">Sort by Severity</option>
                <option value="source">Sort by Source</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>

              {onExport && (
                <div className="relative">
                  <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Results Display */}
          {sortedResults.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">
                {filteredResults.length === 0 ? (
                  <div>
                    <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium mb-2">No results found</p>
                    <p>Try adjusting your filters or search criteria</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">All results filtered out</p>
                    <p>Try adjusting your filters to see more results</p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <div className={`space-y-4 ${viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : ''}`}>
              {sortedResults.map((result, index) => (
                <ResultItem
                  key={result.id || index}
                  result={result}
                  viewMode={viewMode}
                  onClick={() => onResultClick && onResultClick(result)}
                  isDemo={isDemo}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {results?.metadata && (
            <div className="mt-8">
              <ResultsPagination
                currentPage={results.metadata.page}
                totalResults={results.metadata.totalResults}
                limit={results.metadata.limit}
                hasMore={results.metadata.hasMore}
                onPageChange={(page: number) => {
                  // This would trigger a new search with the new page
                  console.log('Page changed to:', page)
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
