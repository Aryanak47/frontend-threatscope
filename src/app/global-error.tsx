'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the global error to console for debugging
    console.error('Global Application Error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-red-50">
          <Card className="w-full max-w-md border-red-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-red-900">
                Critical Error
              </CardTitle>
              <CardDescription className="text-red-700">
                A critical error occurred that crashed the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-md">
                  <p className="text-sm text-red-900 font-medium mb-1">
                    Error Details:
                  </p>
                  <p className="text-xs text-red-800 font-mono break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-red-700 mt-1">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={reset}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restart Application
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="w-full border-red-300 text-red-700 hover:bg-red-50"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>
              
              <div className="text-center pt-4">
                <p className="text-xs text-red-600">
                  Please refresh the page or contact support if this continues.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
