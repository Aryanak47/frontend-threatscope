'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Filter, X } from 'lucide-react'

interface FiltersState {
  severity: string[]
  sources: string[]
  verified: boolean | null
  dateRange: { start: string; end: string } | null
}

interface ResultsFiltersProps {
  filters: FiltersState
  onFiltersChange: (filters: FiltersState) => void
  availableSources: string[]
  isDemo?: boolean
}

export function ResultsFilters({
  filters,
  onFiltersChange,
  availableSources,
  isDemo = false
}: ResultsFiltersProps) {
  const severityOptions = [
    { value: 'critical', label: 'Critical', color: 'text-red-600' },
    { value: 'high', label: 'High', color: 'text-red-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'low', label: 'Low', color: 'text-green-600' }
  ]

  const updateFilters = (key: keyof FiltersState, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      severity: [],
      sources: [],
      verified: null,
      dateRange: null
    })
  }

  const hasActiveFilters = 
    filters.severity.length > 0 ||
    filters.sources.length > 0 ||
    filters.verified !== null ||
    filters.dateRange !== null

  return (
    <Card className="p-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Severity Filter */}
        <div>
          <Label className="text-sm font-medium">Severity</Label>
          <div className="space-y-2 mt-2">
            {severityOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`severity-${option.value}`}
                  checked={filters.severity.includes(option.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilters('severity', [...filters.severity, option.value])
                    } else {
                      updateFilters('severity', filters.severity.filter(s => s !== option.value))
                    }
                  }}
                />
                <Label 
                  htmlFor={`severity-${option.value}`}
                  className={`text-sm ${option.color}`}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Sources Filter */}
        <div>
          <Label className="text-sm font-medium">Sources</Label>
          <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
            {availableSources.map((source) => (
              <div key={source} className="flex items-center space-x-2">
                <Checkbox
                  id={`source-${source}`}
                  checked={filters.sources.includes(source)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilters('sources', [...filters.sources, source])
                    } else {
                      updateFilters('sources', filters.sources.filter(s => s !== source))
                    }
                  }}
                />
                <Label htmlFor={`source-${source}`} className="text-sm">
                  {source}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Filter */}
        <div>
          <Label className="text-sm font-medium">Verification Status</Label>
          <div className="space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified-true"
                checked={filters.verified === true}
                onCheckedChange={(checked) => {
                  updateFilters('verified', checked ? true : null)
                }}
              />
              <Label htmlFor="verified-true" className="text-sm text-green-600">
                Verified Only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified-false"
                checked={filters.verified === false}
                onCheckedChange={(checked) => {
                  updateFilters('verified', checked ? false : null)
                }}
              />
              <Label htmlFor="verified-false" className="text-sm text-yellow-600">
                Unverified Only
              </Label>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <Label className="text-sm font-medium">Date Range</Label>
          <div className="space-y-2 mt-2">
            <div>
              <Label htmlFor="date-start" className="text-xs text-muted-foreground">
                From
              </Label>
              <Input
                id="date-start"
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => {
                  const start = e.target.value
                  updateFilters('dateRange', start ? {
                    start,
                    end: filters.dateRange?.end || ''
                  } : null)
                }}
              />
            </div>
            <div>
              <Label htmlFor="date-end" className="text-xs text-muted-foreground">
                To
              </Label>
              <Input
                id="date-end"
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => {
                  const end = e.target.value
                  updateFilters('dateRange', end ? {
                    start: filters.dateRange?.start || '',
                    end
                  } : null)
                }}
              />
            </div>
          </div>
        </div>

        {isDemo && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              Note: Filters work with demo data but may show limited results.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
