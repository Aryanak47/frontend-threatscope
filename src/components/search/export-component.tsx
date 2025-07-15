'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Download, 
  FileText, 
  File, 
  FileSpreadsheet,
  FileJson,
  Loader2,
  CheckCircle
} from 'lucide-react'

interface ExportComponentProps {
  results: any[]
  isDemo?: boolean
  onExport?: (format: string, data: any[]) => Promise<void>
}

export function ExportComponent({ results, isDemo = false, onExport }: ExportComponentProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf' | 'json'>('csv')
  const [exportSuccess, setExportSuccess] = useState(false)

  const exportFormats = [
    { value: 'csv', label: 'CSV', icon: FileText, description: 'Comma-separated values' },
    { value: 'excel', label: 'Excel', icon: FileSpreadsheet, description: 'Microsoft Excel format' },
    { value: 'pdf', label: 'PDF', icon: File, description: 'Portable Document Format' },
    { value: 'json', label: 'JSON', icon: FileJson, description: 'JavaScript Object Notation' }
  ]

  const handleExport = async () => {
    if (!results || results.length === 0) {
      return
    }

    setIsExporting(true)
    setExportSuccess(false)

    try {
      if (onExport) {
        await onExport(exportFormat, results)
      } else {
        // Default export behavior for demo
        await simulateExport()
      }
      setExportSuccess(true)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const simulateExport = async () => {
    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Create and download file based on format
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `threatscope-results-${timestamp}.${exportFormat}`
    
    let content: string
    let mimeType: string

    switch (exportFormat) {
      case 'csv':
        content = convertToCSV(results)
        mimeType = 'text/csv'
        break
      case 'json':
        content = JSON.stringify(results, null, 2)
        mimeType = 'application/json'
        break
      case 'excel':
        // For demo, we'll just create a CSV and name it .xlsx
        content = convertToCSV(results)
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        break
      case 'pdf':
        // For demo, we'll create a simple text representation
        content = convertToText(results)
        mimeType = 'application/pdf'
        break
      default:
        content = JSON.stringify(results, null, 2)
        mimeType = 'application/json'
    }

    // Create and trigger download
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const convertToCSV = (data: any[]) => {
    if (!data || data.length === 0) return ''
    
    const headers = ['Source', 'Email/Target', 'Breach Date', 'Severity', 'Verified', 'Data Types']
    const rows = data.map(item => [
      item.source || '',
      item.email || item.data?.email || '',
      item.breachDate || item.data?.breachDate || '',
      item.severity || '',
      item.verified ? 'Yes' : 'No',
      (item.dataTypes || item.data?.dataTypes || []).join('; ')
    ])
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n')
  }

  const convertToText = (data: any[]) => {
    return data.map(item => `
Source: ${item.source || 'N/A'}
Target: ${item.email || item.data?.email || 'N/A'}
Breach Date: ${item.breachDate || item.data?.breachDate || 'N/A'}
Severity: ${item.severity || 'N/A'}
Verified: ${item.verified ? 'Yes' : 'No'}
Data Types: ${(item.dataTypes || item.data?.dataTypes || []).join(', ')}
${'='.repeat(50)}
    `).join('\n')
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <h3 className="font-semibold">Export Results</h3>
          {isDemo && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Demo</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {exportFormats.map((format) => {
            const Icon = format.icon
            return (
              <label key={format.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="exportFormat"
                  value={format.value}
                  checked={exportFormat === format.value}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="sr-only"
                />
                <div className={`p-3 border rounded-lg transition-colors ${
                  exportFormat === format.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:bg-muted/50'
                }`}>
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{format.label}</div>
                      <div className="text-xs text-muted-foreground">{format.description}</div>
                    </div>
                  </div>
                </div>
              </label>
            )
          })}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {results.length} results ready for export
          </div>
          
          <Button 
            onClick={handleExport}
            disabled={isExporting || !results || results.length === 0}
            className="min-w-32"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Exported
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </div>

        {exportSuccess && (
          <div className="p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded text-sm text-green-700 dark:text-green-300">
            <CheckCircle className="h-4 w-4 inline mr-1" />
            Export completed successfully!
          </div>
        )}
      </div>
    </Card>
  )
}
