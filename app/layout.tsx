import type { Metadata, Viewport } from 'next'
import { Inter, Pacifico } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pacifico',
})

export const metadata: Metadata = {
  title: 'NutriFuel - Nourish Your Journey',
  description:
    'Maintain your nutritional goals while traveling. AI-powered meal planning, local cuisine discovery, and real-time dietary tracking.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#018575',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${pacifico.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
