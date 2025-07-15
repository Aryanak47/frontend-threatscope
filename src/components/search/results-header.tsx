'use client'

import { Clock, Database, Search, Shield } from 'lucide-react'

interface ResultsHeaderProps {
  query: string
  totalResults: number
  filteredResults: number
  searchTime: number
  isDemo?: boolean
}

export function ResultsHeader({
  query,
  totalResults,
  filteredResults,
  searchTime,
  isDemo = false
}: ResultsHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Search className="h-6 w-6" />
            Search Results
            {isDemo && (
              <span className="px-2 py-1 text-sm bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900 dark:text-blue-300">
                Demo
              </span>
            )}
          </h2>
          <p className="text-muted-foreground mt-1">
            Found {totalResults.toLocaleString()} result{totalResults !== 1 ? 's' : ''} for "{query}"
            {filteredResults !== totalResults && (
              <span> ({filteredResults.toLocaleString()} shown after filtering)</span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{searchTime}ms</span>
          </div>
          <div className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            <span>{totalResults.toLocaleString()} records</span>
          </div>
        </div>
      </div>
      
      {isDemo && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800 dark:text-blue-200">
              These are sample results for demonstration purposes. Real searches access our live database.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
