import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ThreatScope - Your Digital Shield Against Cyber Threats',
  description: 'Advanced OSINT platform for cybersecurity professionals. Hunt threats, monitor assets, and protect yourself from hackers with enterprise-grade security.',
  keywords: 'OSINT, breach monitoring, cybersecurity, threat intelligence, data breaches, dark web monitoring, threat hunting, digital security',
  authors: [{ name: 'ThreatScope Security Team' }],
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0f172a' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ],
  openGraph: {
    type: 'website',
    siteName: 'ThreatScope',
    title: 'ThreatScope - Your Digital Shield Against Cyber Threats',
    description: 'Advanced OSINT platform for cybersecurity professionals. Hunt threats, monitor assets, and protect yourself from hackers.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ThreatScope - Advanced Cybersecurity Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ThreatScope - Your Digital Shield Against Cyber Threats',
    description: 'Advanced OSINT platform for cybersecurity professionals. Hunt threats, monitor assets, and protect yourself from hackers.',
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} dark bg-slate-950 text-white scrollbar-cyber`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(15, 23, 42, 0.95)',
                color: 'white',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.2)',
              },
              success: {
                style: {
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(34, 197, 94, 0.2)',
                },
                iconTheme: {
                  primary: '#22c55e',
                  secondary: 'white',
                },
              },
              error: {
                style: {
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(239, 68, 68, 0.2)',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: 'white',
                },
              },
              loading: {
                style: {
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(168, 85, 247, 0.2)',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
