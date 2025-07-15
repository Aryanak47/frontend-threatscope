import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ThreatScope - Professional OSINT Platform',
  description: 'Comprehensive breach monitoring and OSINT platform for cybersecurity professionals',
  keywords: 'OSINT, breach monitoring, cybersecurity, threat intelligence, data breaches',
  authors: [{ name: 'ThreatScope Team' }],
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
  openGraph: {
    type: 'website',
    siteName: 'ThreatScope',
    title: 'ThreatScope - Professional OSINT Platform',
    description: 'Comprehensive breach monitoring and OSINT platform for cybersecurity professionals',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ThreatScope Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ThreatScope - Professional OSINT Platform',
    description: 'Comprehensive breach monitoring and OSINT platform for cybersecurity professionals',
    images: ['/og-image.png']
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
              success: {
                iconTheme: {
                  primary: 'hsl(var(--primary))',
                  secondary: 'hsl(var(--primary-foreground))',
                },
              },
              error: {
                iconTheme: {
                  primary: 'hsl(var(--destructive))',
                  secondary: 'hsl(var(--destructive-foreground))',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
