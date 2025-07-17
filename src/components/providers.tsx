'use client'

import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { useAuthStore } from '@/stores/auth'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const { refreshUser } = useAuthStore()

  useEffect(() => {
    // Initialize auth state on app start
    const token = localStorage.getItem('threatscope_token')
    if (token) {
      refreshUser()
    }
  }, [refreshUser])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}
